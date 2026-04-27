import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const C = {
  border: 'rgba(123, 94, 167, 0.1)',
  purple: '#7B5EA7',
  purpleLight: '#9B7EC8',
  textDark: '#4e4660',
  textMuted: '#9589aa',
};

const NAV = [
  { label: 'About',   path: '/about' },
  { label: 'Docs',    path: '/docs' },
  { label: 'FAQ',     path: '/faq' },
  { label: 'Terms',   path: '/terms' },
  { label: 'Privacy', path: '/privacy' },
];

export default function Footer() {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(null);
  const [supportHover, setSupportHover] = useState(false);

  return (
    <footer style={{
      borderTop: `1px solid ${C.border}`,
      background: '#050507',
      padding: '36px 60px',
    }}>
      <div style={{ maxWidth: '1420px', margin: '0 auto' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          marginBottom: '28px',
        }}>
          <span style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '1.2rem',
            fontWeight: 600,
            color: C.textDark,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
          }}>
            Gavel
          </span>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            <nav style={{ display: 'flex', gap: '28px', flexWrap: 'wrap', alignItems: 'center' }}>
              {NAV.map(l => (
                <button
                  key={l.path}
                  onClick={() => navigate(l.path)}
                  onMouseEnter={() => setHovered(l.path)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                    fontFamily: 'DM Mono, monospace',
                    fontSize: '0.6rem',
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: hovered === l.path ? C.purpleLight : C.textDark,
                    transition: 'color 0.2s',
                  }}
                >
                  {l.label}
                </button>
              ))}
            </nav>

            {/* Contact Support */}
            <a
              href="mailto:support@gavel.gg"
              onMouseEnter={() => setSupportHover(true)}
              onMouseLeave={() => setSupportHover(false)}
              style={{
                fontFamily: 'DM Mono, monospace',
                fontSize: '0.6rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                padding: '7px 14px',
                borderRadius: '6px',
                border: `1px solid ${supportHover ? 'rgba(155, 126, 200, 0.4)' : 'rgba(123, 94, 167, 0.22)'}`,
                color: supportHover ? C.purpleLight : C.textMuted,
                background: supportHover ? 'rgba(123, 94, 167, 0.08)' : 'transparent',
                transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                  stroke="currentColor" strokeWidth="2"/>
                <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2"/>
              </svg>
              Contact Support
            </a>
          </div>
        </div>

        <div style={{ borderTop: 'rgba(123, 94, 167, 0.07) 1px solid', marginBottom: '24px' }} />

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <span style={{
            fontFamily: 'DM Mono, monospace',
            fontSize: '0.53rem',
            color: C.textDark,
            letterSpacing: '0.1em',
          }}>
            © {new Date().getFullYear()} Gavel. All rights reserved.
          </span>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontFamily: 'DM Mono, monospace',
            fontSize: '0.53rem',
            color: C.textDark,
            letterSpacing: '0.08em',
          }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L3 7V12C3 16.55 6.84 20.74 12 22C17.16 20.74 21 16.55 21 12V7L12 2Z"
                stroke="#4e4660" strokeWidth="2" strokeLinejoin="round"/>
            </svg>
            Powered by Arcium MPC · Sealed bids · Zero knowledge
          </div>
        </div>
      </div>
    </footer>
  );
}
