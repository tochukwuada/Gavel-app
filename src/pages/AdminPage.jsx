import { AUCTIONS, getTimeLeft } from '../data/auctions';
import { useNavigate } from 'react-router-dom';

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

function fmt(ms) {
  if (ms <= 0) return '—';
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}d ${h % 24}h`;
  if (h > 0) return `${h}h ${m % 60}m`;
  return `${m}m ${s % 60}s`;
}

export default function AdminPage() {
  const navigate = useNavigate();
  const now = Date.now();

  const active = AUCTIONS.filter(a => getTimeLeft(a) > 0);
  const totalBids = AUCTIONS.reduce((sum, a) => sum + a.bidCount, 0);
  const volume = Math.round(totalBids * 47.2);
  const participants = totalBids + Math.floor(totalBids * 0.4);

  const STATS = [
    { label: 'Active Auctions', value: String(active.length), sub: `${AUCTIONS.length} total` },
    { label: 'Total Bids',      value: String(totalBids),      sub: 'sealed & encrypted' },
    { label: 'Volume',          value: `◎${volume.toLocaleString()}`, sub: 'estimated' },
    { label: 'Participants',    value: String(participants),   sub: 'unique wallets' },
  ];

  return (
    <div style={{ background: C.bg, minHeight: '100vh', paddingTop: '64px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 48px 100px' }}>

        {/* header */}
        <div style={{ marginBottom: '48px' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              fontFamily: 'DM Mono, monospace', fontSize: '0.6rem',
              letterSpacing: '0.14em', color: C.textDark, background: 'none',
              border: 'none', cursor: 'pointer', padding: 0, marginBottom: '28px',
              display: 'flex', alignItems: 'center', gap: '6px', transition: 'color 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = C.textMuted}
            onMouseLeave={e => e.currentTarget.style.color = C.textDark}
          >
            ← Back
          </button>

          <div style={{
            display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '8px',
          }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '9px',
              background: 'rgba(123, 94, 167, 0.12)',
              border: '1px solid rgba(123, 94, 167, 0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L3 7V12C3 16.55 6.84 20.74 12 22C17.16 20.74 21 16.55 21 12V7L12 2Z"
                  stroke="#9B7EC8" strokeWidth="1.8" strokeLinejoin="round"/>
                <path d="M9 12L11 14L15 10" stroke="#9B7EC8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <div style={{
                fontFamily: 'DM Mono, monospace', fontSize: '0.55rem',
                letterSpacing: '0.24em', textTransform: 'uppercase', color: C.purple,
                marginBottom: '4px',
              }}>
                Internal
              </div>
              <h1 style={{
                fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem',
                fontWeight: 600, color: C.text, letterSpacing: '0.04em', lineHeight: 1,
              }}>
                Admin Dashboard
              </h1>
            </div>
          </div>
        </div>

        {/* stats grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '16px', marginBottom: '48px',
        }}>
          {STATS.map((s) => (
            <div key={s.label} style={{
              background: C.card, border: `1px solid ${C.border}`,
              borderRadius: '12px', padding: '22px 24px',
            }}>
              <div style={{
                fontFamily: 'DM Mono, monospace', fontSize: '0.52rem',
                letterSpacing: '0.2em', textTransform: 'uppercase',
                color: C.textDark, marginBottom: '10px',
              }}>
                {s.label}
              </div>
              <div style={{
                fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem',
                fontWeight: 600, color: C.purpleLight,
                letterSpacing: '0.02em', lineHeight: 1, marginBottom: '4px',
              }}>
                {s.value}
              </div>
              <div style={{
                fontFamily: 'DM Mono, monospace', fontSize: '0.54rem',
                color: C.textDark, letterSpacing: '0.08em',
              }}>
                {s.sub}
              </div>
            </div>
          ))}
        </div>

        {/* auctions table */}
        <div>
          <div style={{
            fontFamily: 'DM Mono, monospace', fontSize: '0.55rem',
            letterSpacing: '0.24em', textTransform: 'uppercase',
            color: C.textDark, marginBottom: '16px', paddingBottom: '14px',
            borderBottom: `1px solid ${C.border}`,
          }}>
            All Auctions
          </div>

          <div style={{
            background: C.card, border: `1px solid ${C.border}`,
            borderRadius: '12px', overflow: 'hidden',
          }}>
            {/* table header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '2.5fr 1fr 80px 120px 80px 100px',
              padding: '12px 20px',
              borderBottom: `1px solid ${C.border}`,
              background: 'rgba(123, 94, 167, 0.04)',
            }}>
              {['Item', 'Category', 'Bids', 'Closes In', 'Reserve', 'Status'].map(h => (
                <span key={h} style={{
                  fontFamily: 'DM Mono, monospace', fontSize: '0.5rem',
                  letterSpacing: '0.18em', textTransform: 'uppercase', color: C.textDark,
                }}>
                  {h}
                </span>
              ))}
            </div>

            {/* rows */}
            {AUCTIONS.map((a, i) => {
              const tl = getTimeLeft(a);
              const isActive = tl > 0;
              const urgent = tl < 60 * 60 * 1000 && isActive;
              const warning = !urgent && tl < 6 * 60 * 60 * 1000 && isActive;

              return (
                <div
                  key={a.id}
                  onClick={() => navigate(`/auction/${a.id}`)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2.5fr 1fr 80px 120px 80px 100px',
                    padding: '16px 20px',
                    borderBottom: i < AUCTIONS.length - 1 ? `1px solid rgba(123,94,167,0.07)` : 'none',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    alignItems: 'center',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(123,94,167,0.04)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {/* name */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '1.1rem' }}>{a.icon}</span>
                      <span style={{
                        fontFamily: 'DM Mono, monospace', fontSize: '0.62rem',
                        color: C.textMuted, letterSpacing: '0.04em',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {a.name}
                      </span>
                    </div>
                    <div style={{
                      fontFamily: 'DM Mono, monospace', fontSize: '0.52rem',
                      color: C.textDark, letterSpacing: '0.08em', marginTop: '3px', paddingLeft: '30px',
                    }}>
                      {a.estimate}
                    </div>
                  </div>

                  {/* category */}
                  <span style={{
                    fontFamily: 'DM Mono, monospace', fontSize: '0.55rem',
                    color: C.textDark, letterSpacing: '0.08em',
                  }}>
                    {a.category}
                  </span>

                  {/* bids */}
                  <span style={{
                    fontFamily: 'DM Mono, monospace', fontSize: '0.62rem',
                    color: C.purpleLight, letterSpacing: '0.06em',
                  }}>
                    {a.bidCount}
                  </span>

                  {/* time */}
                  <span style={{
                    fontFamily: 'DM Mono, monospace', fontSize: '0.6rem',
                    color: urgent ? '#e07c7c' : warning ? '#d4a844' : C.textDark,
                    letterSpacing: '0.05em',
                  }}>
                    {fmt(tl)}
                  </span>

                  {/* reserve */}
                  <span style={{
                    fontFamily: 'DM Mono, monospace', fontSize: '0.58rem',
                    color: !a.reservePrice
                      ? C.textDark
                      : a.reserveMet ? '#7ec89c' : '#d4a844',
                    letterSpacing: '0.04em',
                  }}>
                    {!a.reservePrice ? '—' : a.reserveMet ? '✓ Met' : '✗ Not met'}
                  </span>

                  {/* status */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{
                      width: '5px', height: '5px', borderRadius: '50%', flexShrink: 0,
                      background: isActive ? (urgent ? '#e07c7c' : '#7ec89c') : C.textDark,
                      animation: isActive && !urgent ? 'pulse 2s infinite' : 'none',
                    }} />
                    <span style={{
                      fontFamily: 'DM Mono, monospace', fontSize: '0.55rem',
                      color: isActive ? (urgent ? '#e07c7c' : '#7ec89c') : C.textDark,
                      letterSpacing: '0.1em', textTransform: 'uppercase',
                    }}>
                      {isActive ? (urgent ? 'Urgent' : 'Active') : 'Ended'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
