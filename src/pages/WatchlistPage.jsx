import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { AUCTIONS } from '../data/auctions';
import { useWatchlist } from '../hooks/useWatchlist';
import AuctionCard from '../components/AuctionCard';
import { useIsMobile } from '../hooks/useIsMobile';

const C = {
  bg: '#050507',
  purple: '#7B5EA7',
  purpleLight: '#9B7EC8',
  text: '#e8e4f0',
  textMuted: '#9589aa',
  textDark: '#4e4660',
};

export default function WatchlistPage() {
  const navigate = useNavigate();
  const { watchlist } = useWatchlist();
  const isMobile = useIsMobile();
  const [backHover, setBackHover] = useState(false);

  const saved = AUCTIONS.filter(a => watchlist.includes(a.id));

  return (
    <div style={{ background: C.bg, minHeight: '100vh', paddingTop: '64px', cursor: 'default' }}>
      <div style={{ maxWidth: '1420px', margin: '0 auto', padding: isMobile ? '40px 16px 80px' : '60px 60px 100px', width: '100%' }}>

        {/* back */}
        <button
          onClick={() => navigate('/')}
          onMouseEnter={() => setBackHover(true)}
          onMouseLeave={() => setBackHover(false)}
          style={{
            fontFamily: 'DM Mono, monospace', fontSize: '0.75rem',
            letterSpacing: '0.14em', color: backHover ? C.textMuted : C.textDark,
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '6px',
            transition: 'color 0.2s',
          }}
        >
          ← All Auctions
        </button>

        {/* heading */}
        <div style={{ marginBottom: '48px' }}>
          <div style={{
            fontFamily: 'DM Mono, monospace', fontSize: '0.58rem',
            letterSpacing: '0.26em', textTransform: 'uppercase',
            color: C.purple, marginBottom: '12px',
          }}>
            Saved
          </div>
          <h1 style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: 500, color: C.text,
            letterSpacing: '0.04em', lineHeight: 1.1, marginBottom: '8px',
          }}>
            Your Watchlist
          </h1>
          <p style={{
            fontFamily: 'DM Mono, monospace', fontSize: '0.62rem',
            color: C.textDark, letterSpacing: '0.1em',
          }}>
            {saved.length} auction{saved.length !== 1 ? 's' : ''} saved
          </p>
        </div>

        {/* empty state */}
        {saved.length === 0 ? (
          <div style={{
            textAlign: 'center', paddingTop: '60px', paddingBottom: '60px',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '20px', opacity: 0.4 }}>🔖</div>
            <p style={{
              fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic',
              fontSize: '1.4rem', color: C.textMuted, marginBottom: '8px',
              letterSpacing: '0.03em',
            }}>
              Nothing saved yet.
            </p>
            <p style={{
              fontFamily: 'DM Mono, monospace', fontSize: '0.75rem',
              color: C.textDark, letterSpacing: '0.1em', marginBottom: '32px',
            }}>
              Browse auctions and click the bookmark icon to save them here.
            </p>
            <button
              onClick={() => navigate('/')}
              style={{
                fontFamily: 'DM Mono, monospace', fontSize: '0.8rem',
                letterSpacing: '0.14em', textTransform: 'uppercase',
                padding: '12px 32px',
                background: 'linear-gradient(135deg, #7B5EA7, #5a3f8a)',
                color: '#fff', border: 'none', borderRadius: '7px',
                cursor: 'pointer',
              }}
            >
              Browse Auctions →
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '22px',
          }}>
            {saved.map(a => (
              <AuctionCard key={a.id} auction={a} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
