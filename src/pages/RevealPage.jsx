import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { getAuction } from '../data/auctions';
import { useIsMobile } from '../hooks/useIsMobile';

const C = {
  bg: '#050507',
  card: '#0c0a14',
  border: 'rgba(123, 94, 167, 0.16)',
  borderMid: 'rgba(123, 94, 167, 0.28)',
  purple: '#7B5EA7',
  purpleLight: '#9B7EC8',
  text: '#e8e4f0',
  textMuted: '#9589aa',
  textDark: '#4e4660',
};

function WaxSeal() {
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
      <circle cx="36" cy="36" r="34" fill="rgba(123,94,167,0.18)" stroke="#7B5EA7" strokeWidth="1.5"/>
      <circle cx="36" cy="36" r="26" fill="rgba(123,94,167,0.12)" stroke="#9B7EC8" strokeWidth="1"/>
      <path d="M36 22L39.09 31.1H48.73L41.32 36.65L44.41 45.75L36 40.2L27.59 45.75L30.68 36.65L23.27 31.1H32.91L36 22Z"
        fill="#9B7EC8" opacity="0.9"/>
      <circle cx="36" cy="36" r="34" fill="none" stroke="rgba(155,126,200,0.15)" strokeWidth="8"/>
    </svg>
  );
}

function EnvelopeBack({ auction, bidAmount, auctionType }) {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'linear-gradient(160deg, #0f0b1c 0%, #0c0a14 100%)',
      border: `1px solid ${C.borderMid}`,
      borderRadius: '16px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '20px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* diagonal fold lines */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: `
          linear-gradient(135deg, rgba(123,94,167,0.06) 25%, transparent 25%),
          linear-gradient(225deg, rgba(123,94,167,0.06) 25%, transparent 25%)
        `,
        backgroundSize: '100% 50%',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'top',
      }} />

      {/* envelope V-fold top */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: 0,
        borderLeft: '240px solid transparent',
        borderRight: '240px solid transparent',
        borderTop: '120px solid rgba(123,94,167,0.09)',
      }} />

      <WaxSeal />

      <div style={{
        fontFamily: 'Cormorant Garamond, serif',
        fontSize: '1rem',
        fontWeight: 600,
        letterSpacing: '0.35em',
        textTransform: 'uppercase',
        color: C.textMuted,
      }}>
        Sealed Envelope
      </div>

      <div style={{
        fontFamily: 'DM Mono, monospace',
        fontSize: '0.58rem',
        color: C.textDark,
        letterSpacing: '0.12em',
        textAlign: 'center',
        lineHeight: 1.7,
        maxWidth: '260px',
      }}>
        {auction.bidCount + 1} bids sealed by Arcium MPC
        <br />
        Click below to unseal and reveal the winner
      </div>
    </div>
  );
}

function WinnerCard({ bidAmount, auctionType, auction }) {
  const settlement = auctionType === 'vickrey'
    ? bidAmount * 0.83
    : bidAmount;

  const savings = auctionType === 'vickrey'
    ? bidAmount - settlement
    : null;

  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'linear-gradient(160deg, #120d22 0%, #0c0a14 100%)',
      border: `1px solid rgba(155, 126, 200, 0.35)`,
      borderRadius: '16px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0',
      padding: '32px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* glow */}
      <div style={{
        position: 'absolute', top: '-40px', left: '50%',
        transform: 'translateX(-50%)',
        width: '300px', height: '200px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(155,126,200,0.18) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        fontFamily: 'DM Mono, monospace',
        fontSize: '0.55rem',
        letterSpacing: '0.32em',
        color: C.purple,
        textTransform: 'uppercase',
        marginBottom: '10px',
      }}>
        ✦ Winner Declared ✦
      </div>

      <div style={{
        fontFamily: 'Cormorant Garamond, serif',
        fontSize: '2rem',
        fontWeight: 600,
        color: C.purpleLight,
        letterSpacing: '0.06em',
        marginBottom: '6px',
        textShadow: '0 0 40px rgba(155,126,200,0.5)',
      }}>
        You
      </div>

      <div style={{
        fontFamily: 'DM Mono, monospace',
        fontSize: '0.62rem',
        color: C.textMuted,
        letterSpacing: '0.08em',
        marginBottom: '22px',
      }}>
        0xDEAD...c0DE
      </div>

      <div style={{
        width: '100%',
        padding: '14px 20px',
        background: 'rgba(123, 94, 167, 0.08)',
        border: `1px solid rgba(123, 94, 167, 0.18)`,
        borderRadius: '9px',
        textAlign: 'center',
      }}>
        <div style={{
          fontFamily: 'DM Mono, monospace',
          fontSize: '0.52rem',
          letterSpacing: '0.2em',
          color: C.textDark,
          textTransform: 'uppercase',
          marginBottom: '6px',
        }}>
          Settlement Price
        </div>
        <div style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: '1.8rem',
          fontWeight: 600,
          color: C.text,
        }}>
          {settlement.toFixed(3)} ETH
        </div>
        {savings !== null && (
          <div style={{
            fontFamily: 'DM Mono, monospace',
            fontSize: '0.55rem',
            color: '#7ec89c',
            letterSpacing: '0.1em',
            marginTop: '4px',
          }}>
            Saved {savings.toFixed(3)} ETH via Vickrey mechanism
          </div>
        )}
      </div>
    </div>
  );
}

