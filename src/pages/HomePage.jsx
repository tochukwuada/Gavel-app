import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AUCTIONS, getTimeLeft } from '../data/auctions';
import { useIsMobile } from '../hooks/useIsMobile';

const C = {
  bg: '#050507',
  card: '#0c0a14',
  cardHover: '#110e1c',
  border: 'rgba(123, 94, 167, 0.16)',
  borderHover: 'rgba(155, 126, 200, 0.4)',
  purple: '#7B5EA7',
  purpleLight: '#9B7EC8',
  purpleDim: '#4a3970',
  text: '#e8e4f0',
  textMuted: '#9589aa',
  textDark: '#4e4660',
};

function fmt(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}d ${h % 24}h`;
  if (h > 0) return `${h}h ${m % 60}m`;
  if (m > 0) return `${m}m ${s % 60}s`;
  return `${s}s`;
}

function EncryptedAmount({ size = '0.9rem' }) {
  return (
    <span style={{
      fontFamily: 'DM Mono, monospace',
      fontSize: size,
      background: 'linear-gradient(90deg, #2a1f3d, #7B5EA7 30%, #9B7EC8 50%, #7B5EA7 70%, #2a1f3d)',
      backgroundSize: '200% auto',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      animation: 'shimmer 3.5s linear infinite',
      letterSpacing: '3px',
      userSelect: 'none',
    }}>
      ████████████
    </span>
  );
}

function AuctionCard({ auction }) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(auction));

  // Use getTimeLeft (which references APP_START) so all cards stay in sync
  // with each other and with the BiddingPage countdown.
  useEffect(() => {
    const iv = setInterval(() => {
      setTimeLeft(getTimeLeft(auction));
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  const urgent = timeLeft < 60 * 60 * 1000;

  return (
    <div
      style={{
        background: hovered ? C.cardHover : C.card,
        border: `1px solid ${hovered ? C.borderHover : C.border}`,
        borderRadius: '14px',
        padding: '30px',
        cursor: 'pointer',
        transition: 'all 0.32s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
        boxShadow: hovered
          ? '0 28px 64px rgba(123, 94, 167, 0.22), inset 0 1px 0 rgba(155, 126, 200, 0.08)'
          : '0 4px 28px rgba(0,0,0,0.5)',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate(`/auction/${auction.id}`)}
    >
      {/* top gradient bar */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: '2px',
        background: `linear-gradient(90deg, transparent, ${C.purpleLight}, transparent)`,
        opacity: hovered ? 1 : 0.35,
        transition: 'opacity 0.32s',
      }} />

      {/* ambient glow */}
      {hovered && (
        <div style={{
          position: 'absolute',
          top: '-60px', left: '50%',
          transform: 'translateX(-50%)',
          width: '200px', height: '200px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(123, 94, 167, 0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
      )}

      {/* header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
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
        <span style={{
          fontFamily: 'DM Mono, monospace',
          fontSize: '0.6rem',
          color: urgent ? '#e07c7c' : C.textDark,
          letterSpacing: '0.05em',
        }}>
          {timeLeft === 0 ? 'Ended' : `⏱ ${fmt(timeLeft)}`}
        </span>
      </div>

      {/* icon */}
      <div style={{ fontSize: '2.2rem', marginBottom: '16px', lineHeight: 1 }}>
        {auction.icon}
      </div>

      {/* name */}
      <h3 style={{
        fontFamily: 'Cormorant Garamond, serif',
        fontSize: '1.35rem',
        fontWeight: 600,
        color: C.text,
        lineHeight: 1.25,
        marginBottom: '6px',
        letterSpacing: '0.01em',
      }}>
        {auction.name}
      </h3>

      <p style={{
        fontFamily: 'DM Mono, monospace',
        fontSize: '0.6rem',
        color: C.textDark,
        marginBottom: '24px',
        letterSpacing: '0.05em',
      }}>
        Est. {auction.estimate}
      </p>

      {/* sealed bid box */}
      <div style={{
        background: 'rgba(123, 94, 167, 0.05)',
        border: `1px solid rgba(123, 94, 167, 0.1)`,
        borderRadius: '8px',
        padding: '14px 16px',
        marginBottom: '20px',
      }}>
        <div style={{
          fontFamily: 'DM Mono, monospace',
          fontSize: '0.52rem',
          color: C.textDark,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          marginBottom: '8px',
        }}>
          Current Bid
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <EncryptedAmount />
          <span style={{
            fontFamily: 'DM Mono, monospace',
            fontSize: '0.58rem',
            color: C.purple,
            letterSpacing: '0.1em',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
          }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
              <rect x="5" y="11" width="14" height="11" rx="2" stroke="#7B5EA7" strokeWidth="2"/>
              <path d="M8 11V7a4 4 0 018 0v4" stroke="#7B5EA7" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            SEALED
          </span>
        </div>
      </div>

      {/* footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{
          fontFamily: 'DM Mono, monospace',
          fontSize: '0.6rem',
          color: C.textMuted,
        }}>
          {auction.bidCount} sealed bid{auction.bidCount !== 1 ? 's' : ''}
        </span>
        <span style={{
          fontFamily: 'DM Mono, monospace',
          fontSize: '0.62rem',
          color: hovered ? C.purpleLight : C.purple,
          letterSpacing: '0.08em',
          transition: 'color 0.3s',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}>
          Place Bid
          <span style={{ transition: 'transform 0.3s', transform: hovered ? 'translateX(3px)' : 'none' }}>→</span>
        </span>
      </div>
    </div>
  );
}

const STATS = [
  { label: 'Active Auctions', value: '6' },
  { label: 'Total Volume',    value: '$4.2M' },
  { label: 'Participants',    value: '847' },
  { label: 'Bids Leaked',     value: '0', highlight: true },
];

export default function HomePage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [btnHover, setBtnHover] = useState(null);

  return (
    <div style={{ background: C.bg, minHeight: '100vh' }}>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        position: 'relative',
        padding: '120px 40px 100px',
        overflow: 'hidden',
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
          fontSize: '0.6rem',
          letterSpacing: '0.26em',
          color: C.purple,
          textTransform: 'uppercase',
          marginBottom: '36px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          animation: 'fadeInUp 0.9s ease both',
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
        }}>
          <span style={{
            fontFamily: 'DM Mono, monospace',
            fontSize: '0.52rem',
            color: C.textDark,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
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
          <div key={s.label} style={{ textAlign: 'center', minWidth: '80px' }}>
            <div style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '2.2rem',
              fontWeight: 600,
              lineHeight: 1,
              color: s.highlight ? C.purpleLight : C.text,
              letterSpacing: '0.03em',
              textShadow: s.highlight ? '0 0 40px rgba(155, 126, 200, 0.55)' : 'none',
            }}>
              {s.value}
            </div>
            <div style={{
              fontFamily: 'DM Mono, monospace',
              fontSize: '0.55rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: s.highlight ? C.purple : C.textDark,
              marginTop: '5px',
            }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

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
          }}>
            Current Listings
          </h2>
          <p style={{
            fontFamily: 'DM Mono, monospace',
            fontSize: '0.62rem',
            color: C.textDark,
            letterSpacing: '0.1em',
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

      {/* ── Footer ───────────────────────────────────────── */}
      <footer style={{
        borderTop: `1px solid rgba(123, 94, 167, 0.1)`,
        padding: isMobile ? '28px 16px' : '40px 60px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <span style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: '1.2rem',
          fontWeight: 600,
          color: C.textDark,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
        }}>
          Gavel
        </span>
        <span style={{
          fontFamily: 'DM Mono, monospace',
          fontSize: '0.58rem',
          color: C.textDark,
          letterSpacing: '0.1em',
        }}>
          Encrypted computation by Arcium MPC · All bids sealed · Zero knowledge
        </span>
      </footer>
    </div>
  );
}
