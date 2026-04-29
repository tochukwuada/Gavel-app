import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { AUCTIONS } from '../data/auctions';
import { useIsMobile } from '../hooks/useIsMobile';
import AuctionCard from '../components/AuctionCard';

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

const STATS = [
  { label: 'Active Auctions', value: '6' },
  { label: 'Total Volume',    value: '$4.2M' },
  { label: 'Participants',    value: '847' },
  { label: 'Bids Leaked',     value: '0', highlight: true },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { connected } = useWallet();
  const { setVisible } = useWalletModal();
  const isMobile = useIsMobile();
  const [btnHover, setBtnHover] = useState(null);
  const [accessHover, setAccessHover] = useState(false);
  const [, setRefreshKey] = useState(0);

  useEffect(() => {
    const refresh = () => setRefreshKey(k => k + 1);
    window.addEventListener('gavel:auction-added', refresh);
    return () => window.removeEventListener('gavel:auction-added', refresh);
  }, []);

  return (
    <div style={{ background: C.bg, minHeight: '100vh' }}>

      {/* ── Access control banner ────────────────────────── */}
      {!connected && (
        <div style={{
          position: 'fixed',
          top: '64px', left: 0, right: 0,
          zIndex: 100,
          background: 'rgba(10, 8, 18, 0.96)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(123, 94, 167, 0.22)',
          padding: isMobile ? '11px 16px' : '11px 48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap',
          animation: 'slideDown 0.3s ease both',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
              <rect x="5" y="11" width="14" height="11" rx="2" stroke="#9B7EC8" strokeWidth="1.8"/>
              <path d="M8 11V7a4 4 0 018 0v4" stroke="#9B7EC8" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            <span style={{
              fontFamily: 'DM Mono, monospace',
              fontSize: '0.58rem',
              letterSpacing: '0.1em',
              color: C.textMuted,
              cursor: 'default',
              userSelect: 'none',
            }}>
              Gavel is invite-only.{' '}
              <span style={{ color: C.purpleLight, cursor: 'default', userSelect: 'none' }}>
                Connect your wallet to participate in auctions.
              </span>
            </span>
          </div>
          <button
            onClick={() => setVisible(true)}
            onMouseEnter={() => setAccessHover(true)}
            onMouseLeave={() => setAccessHover(false)}
            style={{
              fontFamily: 'DM Mono, monospace',
              fontSize: '0.58rem',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              padding: '7px 18px',
              background: accessHover
                ? 'linear-gradient(135deg, #9B7EC8, #7B5EA7)'
                : 'rgba(123, 94, 167, 0.12)',
              color: accessHover ? '#fff' : C.purpleLight,
              border: `1px solid ${accessHover ? 'transparent' : 'rgba(155, 126, 200, 0.3)'}`,
              borderRadius: '5px',
              cursor: 'pointer',
              transition: 'all 0.25s',
              flexShrink: 0,
            }}
          >
            Request Access →
          </button>
        </div>
      )}

      {/* ── Hero ─────────────────────────────────────────── */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        position: 'relative',
        padding: connected ? '120px 40px 100px' : '148px 40px 100px',
        overflow: 'hidden',
        cursor: 'default',
        background: `
          radial-gradient(ellipse 75% 55% at 50% -5%, rgba(123, 94, 167, 0.32) 0%, transparent 65%),
          radial-gradient(ellipse 40% 35% at 15% 85%, rgba(90, 60, 140, 0.1) 0%, transparent 55%),
          radial-gradient(ellipse 40% 35% at 85% 85%, rgba(90, 60, 140, 0.1) 0%, transparent 55%),
          #050507
        `,
      }}>
        {/* Grid overlay */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: `
            linear-gradient(rgba(123, 94, 167, 0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(123, 94, 167, 0.035) 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
        }} />

        {/* Dot matrix overlay */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'radial-gradient(rgba(123, 94, 167, 0.15) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          backgroundPosition: '16px 16px',
          maskImage: 'radial-gradient(ellipse 80% 70% at center, transparent 40%, black 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at center, transparent 40%, black 100%)',
        }} />

        {/* Live tag */}
        <div style={{
          fontFamily: 'DM Mono, monospace',
          fontSize: '0.75rem',
          letterSpacing: '0.26em',
          color: C.purple,
          textTransform: 'uppercase',
          marginBottom: '36px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          animation: 'fadeInUp 0.9s ease both',
          cursor: 'default',
          userSelect: 'none',
        }}>
          <span style={{
            width: '5px', height: '5px', borderRadius: '50%',
            background: C.purpleLight, animation: 'pulse 2s infinite',
          }} />
          Arcium Encrypted &nbsp;·&nbsp; Sealed Bids &nbsp;·&nbsp; MPC Settlement
          <span style={{
            width: '5px', height: '5px', borderRadius: '50%',
            background: C.purpleLight, animation: 'pulse 2s infinite 0.6s',
          }} />
        </div>

        {/* Title */}
        <h1 style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: 'clamp(5.5rem, 16vw, 11rem)',
          fontWeight: 700,
          letterSpacing: '0.28em',
          textTransform: 'uppercase',
          color: C.text,
          lineHeight: 0.88,
          marginBottom: '32px',
          animation: 'fadeInUp 0.9s ease 0.1s both',
          textShadow: '0 0 80px rgba(155, 126, 200, 0.18)',
          cursor: 'default',
          userSelect: 'none',
        }}>
          GAVEL
        </h1>

        {/* Tagline */}
        <p style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontStyle: 'italic',
          fontSize: 'clamp(1.1rem, 2.4vw, 1.45rem)',
          fontWeight: 300,
          color: C.textMuted,
          maxWidth: '600px',
          lineHeight: 1.65,
          marginBottom: '14px',
          animation: 'fadeInUp 0.9s ease 0.2s both',
          cursor: 'default',
          userSelect: 'none',
        }}>
          The first sealed-bid auction house where every bid is encrypted.
          No front-running. No collusion. No surveillance.
        </p>

        <p style={{
          fontFamily: 'DM Mono, monospace',
          fontSize: '0.62rem',
          color: C.textDark,
          letterSpacing: '0.12em',
          marginBottom: '52px',
          animation: 'fadeInUp 0.9s ease 0.3s both',
          cursor: 'default',
          userSelect: 'none',
        }}>
          Powered by Arcium's Multi-Party Computation
        </p>

        {/* CTAs */}
        <div style={{
          display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center',
          animation: 'fadeInUp 0.9s ease 0.4s both',
        }}>
          <button
            style={{
              fontFamily: 'DM Mono, monospace',
              fontSize: '0.72rem',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              padding: '15px 38px',
              background: btnHover === 'browse'
                ? 'linear-gradient(135deg, #9B7EC8, #7B5EA7)'
                : 'linear-gradient(135deg, #7B5EA7 0%, #5a3f8a 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '7px',
              cursor: 'pointer',
              transition: 'all 0.3s',
              transform: btnHover === 'browse' ? 'translateY(-2px)' : 'none',
              boxShadow: btnHover === 'browse'
                ? '0 16px 48px rgba(123, 94, 167, 0.55)'
                : '0 6px 28px rgba(123, 94, 167, 0.32)',
            }}
            onMouseEnter={() => setBtnHover('browse')}
            onMouseLeave={() => setBtnHover(null)}
            onClick={() => document.getElementById('auctions')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Browse Auctions
          </button>
          <button
            style={{
              fontFamily: 'DM Mono, monospace',
              fontSize: '0.72rem',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              padding: '15px 38px',
              background: 'transparent',
              color: btnHover === 'how' ? C.purpleLight : C.textMuted,
              border: `1px solid ${btnHover === 'how' ? 'rgba(155, 126, 200, 0.5)' : 'rgba(123, 94, 167, 0.25)'}`,
              borderRadius: '7px',
              cursor: 'pointer',
              transition: 'all 0.3s',
              transform: btnHover === 'how' ? 'translateY(-2px)' : 'none',
            }}
            onMouseEnter={() => setBtnHover('how')}
            onMouseLeave={() => setBtnHover(null)}
            onClick={() => navigate('/how-it-works')}
          >
            How It Works
          </button>
        </div>

        {/* Scroll indicator */}
        <div style={{
          position: 'absolute',
          bottom: '36px', left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
          animation: 'fadeInUp 1s ease 1.2s both',
          cursor: 'default',
          userSelect: 'none',
        }}>
          <span style={{
            fontFamily: 'DM Mono, monospace',
            fontSize: '0.52rem',
            color: C.textDark,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            cursor: 'default',
            userSelect: 'none',
          }}>
            Scroll
          </span>
          <div style={{
            width: '1px', height: '42px',
            background: `linear-gradient(to bottom, ${C.purple}, transparent)`,
          }} />
        </div>
      </section>

      {/* ── Stats bar ────────────────────────────────────── */}
      <div style={{
        background: 'rgba(12, 10, 20, 0.9)',
        borderTop: `1px solid rgba(123, 94, 167, 0.12)`,
        borderBottom: `1px solid rgba(123, 94, 167, 0.12)`,
        padding: isMobile ? '20px 20px' : '24px 60px',
        display: 'flex',
        justifyContent: 'center',
        gap: isMobile ? '32px' : '80px',
        flexWrap: 'wrap',
      }}>
        {STATS.map((s) => (
          <div key={s.label} style={{ textAlign: 'center', minWidth: '80px', cursor: 'default' }}>
            <div style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '2.2rem',
              fontWeight: 600,
              lineHeight: 1,
              color: s.highlight ? C.purpleLight : C.text,
              letterSpacing: '0.03em',
              textShadow: s.highlight ? '0 0 40px rgba(155, 126, 200, 0.55)' : 'none',
              cursor: 'default',
              userSelect: 'none',
            }}>
              {s.value}
            </div>
            <div style={{
              fontFamily: 'DM Mono, monospace',
              fontSize: '0.7rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: s.highlight ? C.purple : C.textDark,
              marginTop: '5px',
              cursor: 'default',
              userSelect: 'none',
            }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── Trust pillars ────────────────────────────────── */}
      <section style={{
        padding: isMobile ? '48px 16px 40px' : '72px 60px 56px',
        maxWidth: '1420px',
        margin: '0 auto',
        width: '100%',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
          gap: '20px',
        }}>
          {[
            {
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L3 7V12C3 16.55 6.84 20.74 12 22C17.16 20.74 21 16.55 21 12V7L12 2Z"
                    stroke="#9B7EC8" strokeWidth="1.6" strokeLinejoin="round"/>
                  <path d="M9 12l2 2 4-4" stroke="#9B7EC8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ),
              label: 'Built on Arcium',
              tag: 'MPC Encrypted Computation',
              body: 'Multi-party computation ensures your bid is processed by a decentralized network — no single party ever sees the plaintext.',
            },
            {
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"
                    stroke="#9B7EC8" strokeWidth="1.6" strokeLinecap="round"/>
                  <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"
                    stroke="#9B7EC8" strokeWidth="1.6" strokeLinecap="round"/>
                  <line x1="1" y1="1" x2="23" y2="23" stroke="#9B7EC8" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              ),
              label: 'Zero Knowledge',
              tag: 'No Bids Ever Revealed',
              body: 'Bid amounts are sealed for the entire duration of the auction. Even Gavel cannot see your bid until the settlement window opens.',
            },
            {
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"
                    stroke="#9B7EC8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ),
              label: 'Solana Native',
              tag: 'Fast, Cheap, Verifiable',
              body: 'Settlement runs on Solana — sub-second finality, sub-cent fees, and fully on-chain verifiability for every auction outcome.',
            },
          ].map(p => (
            <div key={p.label} style={{
              padding: '28px 26px',
              background: 'rgba(12, 10, 20, 0.6)',
              border: '1px solid rgba(123, 94, 167, 0.12)',
              borderRadius: '14px',
              cursor: 'default',
            }}>
              <div style={{
                width: '44px', height: '44px',
                background: 'rgba(123, 94, 167, 0.1)',
                border: '1px solid rgba(123, 94, 167, 0.2)',
                borderRadius: '10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '18px',
              }}>
                {p.icon}
              </div>
              <div style={{
                fontFamily: 'DM Mono, monospace',
                fontSize: '0.52rem',
                letterSpacing: '0.22em',
                color: C.purple,
                textTransform: 'uppercase',
                marginBottom: '7px',
                cursor: 'default',
                userSelect: 'none',
              }}>
                {p.tag}
              </div>
              <h3 style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: '1.35rem',
                fontWeight: 600,
                color: C.text,
                letterSpacing: '0.02em',
                marginBottom: '10px',
                cursor: 'default',
                userSelect: 'none',
              }}>
                {p.label}
              </h3>
              <p style={{
                fontFamily: 'DM Mono, monospace',
                fontSize: '0.75rem',
                color: C.textDark,
                lineHeight: 1.75,
                letterSpacing: '0.04em',
                cursor: 'default',
                userSelect: 'none',
              }}>
                {p.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Auctions grid ────────────────────────────────── */}
      <section id="auctions" style={{ padding: isMobile ? '60px 16px 80px' : '88px 60px 130px', maxWidth: '1420px', margin: '0 auto', width: '100%' }}>
        <div style={{ marginBottom: '52px' }}>
          <div style={{
            fontFamily: 'DM Mono, monospace',
            fontSize: '0.58rem',
            letterSpacing: '0.28em',
            color: C.purple,
            textTransform: 'uppercase',
            marginBottom: '12px',
            cursor: 'default',
            userSelect: 'none',
          }}>
            Live Auctions
          </div>
          <h2 style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 500,
            color: C.text,
            letterSpacing: '0.04em',
            lineHeight: 1.1,
            marginBottom: '10px',
            cursor: 'default',
            userSelect: 'none',
          }}>
            Current Listings
          </h2>
          <p style={{
            fontFamily: 'DM Mono, monospace',
            fontSize: '0.62rem',
            color: C.textDark,
            letterSpacing: '0.1em',
            cursor: 'default',
            userSelect: 'none',
          }}>
            All bids are sealed by Arcium MPC until the auction closes — zero leakage guaranteed.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '22px',
        }}>
          {AUCTIONS.map((a) => (
            <AuctionCard key={a.id} auction={a} />
          ))}
        </div>
      </section>

    </div>
  );
}