const STAT_DELAY = [0, 0.1, 0.2, 0.3];

export default function RevealPage() {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // All hooks must be called unconditionally before any early return.
  // React tracks hooks by call order — a conditional return before these
  // would cause "Rendered fewer hooks than expected" on direct URL visits.
  const [revealed, setRevealed] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [btnHover, setBtnHover] = useState(false);
  const [backHover, setBackHover] = useState(false);

  useEffect(() => {
    if (revealed) {
      const t = setTimeout(() => setShowStats(true), 1100);
      return () => clearTimeout(t);
    }
  }, [revealed]);

  // Guard after all hooks: no navigation state means direct URL visit / refresh.
  // Send the user back to the bidding page rather than showing fabricated data.
  if (!state) {
    return <Navigate to={`/auction/${id}`} replace />;
  }

  const auction = getAuction(id) ?? state.auction;
  const bidAmount = state.bidAmount;
  const auctionType = state.auctionType ?? 'vickrey';

  if (!auction) {
    return (
      <div style={{ paddingTop: '120px', textAlign: 'center', color: C.textMuted, fontFamily: 'DM Mono, monospace' }}>
        Auction not found.{' '}
        <button onClick={() => navigate('/')} style={{ color: C.purple, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
          Go home
        </button>
      </div>
    );
  }

  const settlement = auctionType === 'vickrey' ? bidAmount * 0.83 : bidAmount;
  const totalBids = auction.bidCount + 1;

  const STATS = [
    { label: 'Total Participants', value: String(totalBids) },
    {
      label: 'Privacy Preserved',
      value: `${totalBids - 1}/${totalBids}`,
      sub: 'bids permanently sealed',
    },
    {
      label: 'Auction Type',
      value: auctionType === 'vickrey' ? 'Vickrey' : 'First-Price',
      sub: auctionType === 'vickrey' ? 'Second-price sealed-bid' : 'Highest bid wins & pays',
    },
    {
      label: 'Settlement',
      value: `${settlement.toFixed(3)} ETH`,
      sub: 'On-chain via Arcium MPC',
      highlight: true,
    },
  ];

  return (
    <div style={{ background: C.bg, minHeight: '100vh', paddingTop: '64px' }}>
      <div style={{
        maxWidth: '740px',
        margin: '0 auto',
        padding: isMobile ? '40px 16px 80px' : '60px 32px 100px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        {/* Back link */}
        <div style={{ width: '100%', marginBottom: '36px' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              fontFamily: 'DM Mono, monospace',
              fontSize: '0.6rem',
              letterSpacing: '0.14em',
              color: backHover ? C.textMuted : C.textDark,
              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              transition: 'color 0.2s',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}
            onMouseEnter={() => setBackHover(true)}
            onMouseLeave={() => setBackHover(false)}
          >
            ← All Auctions
          </button>
        </div>

        {/* Section label */}
        <div style={{
          fontFamily: 'DM Mono, monospace',
          fontSize: '0.58rem',
          letterSpacing: '0.28em',
          color: C.purple,
          textTransform: 'uppercase',
          marginBottom: '12px',
          animation: 'fadeInUp 0.6s ease both',
        }}>
          Auction Result
        </div>

        <h1 style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: 'clamp(1.8rem, 5vw, 2.8rem)',
          fontWeight: 600,
          color: C.text,
          letterSpacing: '0.04em',
          textAlign: 'center',
          marginBottom: '8px',
          animation: 'fadeInUp 0.6s ease 0.05s both',
        }}>
          {auction.name}
        </h1>

        <p style={{
          fontFamily: 'DM Mono, monospace',
          fontSize: '0.62rem',
          color: C.textDark,
          letterSpacing: '0.1em',
          marginBottom: '48px',
          animation: 'fadeInUp 0.6s ease 0.1s both',
        }}>
          {auction.totalBids ?? totalBids} sealed bids · Arcium MPC settlement
        </p>

        {/* ── Flip card ──────────────────────────────────── */}
        <div style={{
          width: '100%',
          maxWidth: '480px',
          height: '280px',
          perspective: '1200px',
          marginBottom: '48px',
          animation: 'fadeInUp 0.7s ease 0.15s both',
        }}>
          <div style={{
            width: '100%', height: '100%',
            position: 'relative',
            transformStyle: 'preserve-3d',
            transition: 'transform 1.1s cubic-bezier(0.4, 0.2, 0.2, 1)',
            transform: revealed ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}>
            {/* Front: envelope */}
            <div style={{
              position: 'absolute', width: '100%', height: '100%',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}>
              <EnvelopeBack auction={auction} bidAmount={bidAmount} auctionType={auctionType} />
            </div>

            {/* Back: winner */}
            <div style={{
              position: 'absolute', width: '100%', height: '100%',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}>
              <WinnerCard bidAmount={bidAmount} auctionType={auctionType} auction={auction} />
            </div>
          </div>
        </div>

        {/* ── Reveal / New auction button ─────────────────── */}
        {!revealed ? (
          <button
            onClick={() => setRevealed(true)}
            style={{
              fontFamily: 'DM Mono, monospace',
              fontSize: '0.72rem',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              padding: '16px 48px',
              background: btnHover
                ? 'linear-gradient(135deg, #9B7EC8, #7B5EA7)'
                : 'linear-gradient(135deg, #7B5EA7, #5a3f8a)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s',
              transform: btnHover ? 'translateY(-2px)' : 'none',
              boxShadow: btnHover
                ? '0 16px 48px rgba(123, 94, 167, 0.55)'
                : '0 6px 28px rgba(123, 94, 167, 0.3)',
              animation: 'glowPulse 2.5s ease infinite',
            }}
            onMouseEnter={() => setBtnHover(true)}
            onMouseLeave={() => setBtnHover(false)}
          >
            Break the Seal
          </button>
        ) : (
          <button
            onClick={() => navigate('/')}
            style={{
              fontFamily: 'DM Mono, monospace',
              fontSize: '0.65rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              padding: '14px 40px',
              background: 'transparent',
              color: btnHover ? C.purpleLight : C.textMuted,
              border: `1px solid ${btnHover ? 'rgba(155,126,200,0.4)' : 'rgba(123,94,167,0.2)'}`,
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.25s',
              animation: 'fadeIn 0.6s ease both',
            }}
            onMouseEnter={() => setBtnHover(true)}
            onMouseLeave={() => setBtnHover(false)}
          >
            Browse More Auctions
          </button>
        )}

        {/* ── Result stats ─────────────────────────────────── */}
        {showStats && (
          <div style={{
            width: '100%',
            marginTop: '56px',
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: '16px',
          }}>
            {STATS.map((s, i) => (
              <div
                key={s.label}
                style={{
                  background: s.highlight ? 'rgba(123, 94, 167, 0.08)' : C.card,
                  border: `1px solid ${s.highlight ? 'rgba(155,126,200,0.3)' : C.border}`,
                  borderRadius: '12px',
                  padding: '22px 20px',
                  animation: `revealStat 0.5s ease ${STAT_DELAY[i]}s both`,
                }}
              >
                <div style={{
                  fontFamily: 'DM Mono, monospace',
                  fontSize: '0.52rem',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: C.textDark,
                  marginBottom: '8px',
                }}>
                  {s.label}
                </div>
                <div style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: '1.45rem',
                  fontWeight: 600,
                  color: s.highlight ? C.purpleLight : C.text,
                  letterSpacing: '0.03em',
                  lineHeight: 1.1,
                  textShadow: s.highlight ? '0 0 30px rgba(155,126,200,0.4)' : 'none',
                }}>
                  {s.value}
                </div>
                {s.sub && (
                  <div style={{
                    fontFamily: 'DM Mono, monospace',
                    fontSize: '0.54rem',
                    color: C.textDark,
                    letterSpacing: '0.08em',
                    marginTop: '4px',
                  }}>
                    {s.sub}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Privacy proof banner ─────────────────────────── */}
        {showStats && (
          <div style={{
            width: '100%',
            marginTop: '20px',
            padding: '18px 22px',
            background: 'rgba(123, 94, 167, 0.05)',
            border: `1px solid rgba(123, 94, 167, 0.12)`,
            borderRadius: '12px',
            display: 'flex',
            gap: '14px',
            alignItems: 'flex-start',
            animation: 'revealStat 0.5s ease 0.35s both',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: '2px' }}>
              <path d="M12 2L3 7V12C3 16.55 6.84 20.74 12 22C17.16 20.74 21 16.55 21 12V7L12 2Z"
                stroke="#9B7EC8" strokeWidth="1.8" strokeLinejoin="round"/>
              <path d="M9 12L11 14L15 10" stroke="#9B7EC8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div>
              <div style={{
                fontFamily: 'DM Mono, monospace',
                fontSize: '0.6rem',
                color: C.purpleLight,
                letterSpacing: '0.1em',
                marginBottom: '4px',
              }}>
                Privacy verified by Arcium MPC
              </div>
              <div style={{
                fontFamily: 'DM Mono, monospace',
                fontSize: '0.58rem',
                color: C.textDark,
                lineHeight: 1.65,
                letterSpacing: '0.05em',
              }}>
                {totalBids - 1} of {totalBids} bids remain permanently sealed. No participant — including the auctioneer — can access losing bid amounts. Settlement computed via verifiable multi-party computation.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
