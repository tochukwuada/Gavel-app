import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '../hooks/useIsMobile';

const C = {
  bg: '#050507',
  card: '#0c0a14',
  cardHover: '#110e1c',
  border: 'rgba(123, 94, 167, 0.16)',
  borderHover: 'rgba(155, 126, 200, 0.38)',
  purple: '#7B5EA7',
  purpleLight: '#9B7EC8',
  text: '#e8e4f0',
  textMuted: '#9589aa',
  textDark: '#4e4660',
};

/* ── Icons ─────────────────────────────────────────────── */

function LockIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
      <rect x="5" y="11" width="14" height="11" rx="2.5" stroke="#9B7EC8" strokeWidth="1.5"/>
      <path d="M8 11V7a4 4 0 018 0v4" stroke="#9B7EC8" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="12" cy="16.5" r="1.5" fill="#9B7EC8"/>
    </svg>
  );
}

function NodesIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="2.5" stroke="#9B7EC8" strokeWidth="1.5"/>
      <circle cx="4"  cy="6"  r="2"   stroke="#7B5EA7" strokeWidth="1.5"/>
      <circle cx="20" cy="6"  r="2"   stroke="#7B5EA7" strokeWidth="1.5"/>
      <circle cx="4"  cy="18" r="2"   stroke="#7B5EA7" strokeWidth="1.5"/>
      <circle cx="20" cy="18" r="2"   stroke="#7B5EA7" strokeWidth="1.5"/>
      <path d="M6 7L10 10.5M18 7L14 10.5M6 17L10 13.5M18 17L14 13.5" stroke="#7B5EA7" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}

function ShieldCheckIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L3 7V12C3 16.55 6.84 20.74 12 22C17.16 20.74 21 16.55 21 12V7L12 2Z"
        stroke="#9B7EC8" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M8.5 12L11 14.5L15.5 10" stroke="#9B7EC8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function ChainIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
      <rect x="2"  y="8"  width="7" height="8" rx="3.5" stroke="#9B7EC8" strokeWidth="1.5"/>
      <rect x="15" y="8"  width="7" height="8" rx="3.5" stroke="#9B7EC8" strokeWidth="1.5"/>
      <line x1="9" y1="12" x2="15" y2="12" stroke="#9B7EC8" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="12" cy="6"  r="1.5" fill="#7B5EA7"/>
      <circle cx="12" cy="18" r="1.5" fill="#7B5EA7"/>
    </svg>
  );
}

/* ── Step data ─────────────────────────────────────────── */

const STEPS = [
  {
    num: '01',
    title: 'Bid Encryption',
    tagline: 'Your bid never travels in plaintext',
    desc: `Before your bid is transmitted, Arcium's client library encrypts it locally on your device using threshold encryption. The resulting ciphertext is mathematically bound to the MPC network — no single key, server, or node can decrypt it unilaterally. Even Gavel itself cannot read your bid.`,
    tech: ['AES-256-GCM', 'Threshold key distribution', 'Client-side only'],
    Icon: LockIcon,
  },
  {
    num: '02',
    title: 'Encrypted Comparison',
    tagline: 'Bids are ranked without being decrypted',
    desc: `Arcium's MPC network receives all encrypted bids and computes a ranking directly on ciphertext. Using garbled circuits and oblivious transfer protocols, multiple independent nodes collaborate to compare values — with no single node ever learning any individual bid amount at any point in the process.`,
    tech: ['Garbled circuits', 'Oblivious transfer', 'Honest-majority MPC'],
    Icon: NodesIcon,
  },
  {
    num: '03',
    title: 'Winner Determination',
    tagline: 'Identified entirely in the encrypted domain',
    desc: `The highest bid — and for Vickrey auctions, the second-highest — are determined entirely within the encrypted domain. Zero-knowledge proofs allow the result to be verified on-chain without revealing any individual bid. Not even the auctioneer learns what losing bids were.`,
    tech: ['Zero-knowledge proofs', 'Verifiable MPC output', 'Cryptographic audit trail'],
    Icon: ShieldCheckIcon,
  },
  {
    num: '04',
    title: 'On-chain Settlement',
    tagline: 'Results on Solana — losing bids destroyed',
    desc: `The winner's address and settlement price are committed to the Solana blockchain via Arcium's verifiable oracle. Losing bids are provably and permanently destroyed — no party can retrieve them after close. The result is final, transparent, and tamper-proof.`,
    tech: ['Solana program', 'Arcium MPC oracle', 'Verifiable bid deletion'],
    Icon: ChainIcon,
  },
];

/* ── Trust pillars ─────────────────────────────────────── */

