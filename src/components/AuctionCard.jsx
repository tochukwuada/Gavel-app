import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { getTimeLeft } from '../data/auctions';
import { useWatchlist } from '../hooks/useWatchlist';
import { showToast } from './Toast';
import NotifPrefsModal from './NotifPrefsModal';

const C = {
  card: '#0c0a14',
  cardHover: '#110e1c',
  border: 'rgba(123, 94, 167, 0.16)',
  borderHover: 'rgba(155, 126, 200, 0.4)',
  purple: '#7B5EA7',
  purpleLight: '#9B7EC8',
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

function BookmarkIcon({ filled }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? C.purpleLight : 'none'}>
      <path d="M5 3h14a1 1 0 011 1v17l-8-4-8 4V4a1 1 0 011-1z"
        stroke={filled ? C.purpleLight : C.textDark}
        strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  );
}

const VISUALS = {
  gold:    { a: '#3d2a00', b: '#7a5500', c: '#c4830a', accent: 'rgba(196,131,10,0.3)' },
  crimson: { a: '#2a0010', b: '#6b0020', c: '#c02040', accent: 'rgba(192,32,64,0.3)' },
  cobalt:  { a: '#00103d', b: '#00318c', c: '#1a60d4', accent: 'rgba(26,96,212,0.3)' },
  burgundy:{ a: '#1f0015', b: '#4a0030', c: '#8c1060', accent: 'rgba(140,16,96,0.3)' },
  amber:   { a: '#2a1200', b: '#7a3800', c: '#d46b00', accent: 'rgba(212,107,0,0.3)' },
  ice:     { a: '#001a2a', b: '#004466', c: '#00aadd', accent: 'rgba(0,170,221,0.3)' },
  purple:  { a: '#0c0a14', b: '#2a1f40', c: '#7B5EA7', accent: 'rgba(123,94,167,0.3)' },
};

