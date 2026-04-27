import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getAuction } from '../data/auctions';
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

function ShieldIcon({ verified, size = 36 }) {
  const color = verified ? '#7ec89c' : C.textDark;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 2L3 7V12C3 16.55 6.84 20.74 12 22C17.16 20.74 21 16.55 21 12V7L12 2Z"
        stroke={color} strokeWidth="1.6" strokeLinejoin="round"
        fill={verified ? 'rgba(126, 200, 156, 0.08)' : 'rgba(78, 70, 96, 0.08)'}/>
      {verified && (
        <path d="M8.5 12L11 14.5L15.5 10" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      )}
      {!verified && (
        <>
          <line x1="12" y1="9" x2="12" y2="13" stroke={color} strokeWidth="1.6" strokeLinecap="round"/>
          <line x1="12" y1="16" x2="12.01" y2="16" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        </>
      )}
    </svg>
  );
}

function RecordRow({ label, value, accent }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '160px 1fr',
      gap: '12px',
      padding: '12px 20px',
      borderBottom: '1px solid rgba(123, 94, 167, 0.07)',
    }}>
      <span style={{
        fontFamily: 'DM Mono, monospace', fontSize: '0.54rem',
        color: C.textDark, letterSpacing: '0.14em',
        textTransform: 'uppercase', paddingTop: '1px',
      }}>
        {label}
      </span>
      <span style={{
        fontFamily: 'DM Mono, monospace', fontSize: '0.62rem',
        color: accent || C.textMuted,
        letterSpacing: '0.04em', wordBreak: 'break-all', lineHeight: 1.55,
      }}>
        {value}
      </span>
    </div>
  );
}