const PILLARS = [
  {
    title: 'No Front-running',
    desc: 'Bids are encrypted before submission and invisible to all parties until the auction closes. No miner, validator, or operator can see or act on your bid.',
    icon: '⚡',
  },
  {
    title: 'No Collusion',
    desc: "Arcium's MPC requires an honest majority of nodes. Even if some nodes are malicious or colluding, they cannot reconstruct any bid without cooperation from the majority.",
    icon: '🤝',
  },
  {
    title: 'No Surveillance',
    desc: 'Losing bids are provably destroyed after settlement. No historical record of losing bid amounts exists — not on-chain, not on Arcium nodes, not anywhere.',
    icon: '🔒',
  },
];

function StepCard({ step, index }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        background: hovered ? C.cardHover : C.card,
        border: `1px solid ${hovered ? C.borderHover : C.border}`,
        borderRadius: '16px',
        padding: '36px 32px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: hovered ? 'translateY(-4px)' : 'none',
        boxShadow: hovered ? '0 24px 60px rgba(123, 94, 167, 0.2)' : '0 4px 20px rgba(0,0,0,0.4)',
        position: 'relative',
        overflow: 'hidden',
        animation: `fadeInUp 0.6s ease ${index * 0.1}s both`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* top accent bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: '2px',
        background: `linear-gradient(90deg, transparent, ${C.purpleLight}, transparent)`,
        opacity: hovered ? 1 : 0.3,
        transition: 'opacity 0.3s',
      }} />

      {/* step number */}
      <div style={{
        fontFamily: 'Cormorant Garamond, serif',
        fontSize: '4.5rem',
        fontWeight: 700,
        color: 'rgba(123, 94, 167, 0.18)',
        lineHeight: 1,
        position: 'absolute',
        top: '20px',
        right: '28px',
        letterSpacing: '-0.02em',
        userSelect: 'none',
        transition: 'color 0.3s',
        ...(hovered && { color: 'rgba(155, 126, 200, 0.25)' }),
      }}>
        {step.num}
      </div>

      {/* icon */}
      <div style={{
        width: '64px', height: '64px',
        borderRadius: '14px',
        background: 'rgba(123, 94, 167, 0.08)',
        border: `1px solid rgba(123, 94, 167, 0.18)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '22px',
        transition: 'all 0.3s',
        ...(hovered && {
          background: 'rgba(123, 94, 167, 0.15)',
          border: `1px solid rgba(155, 126, 200, 0.3)`,
          boxShadow: '0 4px 24px rgba(123, 94, 167, 0.25)',
        }),
      }}>
        <step.Icon />
      </div>

      {/* tagline */}
      <div style={{
        fontFamily: 'DM Mono, monospace',
        fontSize: '0.58rem',
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        color: C.purple,
        marginBottom: '8px',
      }}>
        {step.tagline}
      </div>

      {/* title */}
      <h3 style={{
        fontFamily: 'Cormorant Garamond, serif',
        fontSize: '1.8rem',
        fontWeight: 600,
        color: C.text,
        letterSpacing: '0.02em',
        lineHeight: 1.15,
        marginBottom: '16px',
      }}>
        {step.title}
      </h3>

      {/* description */}
      <p style={{
        fontFamily: 'DM Mono, monospace',
        fontSize: '0.65rem',
        color: C.textMuted,
        lineHeight: 1.8,
        letterSpacing: '0.04em',
        marginBottom: '22px',
      }}>
        {step.desc}
      </p>

      {/* tech pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
        {step.tech.map((t) => (
          <span key={t} style={{
            fontFamily: 'DM Mono, monospace',
            fontSize: '0.54rem',
            letterSpacing: '0.1em',
            color: C.textDark,
            background: 'rgba(123, 94, 167, 0.07)',
            border: `1px solid rgba(123, 94, 167, 0.12)`,
            padding: '3px 10px',
            borderRadius: '20px',
          }}>
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function HowItWorksPage() {
  const navigate = useNavigate();
  const [ctaHover, setCtaHover] = useState(false);
  const [backHover, setBackHover] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div style={{ background: C.bg, minHeight: '100vh', paddingTop: '64px' }}>

      {/* ── Back button ───────────────────────────────────── */}
      <div style={{
        padding: isMobile ? '20px 20px 0' : '24px 60px 0',
        maxWidth: '1320px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box',
      }}>
        <button
          onClick={() => navigate('/')}
          onMouseEnter={() => setBackHover(true)}
          onMouseLeave={() => setBackHover(false)}
          style={{
            fontFamily: 'DM Mono, monospace',
            fontSize: '0.6rem',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: backHover ? C.textMuted : C.textDark,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'color 0.2s',
          }}
        >
          ← Back to Auctions
        </button>
      </div>

      {/* ── Hero ──────────────────────────────────────────── */}
      <section style={{
        padding: '90px 60px 80px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: `
          radial-gradient(ellipse 70% 55% at 50% -5%, rgba(123, 94, 167, 0.28) 0%, transparent 65%),
          #050507
        `,
      }}>
        {/* grid */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: `
            linear-gradient(rgba(123, 94, 167, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(123, 94, 167, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
        }} />

        <div style={{
          fontFamily: 'DM Mono, monospace',
          fontSize: '0.6rem',
          letterSpacing: '0.28em',
          color: C.purple,
          textTransform: 'uppercase',
          marginBottom: '18px',
          animation: 'fadeInUp 0.7s ease both',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
        }}>
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: C.purpleLight, animation: 'pulse 2s infinite' }} />
          Arcium MPC · Cryptographic Privacy
        </div>

        <h1 style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: 'clamp(2.8rem, 7vw, 5rem)',
          fontWeight: 700,
          letterSpacing: '0.08em',
          color: C.text,
          lineHeight: 1,
          marginBottom: '20px',
          animation: 'fadeInUp 0.7s ease 0.08s both',
        }}>
          How It Works
        </h1>

        <p style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontStyle: 'italic',
          fontSize: 'clamp(1rem, 2.2vw, 1.35rem)',
          fontWeight: 300,
          color: C.textMuted,
          maxWidth: '560px',
          lineHeight: 1.65,
          margin: '0 auto 14px',
          animation: 'fadeInUp 0.7s ease 0.16s both',
        }}>
          Sealed-bid auctions where cryptography — not trust — guarantees privacy.
          Every bid encrypted, every result verifiable.
        </p>

        <p style={{
          fontFamily: 'DM Mono, monospace',
          fontSize: '0.62rem',
          color: C.textDark,
          letterSpacing: '0.1em',
          animation: 'fadeInUp 0.7s ease 0.24s both',
        }}>
          Powered by Arcium's Multi-Party Computation network
        </p>
      </section>

      {/* ── 4-step grid ───────────────────────────────────── */}
      <section style={{
        padding: isMobile ? '0 16px 60px' : '0 60px 80px',
        maxWidth: '1320px',
        margin: '0 auto',
        width: '100%',
      }}>
        {/* connector line hint */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          marginBottom: '40px',
          fontFamily: 'DM Mono, monospace',
          fontSize: '0.55rem',
          color: C.textDark,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
        }}>
          <div style={{ width: '40px', height: '1px', background: `linear-gradient(to right, transparent, ${C.purple})` }} />
          Four cryptographic steps
          <div style={{ width: '40px', height: '1px', background: `linear-gradient(to left, transparent, ${C.purple})` }} />
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '22px',
        }}>
          {STEPS.map((step, i) => (
            <StepCard key={step.num} step={step} index={i} />
          ))}
        </div>
      </section>

      {/* ── Divider ───────────────────────────────────────── */}
      <div style={{
        maxWidth: '1320px', margin: '0 auto', padding: '0 60px',
      }}>
        <div style={{ height: '1px', background: `linear-gradient(to right, transparent, rgba(123,94,167,0.25), transparent)` }} />
      </div>

      {/* ── Trust pillars ─────────────────────────────────── */}
      <section style={{
        padding: isMobile ? '60px 16px' : '80px 60px',
        maxWidth: '1320px',
        margin: '0 auto',
        width: '100%',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '52px' }}>
          <div style={{
            fontFamily: 'DM Mono, monospace',
            fontSize: '0.58rem',
            letterSpacing: '0.26em',
            color: C.purple,
            textTransform: 'uppercase',
            marginBottom: '12px',
          }}>
            Guarantees
          </div>
          <h2 style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
            fontWeight: 500,
            color: C.text,
            letterSpacing: '0.04em',
          }}>
            What Arcium MPC Prevents
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '20px',
        }}>
          {PILLARS.map((p, i) => (
            <div key={p.title} style={{
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: '14px',
              padding: '32px 28px',
              animation: `fadeInUp 0.6s ease ${0.3 + i * 0.1}s both`,
            }}>
              <div style={{ fontSize: '1.8rem', marginBottom: '14px' }}>{p.icon}</div>
              <h3 style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: '1.5rem',
                fontWeight: 600,
                color: C.text,
                marginBottom: '10px',
                letterSpacing: '0.02em',
              }}>
                {p.title}
              </h3>
              <p style={{
                fontFamily: 'DM Mono, monospace',
                fontSize: '0.62rem',
                color: C.textMuted,
                lineHeight: 1.8,
                letterSpacing: '0.04em',
              }}>
                {p.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Divider ───────────────────────────────────────── */}
      <div style={{ maxWidth: '1320px', margin: '0 auto', padding: '0 60px' }}>
        <div style={{ height: '1px', background: `linear-gradient(to right, transparent, rgba(123,94,167,0.25), transparent)` }} />
      </div>

      {/* ── Arcium deep-dive strip ───────────────────────── */}
      <section style={{
        padding: isMobile ? '60px 20px' : '80px 60px',
        maxWidth: '1320px',
        margin: '0 auto',
        width: '100%',
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
        gap: isMobile ? '32px' : '48px',
        alignItems: 'center',
      }}>
        <div>
          <div style={{
            fontFamily: 'DM Mono, monospace',
            fontSize: '0.58rem',
            letterSpacing: '0.26em',
            color: C.purple,
            textTransform: 'uppercase',
            marginBottom: '14px',
          }}>
            About Arcium
          </div>
          <h2 style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)',
            fontWeight: 500,
            color: C.text,
            lineHeight: 1.2,
            marginBottom: '18px',
            letterSpacing: '0.02em',
          }}>
            Multi-Party Computation at the Infrastructure Layer
          </h2>
          <p style={{
            fontFamily: 'DM Mono, monospace',
            fontSize: '0.65rem',
            color: C.textMuted,
            lineHeight: 1.85,
            letterSpacing: '0.04em',
            marginBottom: '14px',
          }}>
            Arcium is a decentralized confidential computing network. Its MPC clusters allow programs to run on encrypted data — producing correct, verifiable outputs without any node ever accessing plaintext inputs.
          </p>
          <p style={{
            fontFamily: 'DM Mono, monospace',
            fontSize: '0.65rem',
            color: C.textMuted,
            lineHeight: 1.85,
            letterSpacing: '0.04em',
          }}>
            For Gavel, this means the entire bidding process — comparison, ranking, and winner selection — happens inside an encrypted computation environment. Privacy is enforced by mathematics, not policy.
          </p>
        </div>

        {/* Tech specs card */}
        <div style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: '16px',
          padding: '32px',
        }}>
          <div style={{
            fontFamily: 'DM Mono, monospace',
            fontSize: '0.55rem',
            letterSpacing: '0.24em',
            color: C.textDark,
            textTransform: 'uppercase',
            marginBottom: '20px',
            paddingBottom: '14px',
            borderBottom: `1px solid ${C.border}`,
          }}>
            Technical Stack
          </div>
          {[
            { label: 'Computation', value: 'Garbled circuits + secret sharing' },
            { label: 'Encryption',  value: 'AES-256-GCM, threshold keys' },
            { label: 'Proofs',      value: 'zkSNARKs for output verification' },
            { label: 'Network',     value: 'Arcium MPC clusters (decentralized)' },
            { label: 'Settlement',  value: 'Solana · on-chain finality' },
            { label: 'Leakage',     value: 'Zero — information-theoretic' },
          ].map((row, i) => (
            <div key={row.label} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              padding: '10px 0',
              borderBottom: i < 5 ? `1px solid rgba(123,94,167,0.07)` : 'none',
              gap: '16px',
            }}>
              <span style={{
                fontFamily: 'DM Mono, monospace',
                fontSize: '0.58rem',
                color: C.textDark,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                flexShrink: 0,
              }}>
                {row.label}
              </span>
              <span style={{
                fontFamily: 'DM Mono, monospace',
                fontSize: '0.62rem',
                color: C.textMuted,
                textAlign: 'right',
                letterSpacing: '0.04em',
              }}>
                {row.value}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────── */}
      <section style={{
        padding: '0 60px 100px',
        textAlign: 'center',
      }}>
        <div style={{
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
        }}>
          <p style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontStyle: 'italic',
            fontSize: '1.2rem',
            color: C.textMuted,
            letterSpacing: '0.03em',
          }}>
            Ready to place your first sealed bid?
          </p>
          <button
            onClick={() => navigate('/')}
            style={{
              fontFamily: 'DM Mono, monospace',
              fontSize: '0.72rem',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              padding: '15px 42px',
              background: ctaHover
                ? 'linear-gradient(135deg, #9B7EC8, #7B5EA7)'
                : 'linear-gradient(135deg, #7B5EA7, #5a3f8a)',
              color: '#fff',
              border: 'none',
              borderRadius: '7px',
              cursor: 'pointer',
              transition: 'all 0.3s',
              transform: ctaHover ? 'translateY(-2px)' : 'none',
              boxShadow: ctaHover
                ? '0 16px 48px rgba(123, 94, 167, 0.5)'
                : '0 6px 24px rgba(123, 94, 167, 0.28)',
            }}
            onMouseEnter={() => setCtaHover(true)}
            onMouseLeave={() => setCtaHover(false)}
          >
            Browse Current Auctions →
          </button>
        </div>
      </section>

    </div>
  );
}
