import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useIsMobile } from '../hooks/useIsMobile';

const C = {
  bg: 'rgba(5, 5, 7, 0.88)',
  border: 'rgba(123, 94, 167, 0.15)',
  purple: '#7B5EA7',
  purpleLight: '#9B7EC8',
  text: '#e8e4f0',
  textMuted: '#6b5f80',
};

function truncate(pk) {
  const s = pk.toString();
  return `${s.slice(0, 4)}…${s.slice(-4)}`;
}

export default function Navbar() {
  const { connected, publicKey, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  const [hovered, setHovered] = useState(false);
  const isMobile = useIsMobile(640);

  const handleWalletClick = () => {
    if (connected) {
      disconnect();
    } else {
      setVisible(true);
    }
  };

  const btnLabel = connected && publicKey
    ? (hovered ? 'Disconnect' : truncate(publicKey))
    : 'Connect Wallet';

  const btnStyle = {
    fontFamily: 'DM Mono, monospace',
    fontSize: '0.62rem',
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    padding: '8px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'all 0.25s',
    ...(connected
      ? {
          background: hovered ? 'rgba(224, 124, 124, 0.15)' : 'rgba(123, 94, 167, 0.12)',
          color: hovered ? '#e07c7c' : C.purpleLight,
          border: `1px solid ${hovered ? 'rgba(224, 124, 124, 0.35)' : 'rgba(155, 126, 200, 0.3)'}`,
        }
      : {
          background: hovered
            ? 'linear-gradient(135deg, #9B7EC8, #7B5EA7)'
            : 'transparent',
          color: hovered ? '#fff' : C.purpleLight,
          border: `1px solid ${hovered ? 'transparent' : 'rgba(155, 126, 200, 0.35)'}`,
        }),
  };

  return (
    <nav style={{
      position: 'fixed',
      top: 0, left: 0, right: 0,
      zIndex: 200,
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: isMobile ? '0 16px' : '0 48px',
      background: C.bg,
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: `1px solid ${C.border}`,
    }}>
      {/* Logo */}
      <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L3 7V12C3 16.55 6.84 20.74 12 22C17.16 20.74 21 16.55 21 12V7L12 2Z"
            stroke="#9B7EC8" strokeWidth="1.5" strokeLinejoin="round"/>
          <path d="M9 12L11 14L15 10" stroke="#9B7EC8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: '1.6rem',
          fontWeight: 600,
          color: C.text,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          lineHeight: 1,
        }}>
          Gavel
        </span>
      </Link>

      {/* Centre badge — hidden on small screens to avoid overlapping buttons */}
      <div style={{
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)',
        display: isMobile ? 'none' : 'flex',
        alignItems: 'center',
        gap: '8px',
        fontFamily: 'DM Mono, monospace',
        fontSize: '0.6rem',
        color: C.textMuted,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        pointerEvents: 'none',
      }}>
        <span style={{
          width: '6px', height: '6px',
          borderRadius: '50%',
          background: C.purpleLight,
          animation: 'pulse 2s infinite',
        }} />
        Arcium MPC · Live
      </div>

      {/* Wallet button */}
      <button
        style={btnStyle}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={handleWalletClick}
      >
        {connected && (
          <span style={{
            display: 'inline-block',
            width: '6px', height: '6px',
            borderRadius: '50%',
            background: hovered ? '#e07c7c' : '#7ec89c',
            marginRight: '8px',
            verticalAlign: 'middle',
            transition: 'background 0.25s',
          }} />
        )}
        {btnLabel}
      </button>
    </nav>
  );
}
