import { useState } from 'react';
import { createPortal } from 'react-dom';
import { getPrefsFor, savePrefsFor } from '../hooks/useNotifications';

const C = {
  bg: '#0c0a14',
  purple: '#7B5EA7',
  purpleLight: '#9B7EC8',
  text: '#e8e4f0',
  textMuted: '#9589aa',
  textDark: '#4e4660',
};

const OPTIONS = [
  { key: 'h24',    label: 'Auction ending in 24 hours' },
  { key: 'h1',     label: 'Auction ending in 1 hour' },
  { key: 'm15',    label: 'Auction ending in 15 minutes' },
  { key: 'outbid', label: 'If I get outbid' },
];

export default function NotifPrefsModal({ auction, onClose }) {
  const [prefs, setPrefs] = useState(() => getPrefsFor(auction.id));

  const toggle = (key) => setPrefs(p => ({ ...p, [key]: !p[key] }));

  const handleSave = () => {
    savePrefsFor(auction.id, prefs);
    onClose();
  };

  return createPortal(
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1100,
        background: 'rgba(5, 5, 7, 0.8)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.18s ease both',
      }}
    >
      <div style={{
        background: C.bg,
        border: '1px solid rgba(123, 94, 167, 0.3)',
        borderRadius: '16px',
        padding: '32px',
        width: '100%',
        maxWidth: '380px',
        animation: 'fadeInUp 0.22s ease both',
      }}>
        {/* header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"
              stroke={C.purpleLight} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M13.73 21a2 2 0 01-3.46 0"
              stroke={C.purpleLight} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h3 style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '1.4rem', fontWeight: 600,
            color: C.text, letterSpacing: '0.02em', margin: 0,
          }}>
            Notify Me
          </h3>
        </div>

        <p style={{
          fontFamily: 'DM Mono, monospace', fontSize: '0.58rem',
          color: C.textDark, letterSpacing: '0.06em',
          marginBottom: '24px', lineHeight: 1.6,
          paddingLeft: '26px',
        }}>
          {auction.name}
        </p>

        <div style={{
          fontFamily: 'DM Mono, monospace', fontSize: '0.53rem',
          letterSpacing: '0.22em', textTransform: 'uppercase',
          color: C.textDark, marginBottom: '12px',
        }}>
          Notify me when:
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '22px' }}>
          {OPTIONS.map(opt => (
            <label
              key={opt.key}
              onClick={() => toggle(opt.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                cursor: 'pointer',
                padding: '11px 14px',
                borderRadius: '8px',
                background: prefs[opt.key] ? 'rgba(123, 94, 167, 0.1)' : 'rgba(123, 94, 167, 0.03)',
                border: `1px solid ${prefs[opt.key] ? 'rgba(123, 94, 167, 0.3)' : 'rgba(123, 94, 167, 0.1)'}`,
                transition: 'all 0.16s',
                userSelect: 'none',
              }}
            >
              <div style={{
                width: '15px', height: '15px', borderRadius: '4px', flexShrink: 0,
                background: prefs[opt.key] ? C.purple : 'transparent',
                border: `1.5px solid ${prefs[opt.key] ? C.purple : 'rgba(123, 94, 167, 0.3)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s',
              }}>
                {prefs[opt.key] && (
                  <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <span style={{
                fontFamily: 'DM Mono, monospace', fontSize: '0.63rem',
                color: prefs[opt.key] ? C.text : C.textMuted,
                letterSpacing: '0.04em',
                transition: 'color 0.16s',
              }}>
                {opt.label}
              </span>
            </label>
          ))}
        </div>

        {/* method note */}
        <div style={{
          padding: '10px 14px',
          background: 'rgba(123, 94, 167, 0.05)',
          border: '1px solid rgba(123, 94, 167, 0.12)',
          borderRadius: '8px', marginBottom: '22px',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10" stroke={C.textDark} strokeWidth="1.8"/>
            <path d="M12 8v4M12 16h.01" stroke={C.textDark} strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          <span style={{
            fontFamily: 'DM Mono, monospace', fontSize: '0.56rem',
            color: C.textDark, letterSpacing: '0.04em',
          }}>
            Delivery: In-app notifications only
          </span>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              fontFamily: 'DM Mono, monospace', fontSize: '0.75rem',
              letterSpacing: '0.12em', textTransform: 'uppercase',
              padding: '12px', background: 'transparent',
              color: C.textDark,
              border: '1px solid rgba(123, 94, 167, 0.15)',
              borderRadius: '8px', cursor: 'pointer',
            }}
          >
            Skip
          </button>
          <button
            onClick={handleSave}
            style={{
              flex: 2,
              fontFamily: 'DM Mono, monospace', fontSize: '0.75rem',
              letterSpacing: '0.12em', textTransform: 'uppercase',
              padding: '12px',
              background: 'linear-gradient(135deg, #7B5EA7, #5a3f8a)',
              color: '#fff', border: 'none',
              borderRadius: '8px', cursor: 'pointer',
            }}
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
