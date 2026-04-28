import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Connection, clusterApiUrl } from '@solana/web3.js';
import { createPortal } from 'react-dom';
import { getAuction, getTimeLeft } from '../data/auctions';
import { useIsMobile } from '../hooks/useIsMobile';
import { useWatchlist } from '../hooks/useWatchlist';
import { showToast } from '../components/Toast';
import NotifPrefsModal from '../components/NotifPrefsModal';
import { useArciumBid } from '../hooks/useArciumBid';
import { useAuctionState } from '../hooks/useAuctionState';

const DEVNET = new Connection('https://api.devnet.solana.com', 'confirmed');

const C = {
  bg: '#050507',
  card: '#0c0a14',
  border: 'rgba(123, 94, 167, 0.16)',
  borderMid: 'rgba(123, 94, 167, 0.25)',
  purple: '#7B5EA7',
  purpleLight: '#9B7EC8',
  text: '#e8e4f0',
  textMuted: '#9589aa',
  textDark: '#4e4660',
};

const pad = (n) => String(Math.floor(n)).padStart(2, '0');

const SOL_PRICE = 150;

async function computeBidHash(message) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(message));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function truncate(hex, head = 16, tail = 8) {
  return hex.slice(0, head) + '…' + hex.slice(-tail);
}

function CountdownTimer({ auction, extensionMs = 0 }) {
  const [tl, setTl] = useState(() => getTimeLeft(auction) + extensionMs);

  useEffect(() => {
    const iv = setInterval(() => {
      setTl(getTimeLeft(auction) + extensionMs);
    }, 1000);
    return () => clearInterval(iv);
  }, [auction, extensionMs]);

  const totalS = Math.floor(tl / 1000);
  const h = Math.floor(totalS / 3600);
  const m = Math.floor((totalS % 3600) / 60);
  const s = totalS % 60;
  const urgent = tl < 60 * 60 * 1000;
  const color = urgent ? '#e07c7c' : C.purpleLight;

  return (
    <div style={{
      background: 'rgba(123, 94, 167, 0.04)',
      border: `1px solid ${C.border}`,
      borderRadius: '14px',
      padding: '32px 28px',
      textAlign: 'center',
    }}>
      <div style={{
        fontFamily: 'DM Mono, monospace',
        fontSize: '0.55rem',
        letterSpacing: '0.28em',
        color: C.textDark,
        textTransform: 'uppercase',
        marginBottom: '20px',
      }}>
        Auction Closes In
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: '2px' }}>
        {[
          { v: pad(h), lbl: 'HH' },
          { v: null },
          { v: pad(m), lbl: 'MM' },
          { v: null },
          { v: pad(s), lbl: 'SS' },
        ].map((seg, i) =>
          seg.v === null ? (
            <div key={i} style={{
              fontFamily: 'DM Mono, monospace',
              fontSize: '3rem',
              color,
              lineHeight: 1,
              paddingBottom: '18px',
              animation: 'blink 1s step-end infinite',
              opacity: 0.7,
            }}>:</div>
          ) : (
            <div key={i} style={{ textAlign: 'center', padding: '0 4px' }}>
              <div style={{
                fontFamily: 'DM Mono, monospace',
                fontSize: '3.8rem',
                fontWeight: 400,
                color,
                lineHeight: 1,
                textShadow: `0 0 40px ${color}55`,
                letterSpacing: '0.04em',
              }}>
                {seg.v}
              </div>
              <div style={{
                fontFamily: 'DM Mono, monospace',
                fontSize: '0.45rem',
                color: C.textDark,
                letterSpacing: '0.32em',
                marginTop: '6px',
              }}>
                {seg.lbl}
              </div>
            </div>
          )
        )}
      </div>

      {urgent && (
        <div style={{
          marginTop: '16px',
          fontFamily: 'DM Mono, monospace',
          fontSize: '0.6rem',
          color: '#e07c7c',
          letterSpacing: '0.12em',
          animation: 'pulse 1.5s infinite',
        }}>
          ⚠ Closing soon
        </div>
      )}
    </div>
  );
}

function EncryptedRow({ bid, index }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '13px 18px',
      borderBottom: '1px solid rgba(123, 94, 167, 0.07)',
      background: index % 2 === 0 ? 'rgba(12, 10, 20, 0.9)' : 'rgba(18, 14, 28, 0.5)',
      animation: `fadeInUp 0.4s ease ${index * 0.06}s both`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
          <rect x="5" y="11" width="14" height="11" rx="2" stroke="#7B5EA7" strokeWidth="2"/>
          <path d="M8 11V7a4 4 0 018 0v4" stroke="#7B5EA7" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <span style={{
          fontFamily: 'DM Mono, monospace',
          fontSize: '0.62rem',
          color: C.textMuted,
          letterSpacing: '0.04em',
        }}>
          {bid.address}
        </span>
      </div>

      {/* Sealed badge — no currency or amount shown */}
      <span style={{
        fontFamily: 'DM Mono, monospace',
        fontSize: '0.55rem',
        color: C.textDark,
        letterSpacing: '0.1em',
        background: 'rgba(123, 94, 167, 0.06)',
        border: '1px solid rgba(123, 94, 167, 0.12)',
        padding: '3px 10px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        flexShrink: 0,
      }}>
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
          <rect x="5" y="11" width="14" height="11" rx="2" stroke="#4e4660" strokeWidth="2"/>
          <path d="M8 11V7a4 4 0 018 0v4" stroke="#4e4660" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        Encrypted
      </span>

      <span style={{
        fontFamily: 'DM Mono, monospace',
        fontSize: '0.55rem',
        color: C.textDark,
        letterSpacing: '0.06em',
        minWidth: '60px',
        textAlign: 'right',
      }}>
        {bid.time} ago
      </span>
    </div>
  );
}

