import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '../hooks/useIsMobile';

const C = {
  bg: '#050507',
  card: '#0c0a14',
  border: 'rgba(123, 94, 167, 0.16)',
  purple: '#7B5EA7',
  purpleLight: '#9B7EC8',
  text: '#e8e4f0',
  textMuted: '#9589aa',
  textDark: '#4e4660',
};

const FAQS = [
  {
    q: 'How are bids kept private?',
    a: "Your bid amount is encrypted on your device before it leaves your browser — Gavel's servers never see a plaintext number. The encrypted commitment is submitted to Arcium's MPC network, where it is processed by multiple independent nodes. No single node holds enough information to reconstruct your bid. Amounts remain sealed until the auction closes and the winner is computed.",
  },
  {
    q: 'What is Arcium MPC?',
    a: "Arcium is a multi-party computation (MPC) network built on Solana. MPC allows multiple parties to jointly evaluate a function — in this case, \"who bid the highest?\" — over secret inputs, without any participant learning those inputs. Each Arcium node holds only an encrypted share of the bid data. The result (winner + settlement price) is computed collectively and posted on-chain. No single party, including Gavel, can see individual bids.",
  },
  {
    q: 'What wallets are supported?',
    a: 'Gavel currently supports Phantom and Solflare, the two most widely used Solana wallets. Support for Backpack and hardware wallets (Ledger) is on the roadmap. Make sure your wallet is funded with enough SOL to cover your bid and the small Solana network fee (typically less than $0.01).',
  },
  {
    q: 'What happens if I win?',
    a: "After the auction closes, Arcium reveals only the winner's wallet address and the settlement price — no other bids are exposed. If you win, you will see a notification on the auction's Reveal screen. For Vickrey auctions, you pay the second-highest bid amount, not your own. For First-Price auctions, you pay your own bid. Payment instructions are displayed on-chain and via the settlement screen.",
  },
  {
    q: 'Can I cancel a bid?',
    a: "No. Once submitted, bids are cryptographically sealed and cannot be retracted. This is intentional — it preserves the integrity of the sealed-bid mechanism and prevents strategic last-minute withdrawal. Arcium's protocol commits your encrypted bid to the network immediately on submission. Please review your amount carefully before signing.",
  },
  {
    q: 'What is a Vickrey auction?',
    a: "A Vickrey auction (also called a second-price sealed-bid auction) is a format in which the highest bidder wins but pays the second-highest bid amount, not their own. This mechanism is provably strategy-proof: your dominant strategy is to bid your true valuation. You never overpay beyond what the next-highest bidder was willing to spend. Vickrey auctions are widely used in mechanism design and economic theory for their fairness properties.",
  },
  {
    q: 'Are there fees?',
    a: 'Gavel charges a 2% platform fee on successful sales, deducted from the settlement amount at close. There are no fees for losing bids. Solana network fees (typically under $0.01) are paid by the bidder at submission time and are non-refundable regardless of auction outcome.',
  },
  {
    q: 'Is my wallet safe?',
    a: "Yes. Gavel only ever requests signMessage — a cryptographic signature that proves you authorized the bid. We never request a transaction signature that would move funds without your explicit approval on a separate confirmation screen in your wallet. Your private keys never leave your wallet application. If any site claims to be Gavel and requests transaction approval for an unexpected amount, do not sign.",
  },
  {
    q: "What happens if there's a tie?",
    a: "In the event that two or more bidders submit identical highest bids, the earlier bid takes precedence. Timestamps are recorded at the moment of submission to Arcium's network, not at the moment you click Submit in the browser. Network latency may therefore affect tie outcomes. In practice, the probability of an exact tie is extremely low given the continuous SOL amount space.",
  },
  {
    q: 'How do I contact support?',
    a: "Email support@gavel.gg with your wallet address and auction ID. Our team responds within 1–2 business days. For urgent issues around active auction settlement, use the subject line \"URGENT: [Auction ID]\" to prioritize your request. For data or privacy inquiries, use privacy@gavel.gg instead.",
  },
];

