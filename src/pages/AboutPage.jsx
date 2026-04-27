import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '../hooks/useIsMobile';

const C = {
  bg: '#050507', card: '#0c0a14',
  border: 'rgba(123, 94, 167, 0.16)', purple: '#7B5EA7',
  purpleLight: '#9B7EC8', text: '#e8e4f0',
  textMuted: '#9589aa', textDark: '#4e4660',
};

const TEAM = [
  { role: 'Cryptography', desc: 'Zero-knowledge bid encryption via Arcium MPC on Solana.' },
  { role: 'Mechanism Design', desc: 'Vickrey and first-price sealed-bid auction theory.' },
  { role: 'Protocol Engineering', desc: 'On-chain settlement, computation finalization, and dispute resolution.' },
  { role: 'Product', desc: 'Auction UX, trust & safety, seller and bidder tooling.' },
];

const TECH = [
  { label: 'Arcium MPC', body: "Bids are encrypted client-side and processed by Arcium's multi-party computation network — no single party, including Gavel, can reconstruct individual bid amounts." },
  { label: 'Solana', body: 'All settlements are on-chain. Auction creation, bid commitment, and winner declaration are anchored to Solana for immutability and auditability.' },
  { label: 'x25519 + RescueCipher', body: 'Each bid is encrypted using an ephemeral x25519 key exchange and the Rescue cipher over Curve25519\'s scalar field before leaving the browser.' },
  { label: 'Vickrey Mechanism', body: "Second-price sealed-bid format ensures bidding your true valuation is the dominant strategy. You can't gain by bidding above or below what the item is worth to you." },
];

