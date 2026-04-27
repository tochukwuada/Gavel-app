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

const SECTIONS = [
  {
    n: '01',
    title: 'Acceptance of Terms',
    body: 'By connecting your wallet and using Gavel, you agree to be bound by these Terms of Service. If you do not agree with any part of these Terms, you must not use the platform. Use of Gavel constitutes acceptance, regardless of whether you have read these Terms in full.',
    items: null,
  },
  {
    n: '02',
    title: 'Who Is Responsible',
    body: 'Gavel, sellers, and bidders each carry distinct responsibilities on the platform.',
    items: [
      { label: 'Gavel', body: 'Operating the bidding infrastructure, transmitting bids to Arcium MPC, displaying auction results, and facilitating settlement.' },
      { label: 'Sellers', body: 'The accuracy of item descriptions, delivering items to winning bidders within the agreed timeframe, and complying with all applicable export, import, and tax laws.' },
      { label: 'Bidders', body: 'The accuracy of their wallet address, having sufficient funds to complete a winning purchase, paying winning bids within the settlement window, and complying with these Terms.' },
    ],
  },
  {
    n: '03',
    title: 'Auction Rules Enforcement',
    body: 'Gavel reserves the right to cancel or void any auction or bid at its sole discretion, including in cases where fraud, technical error, manipulation, or abuse is suspected. All participants agree that Gavel\'s decisions regarding auction validity and outcomes are final and binding. No compensation will be issued for cancelled auctions unless Gavel determines the error was caused by a platform fault.',
    items: null,
  },
  {
    n: '04',
    title: 'Prohibited Activities',
    body: 'The following activities are strictly prohibited and may result in permanent account suspension and legal action:',
    items: [
      { label: 'Bid manipulation', body: 'Submitting false, collusive, or shill bids to artificially influence auction outcomes.' },
      { label: 'Automation', body: 'Using bots, scripts, or automated tools to interact with the platform.' },
      { label: 'Protocol tampering', body: "Attempting to reverse-engineer, circumvent, or exploit Gavel's encryption or MPC protocol." },
      { label: 'Identity fraud', body: 'Impersonating another wallet address or attempting to deceive other participants.' },
    ],
  },
  {
    n: '05',
    title: 'What Happens If Something Goes Wrong',
    body: 'Technical failures are rare but possible. This section describes how Gavel responds.',
    items: [
      { label: 'Bid submission failure', body: 'If a technical fault prevents a bid from being submitted, Gavel will notify affected bidders and, where possible, extend the auction window.' },
      { label: 'Settlement failure', body: 'If settlement cannot be completed due to a technical fault, affected parties will be notified within 48 hours and a resolution will be offered.' },
      { label: 'Network issues', body: 'Gavel is not liable for losses arising from Solana network outages, blockchain congestion, wallet connectivity issues, or Arcium MPC downtime outside of Gavel\'s direct control.' },
    ],
  },
  {
    n: '06',
    title: 'Limitation of Liability',
    body: 'To the maximum extent permitted by applicable law, Gavel\'s total aggregate liability to any user shall not exceed the total platform fees paid by that user in the three months preceding the claim. Gavel is not liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits or data, even if Gavel has been advised of the possibility of such damages.',
    items: null,
  },
  {
    n: '07',
    title: 'Governing Law',
    body: 'These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to conflict of law principles. Any dispute arising from or relating to these Terms or use of the platform shall be resolved by binding arbitration under the rules of the American Arbitration Association, with proceedings conducted in English.',
    items: null,
  },
  {
    n: '08',
    title: 'Auction Rules',
    body: 'All auctions on Gavel are governed by the following binding rules:',
    items: [
      {
        label: 'Minimum bid increment',
        body: 'Each bid must be at least 1 SOL above the auction\'s configured minimum bid to ensure meaningful competition. Bids below this threshold are rejected at submission.',
      },
      {
        label: 'Reserve price',
        body: 'Sellers may set a confidential reserve price. If the highest bid at close does not meet the reserve, the auction is declared unresolved and no settlement occurs. Whether the reserve has been met is displayed in real time on the auction listing.',
      },
      {
        label: 'Anti-sniping policy',
        body: 'To prevent last-second bid sniping, any bid placed within the final 5 minutes of an auction automatically extends the auction closing time by 5 minutes. This extension may occur multiple times with no upper limit, ensuring all participants have a fair window to respond.',
      },
      {
        label: 'Bid irrevocability',
        body: 'All bids are final and irrevocable once submitted. The cryptographic commitment is sealed to the Arcium MPC network immediately on submission. No cancellations, modifications, or withdrawals are permitted under any circumstances.',
      },
    ],
  },
  {
    n: '09',
    title: 'Changes to These Terms',
    body: 'Gavel may revise these Terms at any time by posting an updated version on this page. The revision date will be updated accordingly. Continued use of the platform after any changes constitutes acceptance of the revised Terms. We encourage you to review this page periodically.',
    items: null,
  },
];