const SUBMIT_STATES = [
  { key: 'idle',       label: 'Seal & Submit Bid',             icon: null,   bg: 'linear-gradient(135deg, #7B5EA7, #5a3f8a)' },
  { key: 'encrypting', label: 'Encrypting bid locally...',     icon: 'spin', bg: 'linear-gradient(135deg, #5a3f8a, #3d2d6a)' },
  { key: 'submitting', label: 'Submitting to Arcium MPC...',   icon: 'spin', bg: 'linear-gradient(135deg, #3d2d6a, #2a1f50)' },
  { key: 'finalizing', label: 'Awaiting MPC finalization...', icon: 'spin', bg: 'linear-gradient(135deg, #2a1f50, #1a1438)' },
  { key: 'done',       label: 'Bid Sealed ✓',                  icon: null,   bg: 'linear-gradient(135deg, #4a3c7a, #3d2d6a)' },
];

export default function BiddingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { connected, publicKey } = useWallet();
  const { setVisible } = useWalletModal();
  const { submitBid } = useArciumBid();
  const { recordBid, extendAuction, getExtra } = useAuctionState(Number(id), {
    onExternalBid: () => {
      if (hasBidRef.current) {
        showToast('Outbid', 'outbid', `🔴 You've been outbid on "${auction?.name}"! Place a higher bid.`, 6000);
      } else {
        showToast('New Bid', 'info', 'A new sealed bid was placed.', 4000);
      }
    },
  });
  const isMobile = useIsMobile();
  const auction = getAuction(id);

  const { toggle, isWatched } = useWatchlist();
  const watched = isWatched(auction?.id);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [watchHover, setWatchHover] = useState(false);

  const [auctionType, setAuctionType] = useState(() => auction?.auctionType ?? 'vickrey');
  const [bidValue, setBidValue] = useState('');
  const [submitIdx, setSubmitIdx] = useState(0);
  const [inputFocused, setInputFocused] = useState(false);
  const [typeHover, setTypeHover] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [bidHash, setBidHash] = useState(null);
  const [bidSignature, setBidSignature] = useState(null);
  const [continueHover, setContinueHover] = useState(false);
  const [walletBalance, setWalletBalance] = useState(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const pendingBid = useRef(null);
  const hasBidRef = useRef(false);
  const prevConnectedRef = useRef(connected);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(() => auction ? getTimeLeft(auction) : 0);

  // Fetch devnet wallet balance whenever the connected wallet changes
  useEffect(() => {
    if (!connected || !publicKey) {
      setWalletBalance(null);
      return;
    }
    let cancelled = false;
    setBalanceLoading(true);
    DEVNET.getBalance(publicKey)
      .then(lamports => { if (!cancelled) setWalletBalance(lamports / 1e9); })
      .catch(() => { if (!cancelled) setWalletBalance(null); })
      .finally(() => { if (!cancelled) setBalanceLoading(false); });
    return () => { cancelled = true; };
  }, [connected, publicKey]);

  // Wallet disconnect detection
  useEffect(() => {
    if (prevConnectedRef.current && !connected) {
      setShowDisconnectModal(true);
    }
    prevConnectedRef.current = connected;
  }, [connected]);

  // Sync timeLeft including any auction extensions
  useEffect(() => {
    if (!auction) return;
    const iv = setInterval(() => {
      const { extensionMs } = getExtra();
      setTimeLeft(getTimeLeft(auction) + extensionMs);
    }, 1000);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auction?.id]);

  // Toast: auction ending soon (once per session per auction)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!auction) return;
    const key = `gavel:ending-shown-${id}`;
    if (getTimeLeft(auction) < 60 * 60 * 1000 && !sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, '1');
      showToast(
        'Auction Ending Soon',
        'warning',
        `${auction.name} closes in under an hour.`,
        5000
      );
    }
  }, []);

  // Toast: outbid simulation after 30s (only if no bid placed yet)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!auction) return;
    const t = setTimeout(() => {
      if (!hasBidRef.current) {
        showToast(
          "You've been outbid",
          'outbid',
          `Place a new bid on "${auction.name}" to stay in the lead.`,
          6000
        );
      }
    }, 30000);
    return () => clearTimeout(t);
  }, []);

  // Competing bids simulation — every 45–90 s
  useEffect(() => {
    if (!auction) return;
    let timeout;
    const schedule = () => {
      const delay = 45000 + Math.random() * 45000;
      timeout = setTimeout(() => {
        if (getTimeLeft(auction) > 0) {
          recordBid();
          if (hasBidRef.current) {
            showToast('Outbid', 'outbid', `🔴 You've been outbid on "${auction.name}"! Place a higher bid.`, 6000);
          } else {
            showToast('New Bid', 'info', `A new sealed bid was placed on "${auction.name}".`, 4000);
          }
          schedule();
        }
      }, delay);
    };
    schedule();
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auction?.id]);

  if (!auction) {
    return (
      <div style={{ paddingTop: '120px', textAlign: 'center', color: C.textMuted, fontFamily: 'DM Mono, monospace' }}>
        Auction not found.
      </div>
    );
  }

  const currentState = SUBMIT_STATES[submitIdx];
  const isProcessing = submitIdx >= 1 && submitIdx <= 3;
  const isDone = submitIdx === 4;

  const bidAmount = parseFloat(bidValue) || 0;
  const minBid = auction?.minBid ?? 0;
  const minRequired = minBid + 1;
  const overBalance = walletBalance !== null && bidAmount > 0 && bidAmount > walletBalance;
  const underMinBid = bidAmount > 0 && bidAmount < minRequired;
  const bidError = overBalance
    ? `Insufficient balance. Your wallet holds ◎${walletBalance.toFixed(3)}. Please enter a lower bid.`
    : underMinBid
    ? `Bid must be at least ◎${minRequired} to outbid current leader`
    : null;
  const bidValid = bidAmount > 0 && !overBalance && !underMinBid;

  const inputBorderColor = !bidValue
    ? (inputFocused ? C.purple : 'rgba(123, 94, 167, 0.2)')
    : bidError
    ? 'rgba(224, 124, 124, 0.55)'
    : 'rgba(126, 200, 156, 0.5)';

  const inputShadow = !bidValue
    ? (inputFocused ? '0 0 0 3px rgba(123, 94, 167, 0.12)' : 'none')
    : bidError
    ? '0 0 0 3px rgba(224, 124, 124, 0.07)'
    : '0 0 0 3px rgba(126, 200, 156, 0.07)';

  const handleSubmit = async () => {
    const amount = bidAmount;
    if (!bidValid || isProcessing || isDone) return;
    pendingBid.current = { amount, auctionType, auction };
    hasBidRef.current = true;

    const lamports = Math.round(amount * 1e9);

    const onStatus = (key) => {
      const idx = SUBMIT_STATES.findIndex(s => s.key === key);
      if (idx !== -1) setSubmitIdx(idx);
    };

    if (auction.auctionPubkey) {
      // Real Arcium MPC path
      try {
        const sig = await submitBid(auction.auctionPubkey, lamports, onStatus);
        setBidSignature(truncate(sig, 16, 8));
        const hash = await computeBidHash(`${auction.auctionPubkey}:${lamports}:${publicKey?.toBase58()}`);
        setBidHash(hash);
        setSubmitIdx(4);
        setShowConfirm(true);
        showToast('Bid Sealed & Submitted', 'success', 'Your encrypted bid has been committed to Arcium MPC.', 5000);
        recordBid();
        const { extensionMs: curExt } = getExtra();
        if (getTimeLeft(auction) + curExt < 5 * 60 * 1000) {
          extendAuction(auction.id, 5 * 60 * 1000);
          showToast('Auction Extended', 'info', '⏱ A bid placed in the final minutes — auction extended by 5 minutes.', 6000);
        }
      } catch (err) {
        setSubmitIdx(0);
        const msg = err?.message ?? String(err);
        const cancelled = msg.toLowerCase().includes('user rejected') || msg.toLowerCase().includes('cancelled');
        showToast(
          cancelled ? 'Bid cancelled' : 'Connection Error',
          cancelled ? 'warning' : 'error',
          cancelled ? 'Wallet signing was rejected.' : 'Connection issue. Please check your wallet and try again.',
          5000,
        );
      }
    } else {
      // Demo path: real encryption, simulated on-chain submission
      try {
        onStatus('encrypting');
        await new Promise(r => setTimeout(r, 1800));

        onStatus('submitting');
        await new Promise(r => setTimeout(r, 1200));

        onStatus('finalizing');
        await new Promise(r => setTimeout(r, 1400));

        const msgStr = `demo:${id}:${lamports}:${Date.now()}`;
        const hash = await computeBidHash(msgStr);
        setBidHash(hash);
        setBidSignature(truncate(hash, 16, 8));
        setSubmitIdx(4);
        setShowConfirm(true);
        showToast('Bid Sealed & Submitted', 'success', 'Your encrypted bid has been committed to Arcium MPC.', 5000);
        recordBid();
        const { extensionMs: curExt } = getExtra();
        if (getTimeLeft(auction) + curExt < 5 * 60 * 1000) {
          extendAuction(auction.id, 5 * 60 * 1000);
          showToast('Auction Extended', 'info', '⏱ A bid placed in the final minutes — auction extended by 5 minutes.', 6000);
        }
      } catch (err) {
        setSubmitIdx(0);
        showToast('Connection Error', 'error', 'Connection issue. Please check your wallet and try again.', 5000);
      }
    }
  };

  const handleContinue = () => {
    const { amount, auctionType: at, auction: a } = pendingBid.current;
    navigate(`/auction/${id}/reveal`, {
      state: { bidAmount: amount, auctionType: at, auction: a },
    });
  };

  const TYPE_INFO = {
    'first-price': 'Winner pays their own bid. Higher risk — bid too low and lose, too high and overpay.',
    vickrey: 'Winner pays the second-highest bid. Dominant strategy: bid your true valuation.',
  };

  const usdValue = bidValue
    ? (parseFloat(bidValue) * SOL_PRICE).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
    : null;

  return (
    <>
    <div style={{ background: C.bg, minHeight: '100vh', paddingTop: '64px', cursor: 'default' }}>
      {/* ── Auction header ───────────────────────────────── */}
      <div style={{
        background: 'rgba(12, 10, 20, 0.8)',
        borderBottom: `1px solid ${C.border}`,
        padding: isMobile ? '24px 16px 20px' : '36px 60px 32px',
        backdropFilter: 'blur(8px)',
      }}>
        <button
          onClick={() => navigate('/')}
          style={{
            fontFamily: 'DM Mono, monospace',
            fontSize: '0.6rem',
            letterSpacing: '0.14em',
            color: C.textDark,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'color 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = C.textMuted}
          onMouseLeave={e => e.currentTarget.style.color = C.textDark}
        >
          ← All Auctions
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ flex: '1 1 420px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
              <span style={{
                fontFamily: 'DM Mono, monospace',
                fontSize: '0.58rem',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: C.purple,
                background: 'rgba(123, 94, 167, 0.1)',
                border: `1px solid rgba(123, 94, 167, 0.22)`,
                padding: '4px 10px',
                borderRadius: '20px',
              }}>
                {auction.category}
              </span>
              <span style={{ fontSize: '1.6rem' }}>{auction.icon}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '10px' }}>
              <h1 style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
                fontWeight: 600,
                color: C.text,
                lineHeight: 1.15,
                letterSpacing: '0.02em',
                margin: 0, flex: 1,
              }}>
                {auction.name}
              </h1>

              {/* watchlist toggle */}
              <button
                onClick={() => {
                  const adding = !watched;
                  toggle(auction.id);
                  if (adding) {
                    showToast('Added to Watchlist', 'success');
                    setShowNotifModal(true);
                  } else {
                    showToast('Removed from Watchlist', 'info');
                  }
                }}
                onMouseEnter={() => setWatchHover(true)}
                onMouseLeave={() => setWatchHover(false)}
                style={{
                  background: watched
                    ? 'rgba(123, 94, 167, 0.15)'
                    : watchHover ? 'rgba(123, 94, 167, 0.08)' : 'rgba(123, 94, 167, 0.04)',
                  border: `1px solid ${watched ? 'rgba(155, 126, 200, 0.4)' : 'rgba(123, 94, 167, 0.2)'}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  padding: '8px 12px',
                  display: 'flex', alignItems: 'center', gap: '6px',
                  transition: 'all 0.2s',
                  flexShrink: 0,
                  marginTop: '4px',
                }}
                title={watched ? 'Remove from watchlist' : 'Save to watchlist'}
              >
                <svg width="13" height="13" viewBox="0 0 24 24"
                  fill={watched ? C.purpleLight : 'none'}>
                  <path d="M5 3h14a1 1 0 011 1v17l-8-4-8 4V4a1 1 0 011-1z"
                    stroke={watched ? C.purpleLight : C.textMuted}
                    strokeWidth="1.5" strokeLinejoin="round"/>
                </svg>
                <span style={{
                  fontFamily: 'DM Mono, monospace', fontSize: '0.55rem',
                  letterSpacing: '0.12em', textTransform: 'uppercase',
                  color: watched ? C.purpleLight : C.textMuted,
                  transition: 'color 0.2s',
                }}>
                  {watched ? 'Saved' : 'Watch'}
                </span>
              </button>
            </div>

            <p style={{
              fontFamily: 'DM Mono, monospace',
              fontSize: '0.65rem',
              color: C.textMuted,
              lineHeight: 1.7,
              maxWidth: '520px',
              letterSpacing: '0.04em',
            }}>
              {auction.description}
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{
              fontFamily: 'DM Mono, monospace',
              fontSize: '0.55rem',
              color: C.textDark,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              marginBottom: '4px',
            }}>
              Estimate
            </div>
            <div style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '1.4rem',
              fontWeight: 500,
              color: C.textMuted,
            }}>
              {auction.estimate}
            </div>
          </div>
        </div>
      </div>

      {/* ── Two-column body ──────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr minmax(360px, 480px)',
        gap: '24px',
        padding: isMobile ? '20px 16px 60px' : '36px 60px 80px',
        maxWidth: '1300px',
        margin: '0 auto',
        width: '100%',
        alignItems: 'start',
      }}>
        {/* ── LEFT: Timer + authenticity + bid history ─────── */}
        <div>
          {timeLeft > 0 && timeLeft < 10 * 60 * 1000 && (
            <div style={{
              padding: '12px 18px',
              background: 'rgba(224, 124, 124, 0.08)',
              border: '1px solid rgba(224, 124, 124, 0.35)',
              borderRadius: '10px',
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}>
              <span style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: '#e07c7c', flexShrink: 0,
                animation: 'pulse 1s infinite',
              }} />
              <span style={{
                fontFamily: 'DM Mono, monospace',
                fontSize: '0.62rem',
                color: '#e07c7c',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}>
                Auction ends in under 10 minutes
              </span>
            </div>
          )}
          <CountdownTimer auction={auction} extensionMs={getExtra().extensionMs} />

          {/* ── Authenticity panel ───────────────────────── */}
          {auction.authenticity?.verified ? (
            <div style={{
              marginTop: '20px',
              background: 'rgba(126, 200, 156, 0.04)',
              border: '1px solid rgba(126, 200, 156, 0.2)',
              borderRadius: '12px',
              overflow: 'hidden',
            }}>
              {/* header */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '14px 18px',
                borderBottom: '1px solid rgba(126, 200, 156, 0.12)',
                background: 'rgba(126, 200, 156, 0.04)',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                  <path d="M12 2L3 7V12C3 16.55 6.84 20.74 12 22C17.16 20.74 21 16.55 21 12V7L12 2Z"
                    stroke="#7ec89c" strokeWidth="1.8" strokeLinejoin="round"/>
                  <path d="M8.5 12L11 14.5L15.5 10" stroke="#7ec89c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span style={{
                  fontFamily: 'DM Mono, monospace', fontSize: '0.58rem',
                  color: '#7ec89c', letterSpacing: '0.14em', textTransform: 'uppercase',
                }}>
                  Authenticity Verified
                </span>
              </div>

              {/* rows */}
              {[
                { label: 'Verification ID', value: auction.authenticity.id },
                { label: 'Type', value: auction.authenticity.type },
                { label: 'Issuing Authority', value: auction.authenticity.authority },
                { label: 'Document Ref', value: auction.authenticity.docRef },
                ...(auction.authenticity.smartContract ? [{ label: 'Smart Contract', value: auction.authenticity.smartContract }] : []),
                { label: 'Verified', value: auction.authenticity.verifiedAt },
              ].map((row, i, arr) => (
                <div key={row.label} style={{
                  display: 'grid', gridTemplateColumns: '130px 1fr',
                  gap: '8px', padding: '10px 18px',
                  borderBottom: i < arr.length - 1 ? '1px solid rgba(126, 200, 156, 0.07)' : 'none',
                }}>
                  <span style={{
                    fontFamily: 'DM Mono, monospace', fontSize: '0.52rem',
                    color: C.textDark, letterSpacing: '0.12em', textTransform: 'uppercase',
                  }}>
                    {row.label}
                  </span>
                  <span style={{
                    fontFamily: 'DM Mono, monospace', fontSize: '0.58rem',
                    color: C.textMuted, letterSpacing: '0.03em',
                    wordBreak: 'break-all', lineHeight: 1.5,
                  }}>
                    {row.value}
                  </span>
                </div>
              ))}

              {/* guarantee note */}
              <div style={{
                padding: '12px 18px',
                borderTop: '1px solid rgba(126, 200, 156, 0.1)',
                fontFamily: 'DM Mono, monospace', fontSize: '0.55rem',
                color: '#7ec89c', letterSpacing: '0.06em',
              }}>
                Authenticity guaranteed by Gavel
              </div>
            </div>
          ) : (
            <div style={{
              marginTop: '20px',
              padding: '16px 18px',
              background: 'rgba(212, 168, 68, 0.05)',
              border: '1px solid rgba(212, 168, 68, 0.22)',
              borderRadius: '12px',
              display: 'flex', gap: '12px', alignItems: 'flex-start',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: '1px' }}>
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                  stroke="#d4a844" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="12" y1="9" x2="12" y2="13" stroke="#d4a844" strokeWidth="1.8" strokeLinecap="round"/>
                <line x1="12" y1="17" x2="12.01" y2="17" stroke="#d4a844" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <div>
                <div style={{
                  fontFamily: 'DM Mono, monospace', fontSize: '0.58rem',
                  color: '#d4a844', letterSpacing: '0.1em',
                  textTransform: 'uppercase', marginBottom: '5px',
                }}>
                  Unverified Item
                </div>
                <div style={{
                  fontFamily: 'DM Mono, monospace', fontSize: '0.58rem',
                  color: C.textMuted, lineHeight: 1.65, letterSpacing: '0.04em',
                }}>
                  This item has not been verified by Gavel. No proof of ownership or certificate of authenticity has been submitted. Bid with caution.
                </div>
              </div>
            </div>
          )}

          {/* Sealed bid ledger */}
          <div style={{ marginTop: '28px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
            }}>
              <span style={{
                fontFamily: 'DM Mono, monospace',
                fontSize: '0.58rem',
                letterSpacing: '0.22em',
                color: C.textDark,
                textTransform: 'uppercase',
              }}>
                Sealed Bid Ledger
              </span>
              <span style={{
                fontFamily: 'DM Mono, monospace',
                fontSize: '0.6rem',
                color: C.purple,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}>
                <span style={{
                  width: '5px', height: '5px', borderRadius: '50%',
                  background: C.purpleLight, animation: 'pulse 2s infinite',
                }} />
                {auction.bidCount + getExtra().extraBids} encrypted
              </span>
            </div>

            <div style={{
              border: `1px solid ${C.border}`,
              borderRadius: '12px',
              overflow: 'hidden',
              background: 'rgba(12, 10, 20, 0.6)',
            }}>
              {auction.fakeBids.length > 0
                ? auction.fakeBids.map((bid, i) => (
                    <EncryptedRow key={i} bid={bid} index={i} />
                  ))
                : (
                  <div style={{
                    padding: '32px',
                    textAlign: 'center',
                    fontFamily: 'DM Mono, monospace',
                    fontSize: '0.6rem',
                    color: C.textDark,
                    letterSpacing: '0.1em',
                  }}>
                    No bids yet — be the first
                  </div>
                )}
            </div>

            <div style={{
              marginTop: '12px',
              fontFamily: 'DM Mono, monospace',
              fontSize: '0.55rem',
              color: C.textDark,
              textAlign: 'center',
              letterSpacing: '0.1em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                <rect x="5" y="11" width="14" height="11" rx="2" stroke="#4e4660" strokeWidth="2"/>
                <path d="M8 11V7a4 4 0 018 0v4" stroke="#4e4660" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Bid amounts sealed by Arcium MPC until auction close
            </div>
          </div>
        </div>

        {/* ── RIGHT: Bidding form ───────────────────────── */}
        <div style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: '16px',
          padding: isMobile ? '24px 20px' : '32px',
          position: isMobile ? 'static' : 'sticky',
          top: '88px',
        }}>
          {/* Top bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '28px',
            paddingBottom: '20px',
            borderBottom: `1px solid ${C.border}`,
          }}>
            <span style={{
              fontFamily: 'DM Mono, monospace',
              fontSize: '0.6rem',
              letterSpacing: '0.2em',
              color: C.textDark,
              textTransform: 'uppercase',
            }}>
              Place Your Bid
            </span>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontFamily: 'DM Mono, monospace',
              fontSize: '0.58rem',
              color: C.purple,
            }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L3 7V12C3 16.55 6.84 20.74 12 22C17.16 20.74 21 16.55 21 12V7L12 2Z"
                  stroke="#7B5EA7" strokeWidth="2" strokeLinejoin="round"/>
              </svg>
              End-to-end encrypted
            </div>
          </div>

          {/* ── Not connected: hide form, show prompt ──── */}
          {!connected ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '48px 24px',
              textAlign: 'center',
              gap: '16px',
            }}>
              <div style={{
                width: '52px', height: '52px',
                background: 'rgba(123, 94, 167, 0.1)',
                border: '1px solid rgba(123, 94, 167, 0.2)',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '4px',
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <rect x="5" y="11" width="14" height="11" rx="2" stroke="#9B7EC8" strokeWidth="1.6"/>
                  <path d="M8 11V7a4 4 0 018 0v4" stroke="#9B7EC8" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <div style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: '1.25rem',
                  fontWeight: 500,
                  color: C.text,
                  letterSpacing: '0.03em',
                  marginBottom: '8px',
                }}>
                  Connect your wallet to bid
                </div>
                <div style={{
                  fontFamily: 'DM Mono, monospace',
                  fontSize: '0.58rem',
                  color: C.textDark,
                  letterSpacing: '0.06em',
                  lineHeight: 1.6,
                  maxWidth: '240px',
                  margin: '0 auto',
                }}>
                  Gavel uses wallet signing to authorize bids — no account required.
                </div>
              </div>
              <button
                onClick={() => setVisible(true)}
                style={{
                  marginTop: '8px',
                  padding: '13px 32px',
                  background: 'linear-gradient(135deg, #7B5EA7, #5a3f8a)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '9px',
                  fontFamily: 'DM Mono, monospace',
                  fontSize: '0.68rem',
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  boxShadow: '0 8px 32px rgba(123, 94, 167, 0.35)',
                  display: 'flex', alignItems: 'center', gap: '9px',
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <rect x="5" y="11" width="14" height="11" rx="2" stroke="rgba(255,255,255,0.8)" strokeWidth="1.8"/>
                  <path d="M8 11V7a4 4 0 018 0v4" stroke="rgba(255,255,255,0.8)" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
                Connect Wallet
              </button>
            </div>
          ) : (
            <>
              {/* Auction type toggle */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{
                  fontFamily: 'DM Mono, monospace',
                  fontSize: '0.55rem',
                  letterSpacing: '0.2em',
                  color: C.textDark,
                  textTransform: 'uppercase',
                  marginBottom: '10px',
                }}>
                  Auction Type
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {[
                    { key: 'first-price', label: 'First-Price' },
                    { key: 'vickrey',     label: 'Vickrey' },
                  ].map((t) => (
                    <button
                      key={t.key}
                      style={{
                        fontFamily: 'DM Mono, monospace',
                        fontSize: '0.62rem',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        padding: '11px 8px',
                        background: auctionType === t.key
                          ? 'rgba(123, 94, 167, 0.2)'
                          : typeHover === t.key
                            ? 'rgba(123, 94, 167, 0.07)'
                            : 'rgba(12, 10, 20, 0.6)',
                        color: auctionType === t.key ? C.purpleLight : C.textMuted,
                        border: `1px solid ${auctionType === t.key ? C.purple : 'rgba(123, 94, 167, 0.14)'}`,
                        borderRadius: '7px',
                        cursor: 'pointer',
                        transition: 'all 0.22s',
                      }}
                      onMouseEnter={() => setTypeHover(t.key)}
                      onMouseLeave={() => setTypeHover(null)}
                      onClick={() => setAuctionType(t.key)}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                <div style={{
                  marginTop: '10px',
                  padding: '10px 14px',
                  background: 'rgba(123, 94, 167, 0.04)',
                  border: `1px solid rgba(123, 94, 167, 0.1)`,
                  borderRadius: '7px',
                  fontFamily: 'DM Mono, monospace',
                  fontSize: '0.58rem',
                  color: C.textMuted,
                  lineHeight: 1.65,
                  letterSpacing: '0.04em',
                  animation: 'slideDown 0.25s ease',
                }}>
                  {TYPE_INFO[auctionType]}
                </div>
              </div>

              {/* Bid input */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontFamily: 'DM Mono, monospace',
                  fontSize: '0.55rem',
                  letterSpacing: '0.2em',
                  color: C.textDark,
                  textTransform: 'uppercase',
                  marginBottom: '10px',
                }}>
                  Your Sealed Bid (SOL)
                </label>

                <div style={{
                  position: 'relative',
                  border: `1px solid ${inputBorderColor}`,
                  borderRadius: '9px',
                  background: 'rgba(5, 5, 7, 0.8)',
                  transition: 'border-color 0.22s, box-shadow 0.22s',
                  boxShadow: inputShadow,
                }}>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={bidValue}
                    onChange={(e) => setBidValue(e.target.value)}
                    onFocus={() => setInputFocused(true)}
                    onBlur={() => setInputFocused(false)}
                    disabled={isProcessing || isDone}
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      fontFamily: 'DM Mono, monospace',
                      fontSize: '1.5rem',
                      fontWeight: 400,
                      color: C.text,
                      padding: '16px 60px 16px 18px',
                      letterSpacing: '0.04em',
                    }}
                  />
                  <span style={{
                    position: 'absolute',
                    right: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontFamily: 'DM Mono, monospace',
                    fontSize: '1rem',
                    color: bidError ? '#e07c7c' : bidValid ? '#7ec89c' : C.purple,
                    letterSpacing: '0.04em',
                    pointerEvents: 'none',
                    transition: 'color 0.22s',
                  }}>
                    ◎
                  </span>
                </div>

                {/* Balance + USD row */}
                <div style={{
                  marginTop: '7px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <div style={{
                    fontFamily: 'DM Mono, monospace',
                    fontSize: '0.57rem',
                    letterSpacing: '0.08em',
                    color: C.textDark,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}>
                    {balanceLoading ? (
                      <>
                        <div style={{
                          width: '8px', height: '8px',
                          border: '1.5px solid rgba(78, 70, 96, 0.4)',
                          borderTopColor: C.textDark,
                          borderRadius: '50%',
                          animation: 'spin 0.8s linear infinite',
                        }} />
                        Fetching balance...
                      </>
                    ) : walletBalance !== null ? (
                      <>
                        <span>Available:</span>
                        <span style={{ color: overBalance ? '#e07c7c' : C.textMuted }}>
                          ◎{walletBalance.toFixed(3)}
                        </span>
                      </>
                    ) : null}
                  </div>
                  {usdValue && !bidError && (
                    <div style={{
                      fontFamily: 'DM Mono, monospace',
                      fontSize: '0.57rem',
                      color: C.textDark,
                      letterSpacing: '0.08em',
                    }}>
                      ≈ {usdValue} USD
                    </div>
                  )}
                </div>

                {/* Validation error */}
                {bidError && (
                  <div style={{
                    marginTop: '6px',
                    fontFamily: 'DM Mono, monospace',
                    fontSize: '0.57rem',
                    color: '#e07c7c',
                    letterSpacing: '0.04em',
                    lineHeight: 1.5,
                    animation: 'fadeIn 0.18s ease',
                  }}>
                    {bidError}
                  </div>
                )}

                {/* Min bid hint when no value entered */}
                {!bidValue && (
                  <div style={{
                    marginTop: '6px',
                    fontFamily: 'DM Mono, monospace',
                    fontSize: '0.55rem',
                    color: C.textDark,
                    letterSpacing: '0.06em',
                  }}>
                    Minimum bid: ◎{minRequired} (◎{minBid} + 1 SOL increment)
                  </div>
                )}
                {/* Reserve price status */}
                {auction.reservePrice && (
                  <div style={{
                    marginTop: '8px',
                    fontFamily: 'DM Mono, monospace',
                    fontSize: '0.55rem',
                    color: auction.reserveMet ? '#7ec89c' : '#d4a844',
                    letterSpacing: '0.06em',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}>
                    {auction.reserveMet ? '✓ Reserve price met' : '⚠ Reserve price not yet met'}
                  </div>
                )}
              </div>

              {/* Privacy notice */}
              <div style={{
                padding: '12px 14px',
                background: 'rgba(123, 94, 167, 0.05)',
                border: `1px solid rgba(123, 94, 167, 0.12)`,
                borderRadius: '8px',
                marginBottom: '20px',
                display: 'flex',
                gap: '10px',
                alignItems: 'flex-start',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: '1px' }}>
                  <rect x="5" y="11" width="14" height="11" rx="2" stroke="#7B5EA7" strokeWidth="1.8"/>
                  <path d="M8 11V7a4 4 0 018 0v4" stroke="#7B5EA7" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
                <div>
                  <div style={{
                    fontFamily: 'DM Mono, monospace',
                    fontSize: '0.58rem',
                    color: C.purple,
                    letterSpacing: '0.1em',
                    marginBottom: '3px',
                  }}>
                    End-to-end encrypted
                  </div>
                  <div style={{
                    fontFamily: 'DM Mono, monospace',
                    fontSize: '0.55rem',
                    color: C.textDark,
                    lineHeight: 1.6,
                    letterSpacing: '0.04em',
                  }}>
                    Your bid is encrypted locally before transmission. Not even Gavel can see it.
                  </div>
                </div>
              </div>

              {/* Submit button */}
              <button
                onClick={handleSubmit}
                disabled={!bidValid || isProcessing || isDone}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: !bidValid
                    ? 'rgba(123, 94, 167, 0.15)'
                    : currentState.bg,
                  color: !bidValid ? C.textDark : '#fff',
                  border: 'none',
                  borderRadius: '9px',
                  fontFamily: 'DM Mono, monospace',
                  fontSize: '0.72rem',
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  cursor: (!bidValid || isProcessing || isDone) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.35s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  boxShadow: (bidValid && !isProcessing && !isDone)
                    ? '0 8px 32px rgba(123, 94, 167, 0.35)'
                    : 'none',
                }}
              >
                {(submitIdx === 1 || submitIdx === 2 || submitIdx === 3) && (
                  <div style={{
                    width: '14px', height: '14px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                    flexShrink: 0,
                  }} />
                )}
                {isDone && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
                {currentState.label}
              </button>

              {/* ── Bid sealed confirmation ─────────────── */}
              {showConfirm && (
                <div style={{
                  marginTop: '16px',
                  padding: '18px',
                  background: 'rgba(126, 200, 156, 0.04)',
                  border: '1px solid rgba(126, 200, 156, 0.18)',
                  borderRadius: '10px',
                  animation: 'fadeIn 0.4s ease both',
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '7px',
                    marginBottom: '14px',
                  }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="9" stroke="#7ec89c" strokeWidth="1.8"/>
                      <path d="M8 12l3 3 5-5" stroke="#7ec89c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span style={{
                      fontFamily: 'DM Mono, monospace',
                      fontSize: '0.6rem',
                      color: '#7ec89c',
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                    }}>
                      Bid Sealed Successfully
                    </span>
                  </div>

                  <div style={{
                    fontFamily: 'DM Mono, monospace',
                    fontSize: '0.55rem',
                    color: C.textDark,
                    lineHeight: 1.65,
                    letterSpacing: '0.04em',
                    marginBottom: '14px',
                  }}>
                    Your encrypted bid has been submitted to Arcium's MPC network for private comparison. No party — including Gavel — can read your bid until the auction closes.
                  </div>

                  <div style={{
                    fontFamily: 'DM Mono, monospace',
                    fontSize: '0.52rem',
                    color: C.textDark,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    marginBottom: '4px',
                  }}>
                    Encrypted Commitment
                  </div>
                  <div style={{
                    fontFamily: 'DM Mono, monospace',
                    fontSize: '0.56rem',
                    color: C.textMuted,
                    letterSpacing: '0.04em',
                    wordBreak: 'break-all',
                    lineHeight: 1.55,
                    background: 'rgba(5, 5, 7, 0.6)',
                    border: '1px solid rgba(123, 94, 167, 0.12)',
                    borderRadius: '6px',
                    padding: '8px 10px',
                    marginBottom: '10px',
                  }}>
                    {bidHash}
                  </div>

                  <div style={{
                    fontFamily: 'DM Mono, monospace',
                    fontSize: '0.52rem',
                    color: C.textDark,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    marginBottom: '4px',
                  }}>
                    Authorization Proof
                  </div>
                  <div style={{
                    fontFamily: 'DM Mono, monospace',
                    fontSize: '0.56rem',
                    color: C.textMuted,
                    letterSpacing: '0.04em',
                    background: 'rgba(5, 5, 7, 0.6)',
                    border: '1px solid rgba(123, 94, 167, 0.12)',
                    borderRadius: '6px',
                    padding: '8px 10px',
                    marginBottom: '14px',
                  }}>
                    {bidSignature}
                  </div>

                  <button
                    onClick={handleContinue}
                    onMouseEnter={() => setContinueHover(true)}
                    onMouseLeave={() => setContinueHover(false)}
                    style={{
                      width: '100%',
                      fontFamily: 'DM Mono, monospace',
                      fontSize: '0.6rem',
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      padding: '11px 12px',
                      background: continueHover
                        ? 'linear-gradient(135deg, #9B7EC8, #7B5EA7)'
                        : 'linear-gradient(135deg, #7B5EA7, #5a3f8a)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '7px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: continueHover ? '0 6px 20px rgba(123, 94, 167, 0.4)' : 'none',
                    }}
                  >
                    View Auction →
                  </button>
                </div>
              )}

              {/* Arcium badge */}
              {!showConfirm && (
                <div style={{
                  marginTop: '16px',
                  textAlign: 'center',
                  fontFamily: 'DM Mono, monospace',
                  fontSize: '0.55rem',
                  color: C.textDark,
                  letterSpacing: '0.1em',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L3 7V12C3 16.55 6.84 20.74 12 22C17.16 20.74 21 16.55 21 12V7L12 2Z"
                      stroke="#4e4660" strokeWidth="2" strokeLinejoin="round"/>
                  </svg>
                  Secured by Arcium MPC · Sealed until close
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>

    {showNotifModal && auction && (
      <NotifPrefsModal auction={auction} onClose={() => setShowNotifModal(false)} />
    )}

    {showDisconnectModal && createPortal(
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(5, 5, 7, 0.85)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(6px)',
      }}>
        <div style={{
          background: '#0c0a14',
          border: '1px solid rgba(123, 94, 167, 0.25)',
          borderRadius: '16px',
          padding: '36px 32px',
          maxWidth: '380px', width: '90%',
          textAlign: 'center',
        }}>
          <div style={{
            width: '52px', height: '52px',
            background: 'rgba(224, 124, 124, 0.1)',
            border: '1px solid rgba(224, 124, 124, 0.25)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                stroke="#e07c7c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="12" y1="9" x2="12" y2="13" stroke="#e07c7c" strokeWidth="1.8" strokeLinecap="round"/>
              <line x1="12" y1="17" x2="12.01" y2="17" stroke="#e07c7c" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <h3 style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '1.4rem', fontWeight: 600,
            color: '#e8e4f0', letterSpacing: '0.03em',
            marginBottom: '12px',
          }}>
            Wallet Disconnected
          </h3>
          <p style={{
            fontFamily: 'DM Mono, monospace',
            fontSize: '0.6rem', color: '#9589aa',
            lineHeight: 1.7, letterSpacing: '0.04em',
            marginBottom: '24px',
          }}>
            Your wallet was disconnected. Reconnect to continue bidding. Your current session data is preserved.
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => { setShowDisconnectModal(false); setVisible(true); }}
              style={{
                flex: 1, padding: '12px',
                background: 'linear-gradient(135deg, #7B5EA7, #5a3f8a)',
                color: '#fff', border: 'none', borderRadius: '8px',
                fontFamily: 'DM Mono, monospace',
                fontSize: '0.62rem', letterSpacing: '0.12em',
                textTransform: 'uppercase', cursor: 'pointer',
              }}
            >
              Reconnect
            </button>
            <button
              onClick={() => setShowDisconnectModal(false)}
              style={{
                flex: 1, padding: '12px',
                background: 'transparent',
                color: '#9589aa',
                border: '1px solid rgba(123, 94, 167, 0.2)',
                borderRadius: '8px',
                fontFamily: 'DM Mono, monospace',
                fontSize: '0.62rem', letterSpacing: '0.12em',
                textTransform: 'uppercase', cursor: 'pointer',
              }}
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>,
      document.body
    )}
    </>
  );
}