// Unique geometric SVG pattern per visual theme
function GeometricPattern({ visual, v }) {
  const id = `rg-${visual}`;
  switch (visual) {
    case 'gold': return (
      // Hexagonal grid — Patek Philippe
      <g>
        <defs><radialGradient id={id} cx="75%" cy="25%" r="55%">
          <stop offset="0%" stopColor={v.c} stopOpacity="0.4"/>
          <stop offset="100%" stopColor={v.a} stopOpacity="0"/>
        </radialGradient></defs>
        <rect width="240" height="120" fill={`url(#${id})`}/>
        {[0,1,2,3,4].map(row => [0,1,2,3,4].map(col => {
          const ox = col * 44 + (row % 2) * 22 - 10;
          const oy = row * 26 - 6;
          const r = 14;
          const pts = [0,1,2,3,4,5].map(i => {
            const a = Math.PI / 180 * (60 * i - 30);
            return `${ox + r * Math.cos(a)},${oy + r * Math.sin(a)}`;
          }).join(' ');
          return <polygon key={`${row}-${col}`} points={pts} fill="none"
            stroke={v.c} strokeWidth="0.5" strokeOpacity="0.22"/>;
        }))}
        <circle cx="190" cy="18" r="38" fill={v.accent} style={{ mixBlendMode: 'screen' }}/>
      </g>
    );
    case 'crimson': return (
      // Diagonal crosshatch — Banksy
      <g>
        <defs><radialGradient id={id} cx="30%" cy="70%" r="60%">
          <stop offset="0%" stopColor={v.c} stopOpacity="0.35"/>
          <stop offset="100%" stopColor={v.a} stopOpacity="0"/>
        </radialGradient></defs>
        <rect width="240" height="120" fill={`url(#${id})`}/>
        {[...Array(10)].map((_, i) => (
          <line key={`d${i}`} x1={i * 28 - 40} y1="0" x2={i * 28 + 80} y2="120"
            stroke={v.c} strokeWidth="0.6" strokeOpacity="0.18"/>
        ))}
        {[...Array(8)].map((_, i) => (
          <line key={`u${i}`} x1={i * 32} y1="120" x2={i * 32 + 120} y2="0"
            stroke={v.c} strokeWidth="0.6" strokeOpacity="0.12"/>
        ))}
        <circle cx="40" cy="30" r="36" fill={v.accent} style={{ mixBlendMode: 'screen' }}/>
      </g>
    );
    case 'cobalt': return (
      // Concentric arcs — Mickey Mantle / baseball
      <g>
        <defs><radialGradient id={id} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={v.c} stopOpacity="0.3"/>
          <stop offset="100%" stopColor={v.a} stopOpacity="0"/>
        </radialGradient></defs>
        <rect width="240" height="120" fill={`url(#${id})`}/>
        {[20,40,60,80,100,120].map(r => (
          <circle key={r} cx="200" cy="10" r={r} fill="none"
            stroke={v.c} strokeWidth="0.5" strokeOpacity="0.2"/>
        ))}
        {[20,40,60,80].map(r => (
          <circle key={`l${r}`} cx="30" cy="110" r={r} fill="none"
            stroke={v.c} strokeWidth="0.5" strokeOpacity="0.14"/>
        ))}
        <circle cx="170" cy="35" r="30" fill={v.accent} style={{ mixBlendMode: 'screen' }}/>
      </g>
    );
    case 'burgundy': return (
      // Diamond tessellation — Isfahan Rug
      <g>
        <defs><radialGradient id={id} cx="60%" cy="40%" r="55%">
          <stop offset="0%" stopColor={v.c} stopOpacity="0.38"/>
          <stop offset="100%" stopColor={v.a} stopOpacity="0"/>
        </radialGradient></defs>
        <rect width="240" height="120" fill={`url(#${id})`}/>
        {[0,1,2,3,4,5].map(row => [0,1,2,3,4,5,6].map(col => {
          const cx2 = col * 36 + (row % 2) * 18 - 8;
          const cy2 = row * 22 - 4;
          return <polygon key={`${row}-${col}`}
            points={`${cx2},${cy2 - 11} ${cx2 + 18},${cy2} ${cx2},${cy2 + 11} ${cx2 - 18},${cy2}`}
            fill="none" stroke={v.c} strokeWidth="0.5" strokeOpacity="0.22"/>;
        }))}
        <circle cx="60" cy="25" r="32" fill={v.accent} style={{ mixBlendMode: 'screen' }}/>
      </g>
    );
    case 'amber': return (
      // Wave / ripple curves — Macallan whisky
      <g>
        <defs><radialGradient id={id} cx="50%" cy="60%" r="60%">
          <stop offset="0%" stopColor={v.c} stopOpacity="0.35"/>
          <stop offset="100%" stopColor={v.a} stopOpacity="0"/>
        </radialGradient></defs>
        <rect width="240" height="120" fill={`url(#${id})`}/>
        {[0,1,2,3,4,5,6].map(i => (
          <path key={i}
            d={`M -20 ${i * 20} Q 60 ${i * 20 - 14} 120 ${i * 20} Q 180 ${i * 20 + 14} 260 ${i * 20}`}
            fill="none" stroke={v.c} strokeWidth="0.6" strokeOpacity="0.2"/>
        ))}
        <circle cx="185" cy="25" r="42" fill={v.accent} style={{ mixBlendMode: 'screen' }}/>
        <circle cx="30" cy="95" r="28" fill={v.accent} style={{ mixBlendMode: 'screen' }}/>
      </g>
    );
    case 'ice': return (
      // Crystal facets — De Beers diamond
      <g>
        <defs><radialGradient id={id} cx="50%" cy="35%" r="50%">
          <stop offset="0%" stopColor={v.c} stopOpacity="0.45"/>
          <stop offset="100%" stopColor={v.a} stopOpacity="0"/>
        </radialGradient></defs>
        <rect width="240" height="120" fill={`url(#${id})`}/>
        {/* gem facets radiating from center */}
        {[0,30,60,90,120,150,180,210,240,270,300,330].map(deg => {
          const rad = deg * Math.PI / 180;
          return <line key={deg} x1="120" y1="60"
            x2={120 + 100 * Math.cos(rad)} y2={60 + 70 * Math.sin(rad)}
            stroke={v.c} strokeWidth="0.5" strokeOpacity="0.22"/>;
        })}
        {[25,50,75].map(r => (
          <ellipse key={r} cx="120" cy="60" rx={r * 2} ry={r}
            fill="none" stroke={v.c} strokeWidth="0.45" strokeOpacity="0.18"/>
        ))}
        <circle cx="120" cy="60" r="22" fill={v.accent} style={{ mixBlendMode: 'screen' }}/>
      </g>
    );
    default: return (
      <g>
        <defs><radialGradient id={id} cx="70%" cy="30%" r="60%">
          <stop offset="0%" stopColor={v.c} stopOpacity="0.35"/>
          <stop offset="100%" stopColor={v.a} stopOpacity="0"/>
        </radialGradient></defs>
        <rect width="240" height="120" fill={`url(#${id})`}/>
        <circle cx="180" cy="20" r="50" fill={v.accent} style={{ mixBlendMode: 'screen' }}/>
        <circle cx="20" cy="100" r="40" fill={v.accent} style={{ mixBlendMode: 'screen' }}/>
      </g>
    );
  }
}

