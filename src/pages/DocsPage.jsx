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

const STEPS = [
  {
    n: '01',
    title: 'Enter Your Bid',
    body: "Choose an auction, type your amount in SOL, and select your auction type — First-Price or Vickrey. Your bid is visible only to you until you submit.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"
          stroke="#9B7EC8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
          stroke="#9B7EC8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    n: '02',
    title: 'Local Encryption',
    body: "Before leaving your device, your bid is encrypted using Arcium's client-side library. Only an encrypted commitment — not the amount — is ever transmitted.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <rect x="5" y="11" width="14" height="11" rx="2" stroke="#9B7EC8" strokeWidth="1.8"/>
        <path d="M8 11V7a4 4 0 018 0v4" stroke="#9B7EC8" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    n: '03',
    title: 'MPC Submission',
    body: "The encrypted commitment is submitted to Arcium's multi-party computation network. Multiple independent nodes hold key shares — no single party can reconstruct your bid.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="3" stroke="#9B7EC8" strokeWidth="1.8"/>
        <circle cx="3" cy="5" r="1.5" stroke="#9B7EC8" strokeWidth="1.8"/>
        <circle cx="21" cy="5" r="1.5" stroke="#9B7EC8" strokeWidth="1.8"/>
        <circle cx="3" cy="19" r="1.5" stroke="#9B7EC8" strokeWidth="1.8"/>
        <circle cx="21" cy="19" r="1.5" stroke="#9B7EC8" strokeWidth="1.8"/>
        <path d="M4.5 5.5L9 10M15 10l4.5-4.5M4.5 18.5L9 14M15 14l4.5 4.5"
          stroke="#9B7EC8" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    n: '04',
    title: 'Reveal at Close',
    body: "When the timer expires, Arcium's nodes collaboratively compute the winner and settlement price without exposing individual bids. The result is posted on-chain.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z"
          stroke="#9B7EC8" strokeWidth="1.8"/>
        <circle cx="12" cy="12" r="3" stroke="#9B7EC8" strokeWidth="1.8"/>
      </svg>
    ),
  },
];

const RULES = [
  {
    label: 'Minimum bid',
    body: 'Each auction has a floor price. Bids below the floor are rejected before submission.',
  },
  {
    label: 'Reserve price',
    body: 'Some items carry a seller reserve. If the winning bid falls short of the reserve, the seller may decline to complete the sale. Reserve status is displayed on every auction card.',
  },
  {
    label: 'Anti-sniping',
    body: 'Any bid placed within the final 5 minutes automatically extends the closing time by 5 minutes, giving all participants a fair opportunity to respond.',
  },
  {
    label: 'Valid bids',
    body: 'Bids require a connected Solana wallet and a signed wallet authorization. Once submitted, bids are cryptographically sealed and cannot be retracted.',
  },
];

const SETTLEMENT_STEPS = [
  'Arcium MPC reveals only the winner address and settlement price — no other bid amounts are disclosed.',
  'For Vickrey auctions: the winner pays the second-highest sealed bid amount.',
  'For First-Price auctions: the winner pays their own bid amount.',
  'The winner receives a settlement notice. Payment is processed on-chain via Solana, typically within 24 hours of close.',
  'Unsold items (reserve not met) are returned to the seller within 48 hours.',
];

