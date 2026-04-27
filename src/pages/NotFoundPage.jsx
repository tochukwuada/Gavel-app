import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const C = {
  bg: '#050507',
  purple: '#7B5EA7',
  purpleLight: '#9B7EC8',
  text: '#e8e4f0',
  textMuted: '#9589aa',
  textDark: '#4e4660',
};

export default function NotFoundPage() {
  const navigate = useNavigate();
  const [btnHover, setBtnHover] = useState(false);

  return (
    <div style={{
      background: C.bg,
      minHeight: '100vh',
      paddingTop: '64px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '64px 32px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* background glow */}
      <div style={{
        position: 'absolute', top: '30%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '600px', height: '400px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(123,94,167,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* grid overlay */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: `
          linear-gradient(rgba(123, 94, 167, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(123, 94, 167, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '64px 64px',
      }} />

      {/* 404 number */}
      <div style={{
        fontFamily: 'Cormorant Garamond, serif',
        fontSize: 'clamp(7rem, 20vw, 14rem)',
        fontWeight: 700,
        letterSpacing: '0.15em',
        lineHeight: 0.85,
        color: 'transparent',
        WebkitTextStroke: `1px rgba(123, 94, 167, 0.3)`,
        textShadow: `0 0 80px rgba(155, 126, 200, 0.15)`,
        marginBottom: '40px',
        animation: 'fadeInUp 0.7s ease both',
        userSelect: 'none',
        position: 'relative',
      }}>
        404
        {/* inner glow text */}
        <div style={{
          position: 'absolute', inset: 0,
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: 'inherit',
          fontWeight: 700,
          letterSpacing: '0.15em',
          lineHeight: 0.85,
          color: 'rgba(123, 94, 167, 0.08)',
          WebkitTextStroke: 0,
          filter: 'blur(12px)',
          animation: 'glowPulse 3s ease infinite',
        }}>
          404
        </div>
      </div>

      {/* wax seal icon */}
      <div style={{
        marginBottom: '28px',
        animation: 'fadeInUp 0.7s ease 0.1s both',
      }}>
        <svg width="48" height="48" viewBox="0 0 72 72" fill="none">
          <circle cx="36" cy="36" r="34" fill="rgba(123,94,167,0.1)" stroke="rgba(123,94,167,0.3)" strokeWidth="1"/>
          <path d="M36 22L39.09 31.1H48.73L41.32 36.65L44.41 45.75L36 40.2L27.59 45.75L30.68 36.65L23.27 31.1H32.91L36 22Z"
            fill="none" stroke="#7B5EA7" strokeWidth="1.2" strokeLinejoin="round" opacity="0.7"/>
        </svg>
      </div>

      <div style={{
        fontFamily: 'DM Mono, monospace',
        fontSize: '0.6rem',
        letterSpacing: '0.28em',
        textTransform: 'uppercase',
        color: C.purple,
        marginBottom: '14px',
        animation: 'fadeInUp 0.7s ease 0.15s both',
      }}>
        Sealed & Gone
      </div>

      <h1 style={{
        fontFamily: 'Cormorant Garamond, serif',
        fontSize: 'clamp(1.4rem, 3.5vw, 2rem)',
        fontWeight: 500,
        color: C.text,
        letterSpacing: '0.04em',
        lineHeight: 1.3,
        marginBottom: '12px',
        maxWidth: '480px',
        animation: 'fadeInUp 0.7s ease 0.2s both',
      }}>
        This auction doesn't exist or has ended.
      </h1>

      <p style={{
        fontFamily: 'DM Mono, monospace',
        fontSize: '0.63rem',
        color: C.textDark,
        letterSpacing: '0.08em',
        lineHeight: 1.7,
        maxWidth: '360px',
        marginBottom: '44px',
        animation: 'fadeInUp 0.7s ease 0.25s both',
      }}>
        The lot you're looking for may have closed, been withdrawn, or the URL might be incorrect.
      </p>

      <button
        onClick={() => navigate('/')}
        onMouseEnter={() => setBtnHover(true)}
        onMouseLeave={() => setBtnHover(false)}
        style={{
          fontFamily: 'DM Mono, monospace',
          fontSize: '0.7rem',
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          padding: '14px 40px',
          background: btnHover
            ? 'linear-gradient(135deg, #9B7EC8, #7B5EA7)'
            : 'linear-gradient(135deg, #7B5EA7, #5a3f8a)',
          color: '#fff',
          border: 'none',
          borderRadius: '7px',
          cursor: 'pointer',
          transition: 'all 0.3s',
          transform: btnHover ? 'translateY(-2px)' : 'none',
          boxShadow: btnHover
            ? '0 14px 42px rgba(123, 94, 167, 0.5)'
            : '0 6px 24px rgba(123, 94, 167, 0.28)',
          animation: 'fadeInUp 0.7s ease 0.3s both',
        }}
      >
        ← Back to Auctions
      </button>
    </div>
  );
}
