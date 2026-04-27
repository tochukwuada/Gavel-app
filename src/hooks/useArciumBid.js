import { useCallback } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import {
  PublicKey,
  TransactionInstruction,
  Transaction,
  SystemProgram,
} from '@solana/web3.js';
import { AnchorProvider, BN } from '@coral-xyz/anchor';
import { sha256 } from '@noble/hashes/sha2';

const PROGRAM_ID = new PublicKey('CHFR2eD8dmZ5NM7UbwM7nWFVTfWPpdtKfv6H4Bgtha3e');
const ARCIUM_PROGRAM_ID = new PublicKey('Arcj82pX7HxYKLR92qvgZUAd7vGS1k4hQvAFcPATFdEQ');

// SHA256("global:place_bid")[:8]
const PLACE_BID_DISC = Uint8Array.from([238, 77, 148, 91, 200, 151, 92, 146]);

// sign_pda_account seed
const SIGN_PDA_SEED = Buffer.from('ArciumSignerAccount');

function getCompDefOffset(circuitName) {
  const hash = sha256(Buffer.from(circuitName, 'utf-8'));
  return Buffer.from(hash).readUInt32LE(0);
}

export function useArciumBid() {
  const { publicKey, sendTransaction, signTransaction, signAllTransactions } = useWallet();
  const { connection } = useConnection();

  const submitBid = useCallback(async (auctionPubkeyStr, bidAmountLamports, onStatus) => {
    if (!publicKey) throw new Error('Wallet not connected');

    // Dynamic import so @arcium-hq/client Node.js internals are never evaluated on page load
    const {
      getMXEPublicKey,
      getMXEAccAddress,
      getMempoolAccAddress,
      getExecutingPoolAccAddress,
      getComputationAccAddress,
      getCompDefAccAddress,
      getClusterAccAddress,
      getFeePoolAccAddress,
      getClockAccAddress,
      awaitComputationFinalization,
      getArciumProgram,
      x25519,
      RescueCipher,
      deserializeLE,
    } = await import('@arcium-hq/client');

    function splitPubkeyToU128s(pubkeyBytes) {
      return {
        lo: deserializeLE(pubkeyBytes.slice(0, 16)),
        hi: deserializeLE(pubkeyBytes.slice(16, 32)),
      };
    }

    function buildPlaceBidData(computationOffset, ciphertext, ephemeralPub, nonce) {
      // Borsh layout: disc(8) + u64(8) + [u8;32](32) × 3 + [u8;32](32) + u128(16) = 160 bytes
      const buf = Buffer.alloc(160);
      let off = 0;

      PLACE_BID_DISC.forEach((b, i) => buf.writeUInt8(b, off + i));
      off += 8;

      const compOffLE = computationOffset.toArrayLike(Buffer, 'le', 8);
      compOffLE.copy(buf, off);
      off += 8;

      for (const block of ciphertext) {
        Buffer.from(block).copy(buf, off);
        off += 32;
      }

      Buffer.from(ephemeralPub).copy(buf, off);
      off += 32;

      const nonceBN = new BN(deserializeLE(nonce).toString());
      nonceBN.toArrayLike(Buffer, 'le', 16).copy(buf, off);

      return buf;
    }

    const auctionPubkey = new PublicKey(auctionPubkeyStr);

    const provider = new AnchorProvider(
      connection,
      { publicKey, signTransaction, signAllTransactions },
      { commitment: 'confirmed' },
    );

    // ── 1. Fetch MXE key & encrypt ─────────────────────────────────────────
    onStatus('encrypting');

    const mxePublicKey = await getMXEPublicKey(provider, PROGRAM_ID);
    if (!mxePublicKey) throw new Error('MXE public key not available — is the program deployed?');

    const ephemeralPriv = x25519.utils.randomSecretKey();
    const ephemeralPub = x25519.getPublicKey(ephemeralPriv);
    const sharedSecret = x25519.getSharedSecret(ephemeralPriv, mxePublicKey);

    const cipher = new RescueCipher(sharedSecret);
    const { lo: bidderLo, hi: bidderHi } = splitPubkeyToU128s(publicKey.toBytes());

    const nonce = new Uint8Array(16);
    globalThis.crypto.getRandomValues(nonce);

    const ciphertext = cipher.encrypt([bidderLo, bidderHi, BigInt(bidAmountLamports)], nonce);

    const computationOffsetBytes = new Uint8Array(8);
    globalThis.crypto.getRandomValues(computationOffsetBytes);
    const computationOffset = new BN(Buffer.from(computationOffsetBytes), 'le');

    // ── 2. Derive accounts ─────────────────────────────────────────────────
    const [signPdaAccount] = PublicKey.findProgramAddressSync([SIGN_PDA_SEED], PROGRAM_ID);

    const arciumProgram = getArciumProgram(provider);
    const mxeAccAddress = getMXEAccAddress(PROGRAM_ID);
    const mxeAcc = await arciumProgram.account.mxeAccount.fetch(mxeAccAddress, 'confirmed');
    const clusterOffset = mxeAcc.cluster;

    const mempoolAccount = getMempoolAccAddress(clusterOffset);
    const executingPool = getExecutingPoolAccAddress(clusterOffset);
    const computationAccount = getComputationAccAddress(clusterOffset, computationOffset);
    const compDefAccount = getCompDefAccAddress(PROGRAM_ID, getCompDefOffset('place_bid'));
    const clusterAccount = getClusterAccAddress(clusterOffset);
    const poolAccount = getFeePoolAccAddress();
    const clockAccount = getClockAccAddress();

    // ── 3. Build & send transaction ────────────────────────────────────────
    onStatus('submitting');

    const ixData = buildPlaceBidData(computationOffset, ciphertext, ephemeralPub, nonce);

    const ix = new TransactionInstruction({
      programId: PROGRAM_ID,
      keys: [
        { pubkey: publicKey,          isSigner: true,  isWritable: true  }, // bidder
        { pubkey: auctionPubkey,      isSigner: false, isWritable: true  }, // auction
        { pubkey: signPdaAccount,     isSigner: false, isWritable: true  }, // sign_pda_account
        { pubkey: mxeAccAddress,      isSigner: false, isWritable: false }, // mxe_account
        { pubkey: mempoolAccount,     isSigner: false, isWritable: true  }, // mempool_account
        { pubkey: executingPool,      isSigner: false, isWritable: true  }, // executing_pool
        { pubkey: computationAccount, isSigner: false, isWritable: true  }, // computation_account
        { pubkey: compDefAccount,     isSigner: false, isWritable: false }, // comp_def_account
        { pubkey: clusterAccount,     isSigner: false, isWritable: true  }, // cluster_account
        { pubkey: poolAccount,        isSigner: false, isWritable: true  }, // pool_account
        { pubkey: clockAccount,       isSigner: false, isWritable: true  }, // clock_account
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }, // system_program
        { pubkey: ARCIUM_PROGRAM_ID,  isSigner: false, isWritable: false }, // arcium_program
      ],
      data: ixData,
    });

    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
    const tx = new Transaction({ recentBlockhash: blockhash, feePayer: publicKey });
    tx.add(ix);

    const sig = await sendTransaction(tx, connection, { skipPreflight: true });
    await connection.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight }, 'confirmed');

    // ── 4. Await MPC finalization ──────────────────────────────────────────
    onStatus('finalizing');

    await awaitComputationFinalization(provider, computationOffset, PROGRAM_ID, 'confirmed');

    return sig;
  }, [publicKey, sendTransaction, signTransaction, signAllTransactions, connection]);

  return { submitBid };
}