function Section({ tag, title, children }) {
  return (
    <section style={{ marginBottom: '72px' }}>
      <div style={{
        fontFamily: 'DM Mono, monospace',
        fontSize: '0.55rem',
        letterSpacing: '0.3em',
        color: C.purple,
        textTransform: 'uppercase',
        marginBottom: '10px',
      }}>
        {tag}
      </div>
      <h2 style={{
        fontFamily: 'Cormorant Garamond, serif',
        fontSize: 'clamp(1.7rem, 3vw, 2.3rem)',
        fontWeight: 500,
        color: C.text,
        letterSpacing: '0.03em',
        lineHeight: 1.15,
        marginBottom: '36px',
        paddingBottom: '20px',
        borderBottom: `1px solid rgba(123, 94, 167, 0.12)`,
      }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function DocsPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

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
        <div style={{ marginBottom: '72px' }}>
          <div style={{
            fontFamily: 'DM Mono, monospace',
            fontSize: '0.55rem',
            letterSpacing: '0.3em',
            color: C.purple,
            textTransform: 'uppercase',
            marginBottom: '14px',
          }}>
            Documentation
          </div>
          <h1 style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 'clamp(2.6rem, 6vw, 4rem)',
            fontWeight: 600,
            color: C.text,
            letterSpacing: '0.04em',
            lineHeight: 1.05,
            marginBottom: '16px',
          }}>
            How Gavel Works
          </h1>
          <p style={{
            fontFamily: 'DM Mono, monospace',
            fontSize: '0.65rem',
            color: C.textDark,
            letterSpacing: '0.08em',
            lineHeight: 1.7,
            maxWidth: '560px',
          }}>
            A complete guide to sealed-bid auctions on Gavel — from bid submission through MPC settlement.
          </p>
        </div>

        {/* Section 1: How Bidding Works */}
        <Section tag="Section 01" title="How Bidding Works">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
            {STEPS.map((step, i) => (
              <div key={step.n} style={{ display: 'flex', gap: '0' }}>
                {/* timeline spine */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: '24px', flexShrink: 0 }}>
                  <div style={{
                    width: '42px', height: '42px',
                    background: 'rgba(123, 94, 167, 0.1)',
                    border: `1px solid rgba(123, 94, 167, 0.25)`,
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {step.icon}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div style={{
                      width: '1px', flex: 1, minHeight: '40px',
                      background: 'linear-gradient(to bottom, rgba(123, 94, 167, 0.3), rgba(123, 94, 167, 0.05))',
                      margin: '6px 0',
                    }} />
                  )}
                </div>

                {/* content */}
                <div style={{ paddingBottom: i < STEPS.length - 1 ? '32px' : '0', paddingTop: '8px' }}>
                  <div style={{
                    display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '8px',
                  }}>
                    <span style={{
                      fontFamily: 'DM Mono, monospace',
                      fontSize: '0.5rem',
                      color: C.purple,
                      letterSpacing: '0.2em',
                    }}>
                      {step.n}
                    </span>
                    <h3 style={{
                      fontFamily: 'Cormorant Garamond, serif',
                      fontSize: '1.25rem',
                      fontWeight: 600,
                      color: C.text,
                      letterSpacing: '0.02em',
                    }}>
                      {step.title}
                    </h3>
                  </div>
                  <p style={{
                    fontFamily: 'DM Mono, monospace',
                    fontSize: '0.62rem',
                    color: C.textMuted,
                    lineHeight: 1.75,
                    letterSpacing: '0.04em',
                    maxWidth: '560px',
                  }}>
                    {step.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Section 2: Auction Rules */}
        <Section tag="Section 02" title="Auction Rules">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {RULES.map(r => (
              <div key={r.label} style={{
                padding: '18px 20px',
                background: C.card,
                border: `1px solid ${C.border}`,
                borderRadius: '10px',
                display: 'flex',
                gap: '16px',
                alignItems: 'flex-start',
              }}>
                <div style={{
                  width: '5px', height: '5px', borderRadius: '50%',
                  background: C.purple,
                  flexShrink: 0,
                  marginTop: '8px',
                }} />
                <div>
                  <div style={{
                    fontFamily: 'DM Mono, monospace',
                    fontSize: '0.62rem',
                    color: C.purpleLight,
                    letterSpacing: '0.1em',
                    marginBottom: '5px',
                    textTransform: 'uppercase',
                  }}>
                    {r.label}
                  </div>
                  <p style={{
                    fontFamily: 'DM Mono, monospace',
                    fontSize: '0.62rem',
                    color: C.textMuted,
                    lineHeight: 1.7,
                    letterSpacing: '0.04em',
                  }}>
                    {r.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Section 3: Payment & Settlement */}
        <Section tag="Section 03" title="Payment & Settlement">
          <div style={{
            padding: '24px',
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: '12px',
          }}>
            {SETTLEMENT_STEPS.map((s, i) => (
              <div key={i} style={{
                display: 'flex',
                gap: '16px',
                alignItems: 'flex-start',
                paddingBottom: i < SETTLEMENT_STEPS.length - 1 ? '18px' : 0,
                borderBottom: i < SETTLEMENT_STEPS.length - 1 ? '1px solid rgba(123, 94, 167, 0.08)' : 'none',
                marginBottom: i < SETTLEMENT_STEPS.length - 1 ? '18px' : 0,
              }}>
                <div style={{
                  width: '22px', height: '22px',
                  background: 'rgba(123, 94, 167, 0.12)',
                  border: '1px solid rgba(123, 94, 167, 0.2)',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  fontFamily: 'DM Mono, monospace',
                  fontSize: '0.52rem',
                  color: C.purple,
                }}>
                  {i + 1}
                </div>
                <p style={{
                  fontFamily: 'DM Mono, monospace',
                  fontSize: '0.62rem',
                  color: C.textMuted,
                  lineHeight: 1.7,
                  letterSpacing: '0.04em',
                  paddingTop: '2px',
                }}>
                  {s}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* Section 4: Dispute Resolution */}
        <Section tag="Section 04" title="Dispute Resolution">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{
              padding: '20px 22px',
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: '10px',
            }}>
              <p style={{
                fontFamily: 'DM Mono, monospace',
                fontSize: '0.62rem',
                color: C.textMuted,
                lineHeight: 1.75,
                letterSpacing: '0.04em',
                marginBottom: '16px',
              }}>
                If you believe an auction outcome was incorrect or a rule was violated, you may file a dispute. Disputes must be raised within <span style={{ color: C.purpleLight }}>72 hours</span> of auction close.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  'Email support@gavel.gg with your wallet address, the auction ID, and a description of the issue.',
                  "Gavel's resolution team will acknowledge your request and review within 5 business days.",
                  'Decisions from the resolution team are final. Gavel reserves the right to void any auction where fraud, manipulation, or system error is detected.',
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{
                      width: '5px', height: '5px', borderRadius: '50%',
                      background: C.textDark, flexShrink: 0, marginTop: '8px',
                    }} />
                    <p style={{
                      fontFamily: 'DM Mono, monospace',
                      fontSize: '0.62rem',
                      color: C.textMuted,
                      lineHeight: 1.7,
                      letterSpacing: '0.04em',
                    }}>
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              padding: '16px 20px',
              background: 'rgba(123, 94, 167, 0.05)',
              border: '1px solid rgba(123, 94, 167, 0.18)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                  stroke="#9B7EC8" strokeWidth="1.8"/>
                <polyline points="22,6 12,13 2,6" stroke="#9B7EC8" strokeWidth="1.8"/>
              </svg>
              <div>
                <div style={{
                  fontFamily: 'DM Mono, monospace', fontSize: '0.52rem',
                  color: C.textDark, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '3px',
                }}>
                  Support Contact
                </div>
                <span style={{
                  fontFamily: 'DM Mono, monospace', fontSize: '0.62rem',
                  color: C.purpleLight, letterSpacing: '0.06em',
                }}>
                  support@gavel.gg
                </span>
              </div>
            </div>
          </div>
        </Section>

      </div>
    </div>
  );
}
