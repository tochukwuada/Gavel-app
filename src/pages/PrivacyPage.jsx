import { useNavigate } from 'react-router-dom';
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

const COLLECTED = [
  {
    label: 'Wallet address',
    why: 'Required to participate in auctions.',
    how: 'Your address is your public identifier on Gavel. It is stored in our database linked to your auction activity.',
  },
  {
    label: 'Encrypted bid commitments',
    why: 'To audit auction integrity and resolve disputes.',
    how: 'We store the encrypted commitment hash, not the bid amount. The amount is sealed inside Arcium MPC and never stored by Gavel.',
  },
  {
    label: 'IP address',
    why: 'Security and fraud prevention.',
    how: 'Logged per session for abuse detection. IP logs are not linked to bid data and are retained for 90 days only.',
  },
  {
    label: 'Session data',
    why: 'Authentication state management.',
    how: 'Browser session tokens are created when you connect your wallet and cleared when you disconnect. We do not use persistent tracking cookies.',
  },
];

const GDPR_RIGHTS = [
  { label: 'Right of access', body: 'Request a copy of all personal data we hold about you.' },
  { label: 'Right to rectification', body: 'Request correction of inaccurate or incomplete data.' },
  { label: 'Right to erasure', body: 'Request deletion of your data, subject to legal retention obligations.' },
  { label: 'Right to object', body: 'Object to specific types of processing, including profiling.' },
  { label: 'Right to portability', body: 'Receive your data in a structured, machine-readable format.' },
];

function PrivacySection({ n, title, children }) {
  return (
    <div style={{
      marginBottom: '44px',
      paddingBottom: '44px',
      borderBottom: '1px solid rgba(123, 94, 167, 0.08)',
    }}>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
        <span style={{
          fontFamily: 'DM Mono, monospace',
          fontSize: '0.52rem',
          color: C.purple,
          letterSpacing: '0.2em',
          paddingTop: '5px',
          flexShrink: 0,
          minWidth: '28px',
        }}>
          {n}
        </span>
        <div style={{ flex: 1 }}>
          <h2 style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '1.45rem',
            fontWeight: 600,
            color: C.text,
            letterSpacing: '0.02em',
            marginBottom: '16px',
          }}>
            {title}
          </h2>
          {children}
        </div>
      </div>
    </div>
  );
}

function BodyText({ children }) {
  return (
    <p style={{
      fontFamily: 'DM Mono, monospace',
      fontSize: '0.62rem',
      color: C.textMuted,
      lineHeight: 1.8,
      letterSpacing: '0.04em',
      marginBottom: '14px',
    }}>
      {children}
    </p>
  );
}