function FAQItem({ q, a, isOpen, onToggle }) {
  return (
    <div style={{
      borderBottom: '1px solid rgba(123, 94, 167, 0.1)',
    }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '22px 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          textAlign: 'left',
        }}
      >
        <span style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: '1.2rem',
          fontWeight: isOpen ? 600 : 500,
          color: isOpen ? C.text : C.textMuted,
          letterSpacing: '0.02em',
          lineHeight: 1.3,
          transition: 'color 0.2s',
        }}>
          {q}
        </span>
        <div style={{
          width: '26px', height: '26px',
          border: `1px solid ${isOpen ? 'rgba(155, 126, 200, 0.4)' : 'rgba(123, 94, 167, 0.18)'}`,
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          background: isOpen ? 'rgba(123, 94, 167, 0.12)' : 'transparent',
          transition: 'all 0.25s',
        }}>
          <svg
            width="10" height="10" viewBox="0 0 12 12" fill="none"
            style={{
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.25s',
            }}
          >
            <path d="M2 4l4 4 4-4" stroke={isOpen ? C.purpleLight : C.textDark} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </button>

      {isOpen && (
        <div style={{
          paddingBottom: '22px',
          animation: 'fadeIn 0.2s ease both',
        }}>
          <p style={{
            fontFamily: 'DM Mono, monospace',
            fontSize: '0.63rem',
            color: C.textMuted,
            lineHeight: 1.8,
            letterSpacing: '0.04em',
            maxWidth: '680px',
          }}>
            {a}
          </p>
        </div>
      )}
    </div>
  );
}

export default function FAQPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [openIdx, setOpenIdx] = useState(0);

  const toggle = (i) => setOpenIdx(openIdx === i ? null : i);

  return (
    <div style={{ background: C.bg, minHeight: '100vh', paddingTop: '64px', cursor: 'default' }}>
      <div style={{
        maxWidth: '820px',
        margin: '0 auto',
        padding: isMobile ? '48px 20px 80px' : '64px 40px 100px',
        width: '100%',
      }}>

        {/* Back */}
        <button
          onClick={() => navigate('/')}
          style={{
            fontFamily: 'DM Mono, monospace', fontSize: '0.6rem',
            letterSpacing: '0.14em', color: C.textDark,
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            marginBottom: '48px', display: 'flex', alignItems: 'center', gap: '6px',
            transition: 'color 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = C.textMuted}
          onMouseLeave={e => e.currentTarget.style.color = C.textDark}
        >
          ← All Auctions
        </button>

        {/* Hero */}
        <div style={{ marginBottom: '60px' }}>
          <div style={{
            fontFamily: 'DM Mono, monospace', fontSize: '0.55rem',
            letterSpacing: '0.3em', color: C.purple,
            textTransform: 'uppercase', marginBottom: '14px',
          }}>
            Support
          </div>
          <h1 style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 'clamp(2.4rem, 6vw, 3.8rem)',
            fontWeight: 600, color: C.text,
            letterSpacing: '0.04em', lineHeight: 1.05,
            marginBottom: '16px',
          }}>
            Frequently Asked
            <br />
            <span style={{ color: C.textMuted, fontStyle: 'italic', fontWeight: 300 }}>Questions</span>
          </h1>
          <p style={{
            fontFamily: 'DM Mono, monospace', fontSize: '0.62rem',
            color: C.textDark, letterSpacing: '0.08em', lineHeight: 1.65,
          }}>
            {FAQS.length} questions answered. Can't find what you're looking for?{' '}
            <span style={{ color: C.purple }}>support@gavel.gg</span>
          </p>
        </div>

        {/* Questions */}
        <div style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: '14px',
          padding: isMobile ? '4px 20px' : '4px 32px',
        }}>
          {FAQS.map((faq, i) => (
            <FAQItem
              key={i}
              q={faq.q}
              a={faq.a}
              isOpen={openIdx === i}
              onToggle={() => toggle(i)}
            />
          ))}
        </div>

        {/* Still need help */}
        <div style={{
          marginTop: '32px',
          padding: '20px 24px',
          background: 'rgba(123, 94, 167, 0.05)',
          border: '1px solid rgba(123, 94, 167, 0.18)',
          borderRadius: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}>
          <div>
            <div style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '1.1rem', fontWeight: 600,
              color: C.text, letterSpacing: '0.03em',
              marginBottom: '5px',
            }}>
              Still need help?
            </div>
            <p style={{
              fontFamily: 'DM Mono, monospace', fontSize: '0.6rem',
              color: C.textDark, letterSpacing: '0.06em',
            }}>
              Our team responds within 1–2 business days.
            </p>
          </div>
          <a
            href="mailto:support@gavel.gg"
            style={{
              fontFamily: 'DM Mono, monospace',
              fontSize: '0.62rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              padding: '11px 22px',
              background: 'linear-gradient(135deg, #7B5EA7, #5a3f8a)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              textDecoration: 'none',
              display: 'inline-block',
              flexShrink: 0,
            }}
          >
            Email Support →
          </a>
        </div>

      </div>
    </div>
  );
}