function AuctionVisual({ visual = 'purple', icon }) {
  const v = VISUALS[visual] || VISUALS.purple;
  return (
    <div style={{
      width: '100%', height: '120px', borderRadius: '9px', marginBottom: '18px',
      background: `linear-gradient(135deg, ${v.a} 0%, ${v.b} 50%, ${v.c} 100%)`,
      position: 'relative', overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <svg width="100%" height="100%" viewBox="0 0 240 120" preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', inset: 0 }}>
        <GeometricPattern visual={visual} v={v} />
      </svg>
      <span style={{ fontSize: '2.6rem', position: 'relative', zIndex: 1, filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.5))' }}>
        {icon}
      </span>
    </div>
  );
}

function ShieldVerifiedIcon({ size = 11, color }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 2L3 7V12C3 16.55 6.84 20.74 12 22C17.16 20.74 21 16.55 21 12V7L12 2Z"
        stroke={color} strokeWidth="1.8" strokeLinejoin="round"/>
      <path d="M8.5 12L11 14.5L15.5 10" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function VerifyModal({ auction, onClose }) {
  const auth = auction.authenticity;
  const verified = auth?.verified;

  return createPortal(
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 900,
        background: 'rgba(5, 5, 7, 0.82)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.18s ease both',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: '#0c0a14',
        border: `1px solid ${verified ? 'rgba(126, 200, 156, 0.3)' : 'rgba(123, 94, 167, 0.22)'}`,
        borderRadius: '16px',
        padding: '32px',
        width: '100%',
        maxWidth: '440px',
        position: 'relative',
        animation: 'fadeInUp 0.22s ease both',
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '16px', right: '16px',
            background: 'none', border: 'none', cursor: 'pointer',
            color: C.textDark, fontSize: '1.1rem', lineHeight: 1, padding: '4px',
          }}
        >
          ×
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '22px' }}>
          <span style={{ fontSize: '1.6rem' }}>{auction.icon}</span>
          <div>
            <div style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '1.15rem', fontWeight: 600,
              color: C.text, letterSpacing: '0.02em',
            }}>
              {auction.name}
            </div>
            <div style={{
              fontFamily: 'DM Mono, monospace', fontSize: '0.7rem',
              color: C.textDark, letterSpacing: '0.12em', textTransform: 'uppercase',
            }}>
              Auction #{auction.id}
            </div>
          </div>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '12px 14px',
          background: verified ? 'rgba(126, 200, 156, 0.06)' : 'rgba(78, 70, 96, 0.1)',
          border: `1px solid ${verified ? 'rgba(126, 200, 156, 0.22)' : 'rgba(78, 70, 96, 0.2)'}`,
          borderRadius: '8px',
          marginBottom: verified ? '20px' : '0',
        }}>
          <ShieldVerifiedIcon size={16} color={verified ? '#7ec89c' : C.textDark} />
          <div>
            <div style={{
              fontFamily: 'DM Mono, monospace', fontSize: '0.62rem',
              color: verified ? '#7ec89c' : C.textDark,
              letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500,
            }}>
              {verified ? 'Authenticity Verified' : 'Not Verified'}
            </div>
            {!verified && (
              <div style={{
                fontFamily: 'DM Mono, monospace', fontSize: '0.57rem',
                color: C.textDark, letterSpacing: '0.04em', marginTop: '3px', lineHeight: 1.5,
              }}>
                No proof documents have been submitted for this item.
              </div>
            )}
          </div>
        </div>

        {verified && (
          <div style={{
            background: 'rgba(5, 5, 7, 0.5)',
            border: '1px solid rgba(123, 94, 167, 0.12)',
            borderRadius: '8px', overflow: 'hidden',
          }}>
            {[
              { label: 'Verification ID', value: auth.id },
              { label: 'Type',            value: auth.type },
              { label: 'Issuing Authority', value: auth.authority },
              { label: 'Document Ref',    value: auth.docRef },
              auth.docName && { label: 'Document', value: auth.docName },
              auth.smartContract && { label: 'Smart Contract', value: auth.smartContract },
              { label: 'Verified',        value: auth.verifiedAt },
            ].filter(Boolean).map((row, i, arr) => (
              <div key={row.label} style={{
                display: 'grid', gridTemplateColumns: '130px 1fr', gap: '8px',
                padding: '10px 14px',
                borderBottom: i < arr.length - 1 ? '1px solid rgba(123, 94, 167, 0.08)' : 'none',
              }}>
                <span style={{
                  fontFamily: 'DM Mono, monospace', fontSize: '0.53rem',
                  color: C.textDark, letterSpacing: '0.12em', textTransform: 'uppercase', paddingTop: '1px',
                }}>
                  {row.label}
                </span>
                <span style={{
                  fontFamily: 'DM Mono, monospace', fontSize: '0.58rem',
                  color: C.textMuted, letterSpacing: '0.03em', wordBreak: 'break-all', lineHeight: 1.5,
                }}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        )}

        {verified && (
          <div style={{
            marginTop: '14px', padding: '10px 14px',
            background: 'rgba(126, 200, 156, 0.04)',
            border: '1px solid rgba(126, 200, 156, 0.14)',
            borderRadius: '7px', display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
              <path d="M12 2L3 7V12C3 16.55 6.84 20.74 12 22C17.16 20.74 21 16.55 21 12V7L12 2Z"
                stroke="#7ec89c" strokeWidth="1.8" strokeLinejoin="round"/>
              <path d="M8.5 12L11 14.5L15.5 10" stroke="#7ec89c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span style={{
              fontFamily: 'DM Mono, monospace', fontSize: '0.57rem',
              color: '#7ec89c', letterSpacing: '0.06em',
            }}>
              Authenticity guaranteed by Gavel
            </span>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

export default function AuctionCard({ auction }) {
  const navigate = useNavigate();
  const { toggle, isWatched } = useWatchlist();
  const watched = isWatched(auction.id);

  const [hovered, setHovered] = useState(false);
  const [bookmarkHover, setBookmarkHover] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(auction));

  useEffect(() => {
    const iv = setInterval(() => setTimeLeft(getTimeLeft(auction)), 1000);
    return () => clearInterval(iv);
  }, [auction]);

  const urgent  = timeLeft < 60 * 60 * 1000;
  const warning = !urgent && timeLeft < 6 * 60 * 60 * 1000;
  const timerColor = urgent ? '#e07c7c' : warning ? '#d4a844' : C.textDark;
  const ended = timeLeft === 0;

  const isVerified = auction.authenticity?.verified === true;

  const handleBookmark = (e) => {
    e.stopPropagation();
    const adding = !watched;
    toggle(auction.id);
    if (adding) {
      showToast('Added to Watchlist', 'success');
      setShowNotifModal(true);
    } else {
      showToast('Removed from Watchlist', 'info');
    }
  };

  return (
    <>
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
          position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
          background: `linear-gradient(90deg, transparent, ${C.purpleLight}, transparent)`,
          opacity: hovered ? 1 : 0.35,
          transition: 'opacity 0.32s',
        }} />

        {/* ambient glow */}
        {hovered && (
          <div style={{
            position: 'absolute', top: '-60px', left: '50%',
            transform: 'translateX(-50%)',
            width: '200px', height: '200px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(123,94,167,0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
        )}

        {/* header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
          {/* left: category + verify badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', flexWrap: 'wrap' }}>
            <span style={{
              fontFamily: 'DM Mono, monospace', fontSize: '0.58rem',
              letterSpacing: '0.15em', textTransform: 'uppercase',
              color: C.purple,
              background: 'rgba(123, 94, 167, 0.1)',
              border: '1px solid rgba(123, 94, 167, 0.22)',
              padding: '4px 10px', borderRadius: '20px',
            }}>
              {auction.category}
            </span>

            <button
              onClick={e => { e.stopPropagation(); setShowVerifyModal(true); }}
              style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                padding: '4px 8px', borderRadius: '20px',
                background: isVerified ? 'rgba(126, 200, 156, 0.08)' : 'rgba(78, 70, 96, 0.1)',
                border: `1px solid ${isVerified ? 'rgba(126, 200, 156, 0.25)' : 'rgba(78, 70, 96, 0.2)'}`,
                cursor: 'pointer',
                fontFamily: 'DM Mono, monospace', fontSize: '0.52rem',
                letterSpacing: '0.1em',
                color: isVerified ? '#7ec89c' : C.textDark,
                transition: 'all 0.18s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = isVerified ? 'rgba(126, 200, 156, 0.14)' : 'rgba(78, 70, 96, 0.18)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = isVerified ? 'rgba(126, 200, 156, 0.08)' : 'rgba(78, 70, 96, 0.1)';
              }}
              title="View verification details"
            >
              <ShieldVerifiedIcon size={10} color={isVerified ? '#7ec89c' : C.textDark} />
              {isVerified ? 'Verified ✓' : 'Unverified'}
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              fontFamily: 'DM Mono, monospace', fontSize: '0.75rem',
              color: timerColor, letterSpacing: '0.05em',
              fontWeight: urgent || warning ? 500 : 400,
            }}>
              {ended ? 'Ended' : `⏱ ${fmt(timeLeft)}`}
            </span>

            {/* bookmark */}
            <button
              onClick={handleBookmark}
              onMouseEnter={() => setBookmarkHover(true)}
              onMouseLeave={() => setBookmarkHover(false)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: '2px',
                opacity: watched || bookmarkHover ? 1 : 0.45,
                transition: 'opacity 0.2s, transform 0.15s',
                transform: bookmarkHover ? 'scale(1.18)' : 'scale(1)',
                lineHeight: 0,
              }}
              title={watched ? 'Remove from watchlist' : 'Add to watchlist'}
            >
              <BookmarkIcon filled={watched} />
            </button>
          </div>
        </div>

        {/* visual */}
        <AuctionVisual visual={auction.visual} icon={auction.icon} />

        {/* name */}
        <h3 style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: '1.35rem', fontWeight: 600,
          color: C.text, lineHeight: 1.25, marginBottom: '8px', letterSpacing: '0.01em',
        }}>
          {auction.name}
        </h3>

        {/* condition badge */}
        {auction.condition && (
          <span style={{
            display: 'inline-block',
            fontFamily: 'DM Mono, monospace', fontSize: '0.5rem',
            letterSpacing: '0.15em', textTransform: 'uppercase',
            color: C.textDark,
            background: 'rgba(78, 70, 96, 0.18)',
            border: '1px solid rgba(78, 70, 96, 0.28)',
            padding: '3px 9px', borderRadius: '12px',
            marginBottom: '8px',
          }}>
            {auction.condition}
          </span>
        )}

        <p style={{
          fontFamily: 'DM Mono, monospace', fontSize: '0.75rem',
          color: C.textDark, marginBottom: '24px', letterSpacing: '0.05em',
        }}>
          Est. {auction.estimate}
        </p>

        {/* sealed bid box */}
        <div style={{
          background: 'rgba(123, 94, 167, 0.05)',
          border: '1px solid rgba(123, 94, 167, 0.1)',
          borderRadius: '8px', padding: '14px 16px', marginBottom: '12px',
        }}>
          <div style={{
            fontFamily: 'DM Mono, monospace', fontSize: '0.52rem',
            color: C.textDark, letterSpacing: '0.18em',
            textTransform: 'uppercase', marginBottom: '8px',
          }}>
            Current Bid
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <EncryptedAmount />
            <span style={{
              fontFamily: 'DM Mono, monospace', fontSize: '0.58rem',
              color: C.purple, letterSpacing: '0.1em',
              display: 'flex', alignItems: 'center', gap: '5px',
            }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                <rect x="5" y="11" width="14" height="11" rx="2" stroke="#7B5EA7" strokeWidth="2"/>
                <path d="M8 11V7a4 4 0 018 0v4" stroke="#7B5EA7" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              SEALED
            </span>
          </div>
        </div>

        {/* reserve badge */}
        {auction.reservePrice && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            marginBottom: '16px',
            fontFamily: 'DM Mono, monospace', fontSize: '0.54rem',
            letterSpacing: '0.1em',
            color: auction.reserveMet ? '#7ec89c' : '#d4a844',
          }}>
            <span style={{
              width: '5px', height: '5px', borderRadius: '50%', flexShrink: 0,
              background: auction.reserveMet ? '#7ec89c' : '#d4a844',
            }} />
            {auction.reserveMet ? 'Reserve Met' : 'Reserve Not Met'}
            <span style={{ color: C.textDark, marginLeft: '2px' }}>
              · ◎{auction.reservePrice.toLocaleString()}
            </span>
          </div>
        )}

        {/* footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.75rem', color: C.textMuted }}>
            {auction.bidCount} sealed bid{auction.bidCount !== 1 ? 's' : ''}
          </span>
          <span style={{
            fontFamily: 'DM Mono, monospace', fontSize: '0.62rem',
            color: hovered ? C.purpleLight : C.purple,
            letterSpacing: '0.08em', transition: 'color 0.3s',
            display: 'flex', alignItems: 'center', gap: '4px',
          }}>
            Place Bid
            <span style={{ transition: 'transform 0.3s', transform: hovered ? 'translateX(3px)' : 'none' }}>→</span>
          </span>
        </div>
      </div>

      {showVerifyModal && (
        <VerifyModal auction={auction} onClose={() => setShowVerifyModal(false)} />
      )}
      {showNotifModal && (
        <NotifPrefsModal auction={auction} onClose={() => setShowNotifModal(false)} />
      )}
    </>
  );
}
