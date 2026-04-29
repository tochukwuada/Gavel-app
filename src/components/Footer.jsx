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

            {/* GitHub Issues */}
            <a
              href="https://github.com/tochukwuada/Gavel-app/issues"
              target="_blank"
              rel="noopener noreferrer"
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
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Open an Issue
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