export default function VerifyPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchParams] = useSearchParams();

  const [query, setQuery] = useState(searchParams.get('id') || '');
  const [focused, setFocused] = useState(false);
  const [searched, setSearched] = useState(!!searchParams.get('id'));
  const [result, setResult] = useState(
    searchParams.get('id') ? (getAuction(searchParams.get('id')) || false) : null
  );

  const handleLookup = () => {
    if (!query.trim()) return;
    const auction = getAuction(query.trim());
    setResult(auction || false);
    setSearched(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleLookup();
  };

  const auth = result ? result.authenticity : null;
  const verified = auth?.verified === true;

  return (
    <div style={{ background: C.bg, minHeight: '100vh', paddingTop: '64px' }}>
      <div style={{
        maxWidth: '680px',
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
        <div style={{ marginBottom: '48px' }}>
          <div style={{
            fontFamily: 'DM Mono, monospace', fontSize: '0.55rem',
            letterSpacing: '0.3em', color: C.purple,
            textTransform: 'uppercase', marginBottom: '14px',
          }}>
            Public Registry
          </div>
          <h1 style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 'clamp(2.2rem, 5vw, 3.4rem)',
            fontWeight: 600, color: C.text,
            letterSpacing: '0.04em', lineHeight: 1.05, marginBottom: '14px',
          }}>
            Authenticity Lookup
          </h1>
          <p style={{
            fontFamily: 'DM Mono, monospace', fontSize: '0.62rem',
            color: C.textDark, letterSpacing: '0.08em', lineHeight: 1.65,
          }}>
            Enter an auction ID to retrieve the full verification record for any item on Gavel.
            This registry is publicly accessible — no wallet required.
          </p>
        </div>

        {/* Search */}
        <div style={{
          display: 'flex', gap: '10px', marginBottom: '40px',
          flexWrap: isMobile ? 'wrap' : 'nowrap',
        }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              placeholder="Enter Auction ID (e.g. 1, 2, 3...)"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              style={{
                width: '100%',
                background: 'rgba(12, 10, 20, 0.8)',
                border: `1px solid ${focused ? C.purple : 'rgba(123, 94, 167, 0.22)'}`,
                borderRadius: '9px', outline: 'none',
                fontFamily: 'DM Mono, monospace', fontSize: '0.85rem',
                color: C.text, padding: '14px 18px',
                letterSpacing: '0.06em', transition: 'border-color 0.2s',
                boxSizing: 'border-box',
                boxShadow: focused ? '0 0 0 3px rgba(123, 94, 167, 0.1)' : 'none',
              }}
            />
          </div>
          <button
            onClick={handleLookup}
            disabled={!query.trim()}
            style={{
              padding: '14px 28px',
              background: query.trim()
                ? 'linear-gradient(135deg, #7B5EA7, #5a3f8a)'
                : 'rgba(123, 94, 167, 0.12)',
              color: query.trim() ? '#fff' : C.textDark,
              border: 'none', borderRadius: '9px',
              fontFamily: 'DM Mono, monospace', fontSize: '0.65rem',
              letterSpacing: '0.14em', textTransform: 'uppercase',
              cursor: query.trim() ? 'pointer' : 'not-allowed',
              transition: 'all 0.25s',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              boxShadow: query.trim() ? '0 6px 24px rgba(123, 94, 167, 0.3)' : 'none',
            }}
          >
            Lookup →
          </button>
        </div>

        {/* Results */}
        {searched && result === false && (
          <div style={{
            padding: '40px 32px', textAlign: 'center',
            background: C.card, border: `1px solid ${C.border}`,
            borderRadius: '14px',
          }}>
            <div style={{ fontSize: '2.2rem', marginBottom: '16px', opacity: 0.3 }}>🔍</div>
            <div style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '1.3rem', fontWeight: 500,
              color: C.textMuted, marginBottom: '8px',
              fontStyle: 'italic',
            }}>
              Auction not found.
            </div>
            <div style={{
              fontFamily: 'DM Mono, monospace', fontSize: '0.58rem',
              color: C.textDark, letterSpacing: '0.08em',
            }}>
              No auction with ID "{query}" exists in the registry.
            </div>
          </div>
        )}

        {searched && result && (
          <div style={{ animation: 'fadeInUp 0.3s ease both' }}>
            {/* Auction header */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '16px',
              marginBottom: '24px',
            }}>
              <div style={{
                width: '56px', height: '56px',
                background: 'rgba(123, 94, 167, 0.1)',
                border: `1px solid rgba(123, 94, 167, 0.2)`,
                borderRadius: '12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.8rem', flexShrink: 0,
              }}>
                {result.icon}
              </div>
              <div>
                <div style={{
                  fontFamily: 'DM Mono, monospace', fontSize: '0.52rem',
                  color: C.textDark, letterSpacing: '0.2em',
                  textTransform: 'uppercase', marginBottom: '4px',
                }}>
                  Auction #{result.id} · {result.category}
                </div>
                <div style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: '1.4rem', fontWeight: 600,
                  color: C.text, letterSpacing: '0.02em',
                }}>
                  {result.name}
                </div>
              </div>
            </div>

            {/* Verification certificate */}
            <div style={{
              background: C.card,
              border: `1px solid ${verified ? 'rgba(126, 200, 156, 0.25)' : 'rgba(212, 168, 68, 0.22)'}`,
              borderRadius: '14px',
              overflow: 'hidden',
            }}>
              {/* cert header */}
              <div style={{
                padding: '20px 24px',
                background: verified
                  ? 'rgba(126, 200, 156, 0.05)'
                  : 'rgba(212, 168, 68, 0.05)',
                borderBottom: `1px solid ${verified ? 'rgba(126, 200, 156, 0.14)' : 'rgba(212, 168, 68, 0.14)'}`,
                display: 'flex', alignItems: 'center', gap: '16px',
              }}>
                <ShieldIcon verified={verified} size={36} />
                <div>
                  <div style={{
                    fontFamily: 'DM Mono, monospace', fontSize: '0.55rem',
                    color: C.textDark, letterSpacing: '0.2em',
                    textTransform: 'uppercase', marginBottom: '4px',
                  }}>
                    Gavel Verification Certificate
                  </div>
                  <div style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: '1.45rem', fontWeight: 600,
                    color: verified ? '#7ec89c' : '#d4a844',
                    letterSpacing: '0.02em',
                  }}>
                    {verified ? 'Authenticity Verified' : 'Not Verified'}
                  </div>
                </div>
              </div>

              {verified ? (
                <>
                  <RecordRow label="Verification ID" value={auth.id} accent={C.purpleLight} />
                  <RecordRow label="Type" value={auth.type} />
                  <RecordRow label="Issuing Authority" value={auth.authority} />
                  <RecordRow label="Document Reference" value={auth.docRef} />
                  {auth.docName && <RecordRow label="Document" value={auth.docName} />}
                  {auth.smartContract && <RecordRow label="Smart Contract" value={auth.smartContract} accent={C.purpleLight} />}
                  <RecordRow label="Verified Date" value={auth.verifiedAt} />

                  <div style={{
                    padding: '16px 20px',
                    display: 'flex', alignItems: 'center', gap: '10px',
                    background: 'rgba(126, 200, 156, 0.04)',
                    borderTop: '1px solid rgba(126, 200, 156, 0.1)',
                  }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                      <path d="M12 2L3 7V12C3 16.55 6.84 20.74 12 22C17.16 20.74 21 16.55 21 12V7L12 2Z"
                        stroke="#7ec89c" strokeWidth="1.8" strokeLinejoin="round"/>
                      <path d="M8.5 12L11 14.5L15.5 10" stroke="#7ec89c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span style={{
                      fontFamily: 'DM Mono, monospace', fontSize: '0.58rem',
                      color: '#7ec89c', letterSpacing: '0.06em',
                    }}>
                      Authenticity guaranteed by Gavel
                    </span>
                  </div>
                </>
              ) : (
                <div style={{ padding: '24px' }}>
                  <p style={{
                    fontFamily: 'DM Mono, monospace', fontSize: '0.62rem',
                    color: C.textMuted, lineHeight: 1.75, letterSpacing: '0.04em',
                    marginBottom: '16px',
                  }}>
                    No proof of ownership or certificate of authenticity has been submitted for this item. The seller has not undergone Gavel's verification process.
                  </p>
                  <div style={{
                    padding: '12px 16px',
                    background: 'rgba(212, 168, 68, 0.06)',
                    border: '1px solid rgba(212, 168, 68, 0.2)',
                    borderRadius: '8px',
                    fontFamily: 'DM Mono, monospace', fontSize: '0.58rem',
                    color: '#d4a844', letterSpacing: '0.06em',
                  }}>
                    ⚠ This item has not been verified by Gavel. Proceed with caution.
                  </div>
                </div>
              )}
            </div>

            {/* View auction link */}
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <button
                onClick={() => navigate(`/auction/${result.id}`)}
                style={{
                  fontFamily: 'DM Mono, monospace', fontSize: '0.62rem',
                  letterSpacing: '0.12em', textTransform: 'uppercase',
                  padding: '12px 28px',
                  background: 'linear-gradient(135deg, #7B5EA7, #5a3f8a)',
                  color: '#fff', border: 'none', borderRadius: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 6px 24px rgba(123, 94, 167, 0.28)',
                }}
              >
                View Auction →
              </button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!searched && (
          <div style={{
            padding: '48px 24px', textAlign: 'center',
            background: C.card, border: `1px solid ${C.border}`,
            borderRadius: '14px',
          }}>
            <div style={{
              width: '56px', height: '56px',
              background: 'rgba(123, 94, 167, 0.08)',
              border: '1px solid rgba(123, 94, 167, 0.18)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 18px',
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L3 7V12C3 16.55 6.84 20.74 12 22C17.16 20.74 21 16.55 21 12V7L12 2Z"
                  stroke="#7B5EA7" strokeWidth="1.6" strokeLinejoin="round"/>
                <path d="M8.5 12L11 14.5L15.5 10" stroke="#7B5EA7" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '1.2rem', fontWeight: 500, fontStyle: 'italic',
              color: C.textMuted, marginBottom: '8px',
            }}>
              Enter an auction ID above.
            </div>
            <div style={{
              fontFamily: 'DM Mono, monospace', fontSize: '0.58rem',
              color: C.textDark, letterSpacing: '0.08em',
            }}>
              Auction IDs are shown on each listing card and on the bidding page.
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