export default function PrivacyPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  return (
    <div style={{ background: C.bg, minHeight: '100vh', paddingTop: '64px' }}>
      <div style={{
        maxWidth: '820px',
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
        <div style={{ marginBottom: '60px' }}>
          <div style={{
            fontFamily: 'DM Mono, monospace', fontSize: '0.55rem',
            letterSpacing: '0.3em', color: C.purple,
            textTransform: 'uppercase', marginBottom: '14px',
          }}>
            Legal
          </div>
          <h1 style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 'clamp(2.4rem, 6vw, 3.8rem)',
            fontWeight: 600, color: C.text,
            letterSpacing: '0.04em', lineHeight: 1.05,
            marginBottom: '14px',
          }}>
            Privacy Policy
          </h1>
          <p style={{
            fontFamily: 'DM Mono, monospace', fontSize: '0.58rem',
            color: C.textDark, letterSpacing: '0.08em',
          }}>
            Last updated: January 2025
          </p>
        </div>

        {/* Notice */}
        <div style={{
          padding: '16px 20px',
          background: 'rgba(123, 94, 167, 0.05)',
          border: '1px solid rgba(123, 94, 167, 0.18)',
          borderRadius: '10px',
          marginBottom: '48px',
          fontFamily: 'DM Mono, monospace',
          fontSize: '0.6rem',
          color: C.textMuted,
          lineHeight: 1.7,
          letterSpacing: '0.04em',
        }}>
          Gavel is built on the principle that your bids should never be visible to anyone — including us. This policy explains what limited data we do collect and exactly what we do with it.
        </div>

        {/* Section 01: What We Collect */}
        <PrivacySection n="01" title="What We Collect">
          <BodyText>
            Gavel collects only the minimum data required to operate the platform. We do not collect your name, email address, or any off-chain personal information unless you voluntarily provide it in a support request.
          </BodyText>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {COLLECTED.map(item => (
              <div key={item.label} style={{
                padding: '16px 18px',
                background: C.card,
                border: `1px solid ${C.border}`,
                borderRadius: '9px',
              }}>
                <div style={{
                  fontFamily: 'DM Mono, monospace',
                  fontSize: '0.6rem',
                  color: C.purpleLight,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom: '8px',
                }}>
                  {item.label}
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '80px 1fr',
                  gap: '8px 14px',
                }}>
                  <span style={{
                    fontFamily: 'DM Mono, monospace', fontSize: '0.55rem',
                    color: C.textDark, letterSpacing: '0.12em', textTransform: 'uppercase',
                    paddingTop: '1px',
                  }}>
                    Why
                  </span>
                  <span style={{
                    fontFamily: 'DM Mono, monospace', fontSize: '0.6rem',
                    color: C.textMuted, lineHeight: 1.65, letterSpacing: '0.04em',
                  }}>
                    {item.why}
                  </span>
                  <span style={{
                    fontFamily: 'DM Mono, monospace', fontSize: '0.55rem',
                    color: C.textDark, letterSpacing: '0.12em', textTransform: 'uppercase',
                    paddingTop: '1px',
                  }}>
                    How
                  </span>
                  <span style={{
                    fontFamily: 'DM Mono, monospace', fontSize: '0.6rem',
                    color: C.textMuted, lineHeight: 1.65, letterSpacing: '0.04em',
                  }}>
                    {item.how}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </PrivacySection>

        {/* Section 02: How It's Stored */}
        <PrivacySection n="02" title="How It's Stored">
          <BodyText>
            All data stored by Gavel is encrypted at rest using AES-256. Bid amounts are <span style={{ color: C.purpleLight }}>never stored</span> by Gavel — only Arcium-encrypted commitments exist on our infrastructure.
          </BodyText>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              'We do not sell, rent, or share your data with third parties for marketing or commercial purposes.',
              "Arcium's MPC nodes receive encrypted bid shares during processing but cannot reconstruct individual bid amounts.",
              'Wallet addresses and auction participation records are retained for 3 years for legal compliance. IP logs are retained for 90 days.',
              'All data in transit is encrypted using TLS 1.3.',
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{
                  width: '5px', height: '5px', borderRadius: '50%',
                  background: C.purple, flexShrink: 0, marginTop: '8px',
                }} />
                <p style={{
                  fontFamily: 'DM Mono, monospace', fontSize: '0.62rem',
                  color: C.textMuted, lineHeight: 1.7, letterSpacing: '0.04em',
                }}>
                  {item}
                </p>
              </div>
            ))}
          </div>
        </PrivacySection>

        {/* Section 03: Cookies */}
        <PrivacySection n="03" title="Cookies">
          <BodyText>
            Gavel uses only essential session cookies required for wallet authentication. We do not use advertising cookies, tracking pixels, or third-party analytics. You can disable cookies in your browser settings, though this may affect wallet connectivity.
          </BodyText>
        </PrivacySection>

        {/* Section 04: GDPR */}
        <PrivacySection n="04" title="Your Rights (GDPR)">
          <BodyText>
            If you are located in the European Economic Area (EEA) or United Kingdom, you have the following rights with respect to your personal data:
          </BodyText>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {GDPR_RIGHTS.map(r => (
              <div key={r.label} style={{
                padding: '14px 16px',
                background: C.card,
                border: `1px solid ${C.border}`,
                borderRadius: '8px',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start',
              }}>
                <div style={{
                  fontFamily: 'DM Mono, monospace', fontSize: '0.58rem',
                  color: C.purpleLight, letterSpacing: '0.08em',
                  textTransform: 'uppercase', flexShrink: 0,
                  minWidth: '130px', paddingTop: '1px',
                }}>
                  {r.label}
                </div>
                <p style={{
                  fontFamily: 'DM Mono, monospace', fontSize: '0.6rem',
                  color: C.textMuted, lineHeight: 1.7, letterSpacing: '0.04em',
                }}>
                  {r.body}
                </p>
              </div>
            ))}
          </div>
          <p style={{
            fontFamily: 'DM Mono, monospace', fontSize: '0.6rem',
            color: C.textDark, lineHeight: 1.7, letterSpacing: '0.04em',
            marginTop: '16px',
          }}>
            To exercise any of these rights, email{' '}
            <span style={{ color: C.purpleLight }}>privacy@gavel.gg</span>.
            We will respond within 30 days.
          </p>
        </PrivacySection>

        {/* Section 05: Changes */}
        <PrivacySection n="05" title="Changes to This Policy">
          <BodyText>
            We may update this Privacy Policy from time to time. The date at the top of this page reflects the most recent revision. Continued use of Gavel after changes are posted constitutes acceptance of the revised Policy.
          </BodyText>
        </PrivacySection>

        {/* Contact */}
        <div style={{
          padding: '20px 22px',
          background: 'rgba(123, 94, 167, 0.05)',
          border: '1px solid rgba(123, 94, 167, 0.18)',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
              stroke="#9B7EC8" strokeWidth="1.8"/>
            <polyline points="22,6 12,13 2,6" stroke="#9B7EC8" strokeWidth="1.8"/>
          </svg>
          <div>
            <div style={{
              fontFamily: 'DM Mono, monospace', fontSize: '0.52rem',
              color: C.textDark, letterSpacing: '0.2em',
              textTransform: 'uppercase', marginBottom: '5px',
            }}>
              Privacy Contact
            </div>
            <p style={{
              fontFamily: 'DM Mono, monospace', fontSize: '0.62rem',
              color: C.textMuted, lineHeight: 1.65, letterSpacing: '0.04em',
            }}>
              For privacy inquiries or data requests:{' '}
              <span style={{ color: C.purpleLight }}>privacy@gavel.gg</span>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