function TermSection({ n, title, body, items }) {
  return (
    <div style={{
      marginBottom: '40px',
      paddingBottom: '40px',
      borderBottom: '1px solid rgba(123, 94, 167, 0.08)',
    }}>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
        <span style={{
          fontFamily: 'DM Mono, monospace',
          fontSize: '0.52rem',
          color: C.purple,
          letterSpacing: '0.2em',
          paddingTop: '6px',
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
            marginBottom: '12px',
          }}>
            {title}
          </h2>
          <p style={{
            fontFamily: 'DM Mono, monospace',
            fontSize: '0.62rem',
            color: C.textMuted,
            lineHeight: 1.8,
            letterSpacing: '0.04em',
            marginBottom: items ? '16px' : 0,
          }}>
            {body}
          </p>
          {items && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {items.map(item => (
                <div key={item.label} style={{
                  padding: '14px 16px',
                  background: C.card,
                  border: `1px solid ${C.border}`,
                  borderRadius: '8px',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start',
                }}>
                  <div style={{
                    fontFamily: 'DM Mono, monospace',
                    fontSize: '0.58rem',
                    color: C.purpleLight,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    flexShrink: 0,
                    minWidth: '100px',
                    paddingTop: '1px',
                  }}>
                    {item.label}
                  </div>
                  <p style={{
                    fontFamily: 'DM Mono, monospace',
                    fontSize: '0.6rem',
                    color: C.textMuted,
                    lineHeight: 1.7,
                    letterSpacing: '0.04em',
                  }}>
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TermsPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  return (
    <div style={{ background: C.bg, minHeight: '100vh', paddingTop: '64px', cursor: 'default' }}>
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
            Terms of Service
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
          Please read these Terms of Service carefully before using Gavel. By accessing or using the platform, you agree to be bound by these Terms and our Privacy Policy.
        </div>

        {/* Sections */}
        {SECTIONS.map(s => (
          <TermSection key={s.n} {...s} />
        ))}

        {/* Contact */}
        <div style={{
          padding: '20px 22px',
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: '10px',
          marginTop: '8px',
        }}>
          <div style={{
            fontFamily: 'DM Mono, monospace', fontSize: '0.52rem',
            color: C.textDark, letterSpacing: '0.2em',
            textTransform: 'uppercase', marginBottom: '8px',
          }}>
            Questions about these Terms?
          </div>
          <p style={{
            fontFamily: 'DM Mono, monospace', fontSize: '0.62rem',
            color: C.textMuted, lineHeight: 1.7, letterSpacing: '0.04em',
          }}>
            Contact us at{' '}
            <span style={{ color: C.purpleLight }}>support@gavel.gg</span>
            {' '}and we will respond within 5 business days.
          </p>
        </div>

      </div>
    </div>
  );
}
