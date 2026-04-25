import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAuction, getTimeLeft } from '../data/auctions';
import { useIsMobile } from '../hooks/useIsMobile';

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

function CountdownTimer({ auction }) {
  const [tl, setTl] = useState(() => getTimeLeft(auction));

  useEffect(() => {
    const iv = setInterval(() => {
      setTl(getTimeLeft(auction));
    }, 1000);
    return () => clearInterval(iv);
  }, []);

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

      <span style={{
        fontFamily: 'DM Mono, monospace',
        fontSize: '0.82rem',
        background: 'linear-gradient(90deg, #2a1f3d, #7B5EA7 30%, #9B7EC8 50%, #7B5EA7 70%, #2a1f3d)',
        backgroundSize: '200% auto',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        animation: `shimmer ${3 + (index % 3) * 0.5}s linear infinite`,
        letterSpacing: '2px',
        userSelect: 'none',
      }}>
        ████████████
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
  { key: 'idle',       label: 'Place Sealed Bid',          icon: null,     bg: 'linear-gradient(135deg, #7B5EA7, #5a3f8a)' },
  { key: 'encrypting', label: 'Encrypting locally...',      icon: 'spin',   bg: 'linear-gradient(135deg, #5a3f8a, #3d2d6a)' },
  { key: 'submitting', label: 'Submitting to Arcium MPC...', icon: 'spin',  bg: 'linear-gradient(135deg, #3d2d6a, #2a1f50)' },
  { key: 'done',       label: 'Sealed & Submitted ✓',       icon: null,     bg: 'linear-gradient(135deg, #4a3c7a, #3d2d6a)' },
];

export default function BiddingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const auction = getAuction(id);

  const [auctionType, setAuctionType] = useState('vickrey');
  const [bidValue, setBidValue] = useState('');
  const [submitIdx, setSubmitIdx] = useState(0);
  const [inputFocused, setInputFocused] = useState(false);
  const [typeHover, setTypeHover] = useState(null);
  const timerIds = useRef([]);

  // Clean up all pending submit timeouts if component unmounts mid-flow
  useEffect(() => {
    return () => timerIds.current.forEach(clearTimeout);
  }, []);

  if (!auction) {
    return (
      <div style={{ paddingTop: '120px', textAlign: 'center', color: C.textMuted, fontFamily: 'DM Mono, monospace' }}>
        Auction not found.
      </div>
    );
  }

  const currentState = SUBMIT_STATES[submitIdx];
  const isProcessing = submitIdx > 0 && submitIdx < 3;
  const isDone = submitIdx === 3;

  const handleSubmit = () => {
    // Capture amount immediately — prevents stale closure if input changes
    // during the 4.5 s animation sequence before navigate fires.
    const amount = parseFloat(bidValue);
    if (!amount || amount <= 0 || isProcessing || isDone) return;

    setSubmitIdx(1);
    const t1 = setTimeout(() => {
      setSubmitIdx(2);
      const t2 = setTimeout(() => {
        setSubmitIdx(3);
        const t3 = setTimeout(() => {
          navigate(`/auction/${id}/reveal`, {
            state: { bidAmount: amount, auctionType, auction },
          });
        }, 700);
        timerIds.current.push(t3);
      }, 2200);
      timerIds.current.push(t2);
    }, 1600);
    timerIds.current.push(t1);
  };

  const TYPE_INFO = {
    'first-price': 'Winner pays their own bid. Higher risk — bid too low and lose, too high and overpay.',
    vickrey: 'Winner pays the second-highest bid. Dominant strategy: bid your true valuation.',
  };

  const ETH_PRICE = 3240;
  const usdValue = bidValue ? (parseFloat(bidValue) * ETH_PRICE).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }) : null;

  return (
    <div style={{ background: C.bg, minHeight: '100vh', paddingTop: '64px' }}>
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

            <h1 style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
              fontWeight: 600,
              color: C.text,
              lineHeight: 1.15,
              letterSpacing: '0.02em',
              marginBottom: '10px',
            }}>
              {auction.name}
            </h1>

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
        {/* ── LEFT: Timer + bid history ─────────────────── */}
        <div>
          <CountdownTimer auction={auction} />

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
                {auction.bidCount} encrypted
              </span>
            </div>

            <div style={{
              border: `1px solid ${C.border}`,
              borderRadius: '12px',
              overflow: 'hidden',
              background: 'rgba(12, 10, 20, 0.6)',
            }}>
              {auction.fakeBids.map((bid, i) => (
                <EncryptedRow key={i} bid={bid} index={i} />
              ))}
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

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px',
            }}>
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

            {/* Type explanation */}
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
              Your Sealed Bid (ETH)
            </label>

            <div style={{
              position: 'relative',
              border: `1px solid ${inputFocused ? C.purple : 'rgba(123, 94, 167, 0.2)'}`,
              borderRadius: '9px',
              background: 'rgba(5, 5, 7, 0.8)',
              transition: 'border-color 0.22s',
              boxShadow: inputFocused ? `0 0 0 3px rgba(123, 94, 167, 0.12)` : 'none',
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
                fontSize: '0.7rem',
                color: C.purple,
                letterSpacing: '0.08em',
                pointerEvents: 'none',
              }}>
                ETH
              </span>
            </div>

            {usdValue && (
              <div style={{
                marginTop: '6px',
                fontFamily: 'DM Mono, monospace',
                fontSize: '0.58rem',
                color: C.textDark,
                letterSpacing: '0.08em',
                paddingLeft: '2px',
                animation: 'fadeIn 0.2s ease',
              }}>
                ≈ {usdValue} USD
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
            disabled={!bidValue || parseFloat(bidValue) <= 0 || isProcessing || isDone}
            style={{
              width: '100%',
              padding: '16px',
              background: (!bidValue || parseFloat(bidValue) <= 0)
                ? 'rgba(123, 94, 167, 0.15)'
                : currentState.bg,
              color: (!bidValue || parseFloat(bidValue) <= 0) ? C.textDark : '#fff',
              border: 'none',
              borderRadius: '9px',
              fontFamily: 'DM Mono, monospace',
              fontSize: '0.72rem',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              cursor: (!bidValue || parseFloat(bidValue) <= 0 || isProcessing || isDone) ? 'not-allowed' : 'pointer',
              transition: 'all 0.35s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              boxShadow: (bidValue && parseFloat(bidValue) > 0 && !isProcessing && !isDone)
                ? '0 8px 32px rgba(123, 94, 167, 0.35)'
                : 'none',
            }}
          >
            {(submitIdx === 1 || submitIdx === 2) && (
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

          {/* Arcium badge */}
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
        </div>
      </div>
    </div>
  );
}