export default function AboutPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  return (
    <div style={{ background: C.bg, minHeight: '100vh', paddingTop: '64px', cursor: 'default' }}>
      <div style={{
        maxWidth: '860px', margin: '0 auto',
        padding: isMobile ? '48px 20px 80px' : '64px 48px 100px',
        width: '100%',
      }}>

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
        <div style={{ marginBottom: '64px' }}>
          <div style={{
            fontFamily: 'DM Mono, monospace', fontSize: '0.55rem',
            letterSpacing: '0.3em', color: C.purple,
            textTransform: 'uppercase', marginBottom: '14px',
          }}>
            About
          </div>
          <h1 style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 'clamp(2.4rem, 6vw, 3.8rem)',
            fontWeight: 600, color: C.text,
            letterSpacing: '0.04em', lineHeight: 1.05, marginBottom: '20px',
          }}>
            Built for<br />
            <span style={{ color: C.textMuted, fontStyle: 'italic', fontWeight: 300 }}>private auctions.</span>
          </h1>
          <p style={{
            fontFamily: 'DM Mono, monospace', fontSize: '0.65rem',
            color: C.textMuted, lineHeight: 1.8, letterSpacing: '0.04em',
            maxWidth: '600px',
          }}>
            Gavel is a sealed-bid auction platform built on Arcium's MPC network on Solana.
            Every bid is encrypted on the bidder's device and never leaves the browser in plaintext —
            not even Gavel's servers can see what you bid.
          </p>
        </div>

        {/* Mission */}
        <div style={{
          padding: '24px 28px',
          background: 'rgba(123, 94, 167, 0.05)',
          border: '1px solid rgba(123, 94, 167, 0.18)',
          borderRadius: '12px', marginBottom: '56px',
        }}>
          <div style={{
            fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem',
            fontWeight: 600, color: C.text, letterSpacing: '0.02em',
            marginBottom: '12px',
          }}>
            Our mission
          </div>
          <p style={{
            fontFamily: 'DM Mono, monospace', fontSize: '0.63rem',
            color: C.textMuted, lineHeight: 1.8, letterSpacing: '0.04em',
          }}>
            Traditional auction platforms expose bid amounts in real time, creating information asymmetry
            that advantages repeat participants and market makers. Gavel fixes this by making all bids
            cryptographically private until the auction closes — creating a level playing field for
            every participant, every time.
          </p>
        </div>

        {/* Technology */}
        <div style={{ marginBottom: '56px' }}>
          <div style={{
            fontFamily: 'DM Mono, monospace', fontSize: '0.55rem',
            letterSpacing: '0.24em', textTransform: 'uppercase',
            color: C.textDark, marginBottom: '20px', paddingBottom: '14px',
            borderBottom: `1px solid rgba(123, 94, 167, 0.08)`,
          }}>
            Technology
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {TECH.map(t => (
              <div key={t.label} style={{
                padding: '18px 20px',
                background: C.card, border: `1px solid ${C.border}`,
                borderRadius: '10px', display: 'flex', gap: '16px',
              }}>
                <div style={{
                  fontFamily: 'DM Mono, monospace', fontSize: '0.6rem',
                  color: C.purpleLight, letterSpacing: '0.1em',
                  textTransform: 'uppercase', flexShrink: 0,
                  minWidth: isMobile ? '0' : '160px', paddingTop: '1px',
                }}>
                  {t.label}
                </div>
                <p style={{
                  fontFamily: 'DM Mono, monospace', fontSize: '0.62rem',
                  color: C.textMuted, lineHeight: 1.7, letterSpacing: '0.04em',
                }}>
                  {t.body}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div style={{ marginBottom: '56px' }}>
          <div style={{
            fontFamily: 'DM Mono, monospace', fontSize: '0.55rem',
            letterSpacing: '0.24em', textTransform: 'uppercase',
            color: C.textDark, marginBottom: '20px', paddingBottom: '14px',
            borderBottom: `1px solid rgba(123, 94, 167, 0.08)`,
          }}>
            The Team
          </div>
          <p style={{
            fontFamily: 'DM Mono, monospace', fontSize: '0.63rem',
            color: C.textMuted, lineHeight: 1.8, letterSpacing: '0.04em',
            marginBottom: '24px',
          }}>
            Built by the Gavel team — a group of engineers, cryptographers, and mechanism designers
            focused on making sealed-bid auctions practical and trustless.
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: '12px',
          }}>
            {TEAM.map(t => (
              <div key={t.role} style={{
                padding: '16px 18px',
                background: C.card, border: `1px solid ${C.border}`,
                borderRadius: '9px',
              }}>
                <div style={{
                  fontFamily: 'DM Mono, monospace', fontSize: '0.57rem',
                  color: C.purpleLight, letterSpacing: '0.1em',
                  textTransform: 'uppercase', marginBottom: '7px',
                }}>
                  {t.role}
                </div>
                <p style={{
                  fontFamily: 'DM Mono, monospace', fontSize: '0.6rem',
                  color: C.textMuted, lineHeight: 1.65, letterSpacing: '0.04em',
                }}>
                  {t.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div style={{
          padding: '24px 26px',
          background: C.card, border: `1px solid ${C.border}`,
          borderRadius: '12px', display: 'flex',
          justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: '16px',
        }}>
          <div>
            <div style={{
              fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem',
              fontWeight: 600, color: C.text, marginBottom: '5px',
            }}>
              Get in touch
            </div>
            <p style={{
              fontFamily: 'DM Mono, monospace', fontSize: '0.6rem',
              color: C.textDark, letterSpacing: '0.06em',
            }}>
              Questions, partnerships, or press enquiries.
            </p>
          </div>
          <a
            href="mailto:support@gavel.gg"
            style={{
              fontFamily: 'DM Mono, monospace', fontSize: '0.62rem',
              letterSpacing: '0.12em', textTransform: 'uppercase',
              padding: '11px 22px',
              background: 'linear-gradient(135deg, #7B5EA7, #5a3f8a)',
              color: '#fff', border: 'none', borderRadius: '8px',
              cursor: 'pointer', textDecoration: 'none',
              display: 'inline-block', flexShrink: 0,
            }}
          >
            support@gavel.gg →
          </a>
        </div>

      </div>
    </div>
  );
}
