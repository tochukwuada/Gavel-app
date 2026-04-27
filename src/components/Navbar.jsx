import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useIsMobile } from '../hooks/useIsMobile';
import { useWatchlist } from '../hooks/useWatchlist';
import { useNotifications, useNotificationChecker } from '../hooks/useNotifications';
import { addAuction } from '../data/auctions';

const C = {
  bg: 'rgba(5, 5, 7, 0.88)',
  border: 'rgba(123, 94, 167, 0.15)',
  purple: '#7B5EA7',
  purpleLight: '#9B7EC8',
  text: '#e8e4f0',
  textMuted: '#6b5f80',
  textDark: '#4e4660',
  card: '#0c0a14',
};

function truncate(pk) {
  const s = pk.toString();
  return `${s.slice(0, 4)}…${s.slice(-4)}`;
}

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}d ago`;
  if (h > 0) return `${h}h ago`;
  if (m > 0) return `${m}m ago`;
  return 'just now';
}

const BLANK_FORM = {
  name: '', description: '', auctionType: 'vickrey',
  minBid: '', reservePrice: '', durationHours: '', icon: '',
  authDocName: '', authAuthority: '', authType: 'Physical Item', authContract: '',
};

const AUTH_TYPES = ['Physical Item', 'Digital Asset', 'NFT', 'Real Estate', 'Financial Instrument'];

function CreateModal({ onClose }) {
  const [form, setForm] = useState(BLANK_FORM);
  const [typeHover, setTypeHover] = useState(null);
  const [submitHover, setSubmitHover] = useState(false);
  const [focused, setFocused] = useState(null);

  const valid = form.name.trim() && parseFloat(form.minBid) > 0 && parseFloat(form.durationHours) > 0;

  const handleSubmit = () => {
    if (!valid) return;
    addAuction(form);
    onClose();
  };

  const field = (key, label, placeholder, type = 'text') => (
    <div style={{ marginBottom: '18px' }}>
      <label style={{
        display: 'block', fontFamily: 'DM Mono, monospace',
        fontSize: '0.55rem', letterSpacing: '0.2em', textTransform: 'uppercase',
        color: C.textDark, marginBottom: '8px',
      }}>
        {label}
      </label>
      <input
        type={type} placeholder={placeholder} value={form[key]}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        onFocus={() => setFocused(key)} onBlur={() => setFocused(null)}
        min={type === 'number' ? '0' : undefined}
        step={type === 'number' ? 'any' : undefined}
        style={{
          width: '100%', background: 'rgba(5, 5, 7, 0.8)',
          border: `1px solid ${focused === key ? C.purple : 'rgba(123, 94, 167, 0.2)'}`,
          borderRadius: '8px', outline: 'none',
          fontFamily: 'DM Mono, monospace', fontSize: '0.75rem',
          color: C.text, padding: '12px 14px', letterSpacing: '0.04em',
          transition: 'border-color 0.2s', boxSizing: 'border-box',
          boxShadow: focused === key ? '0 0 0 3px rgba(123, 94, 167, 0.1)' : 'none',
        }}
      />
    </div>
  );

  return createPortal(
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(5, 5, 7, 0.88)',
        backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: C.card, border: '1px solid rgba(123, 94, 167, 0.25)',
        borderRadius: '18px', padding: '36px 40px',
        width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto',
        position: 'relative',
      }}>
        <div style={{ marginBottom: '28px', paddingBottom: '20px', borderBottom: '1px solid rgba(123, 94, 167, 0.1)' }}>
          <div style={{
            fontFamily: 'DM Mono, monospace', fontSize: '0.55rem',
            letterSpacing: '0.24em', textTransform: 'uppercase', color: C.purple, marginBottom: '8px',
          }}>
            New Listing
          </div>
          <h2 style={{
            fontFamily: 'Cormorant Garamond, serif', fontSize: '1.8rem',
            fontWeight: 600, color: C.text, letterSpacing: '0.04em', lineHeight: 1.1,
          }}>
            Create Auction
          </h2>
        </div>

        {field('name', 'Item Name *', 'e.g. Rolex Daytona Ref. 6263')}
        {field('description', 'Description', 'Provenance, condition, edition info...')}

        <div style={{ marginBottom: '18px' }}>
          <div style={{
            fontFamily: 'DM Mono, monospace', fontSize: '0.55rem',
            letterSpacing: '0.2em', textTransform: 'uppercase', color: C.textDark, marginBottom: '8px',
          }}>
            Auction Type
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {[{ key: 'first-price', label: 'First-Price' }, { key: 'vickrey', label: 'Vickrey' }].map(t => (
              <button
                key={t.key}
                onClick={() => setForm(f => ({ ...f, auctionType: t.key }))}
                onMouseEnter={() => setTypeHover(t.key)}
                onMouseLeave={() => setTypeHover(null)}
                style={{
                  fontFamily: 'DM Mono, monospace', fontSize: '0.62rem',
                  letterSpacing: '0.1em', textTransform: 'uppercase', padding: '10px 8px',
                  background: form.auctionType === t.key
                    ? 'rgba(123, 94, 167, 0.2)'
                    : typeHover === t.key ? 'rgba(123, 94, 167, 0.07)' : 'transparent',
                  color: form.auctionType === t.key ? C.purpleLight : C.textMuted,
                  border: `1px solid ${form.auctionType === t.key ? C.purple : 'rgba(123, 94, 167, 0.14)'}`,
                  borderRadius: '7px', cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          {[
            { key: 'minBid', label: 'Min Bid (SOL) *', suffix: '◎', suffixColor: C.purple },
            { key: 'reservePrice', label: 'Reserve (SOL)', suffix: '◎', suffixColor: C.textDark },
            { key: 'durationHours', label: 'Duration (hours) *', suffix: 'h', suffixColor: C.textDark },
          ].map(({ key, label, suffix, suffixColor }) => (
            <div key={key}>
              <label style={{
                display: 'block', fontFamily: 'DM Mono, monospace',
                fontSize: '0.55rem', letterSpacing: '0.2em', textTransform: 'uppercase',
                color: C.textDark, marginBottom: '8px',
              }}>
                {label}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number" min="0" step="any"
                  placeholder={key === 'durationHours' ? '24' : '0.00'}
                  value={form[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  onFocus={() => setFocused(key)} onBlur={() => setFocused(null)}
                  style={{
                    width: '100%', background: 'rgba(5, 5, 7, 0.8)',
                    border: `1px solid ${focused === key ? C.purple : 'rgba(123, 94, 167, 0.2)'}`,
                    borderRadius: '8px', outline: 'none',
                    fontFamily: 'DM Mono, monospace', fontSize: '0.75rem',
                    color: C.text, padding: '12px 36px 12px 14px',
                    letterSpacing: '0.04em', transition: 'border-color 0.2s', boxSizing: 'border-box',
                  }}
                />
                <span style={{
                  position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                  fontFamily: 'DM Mono, monospace', fontSize: '0.65rem',
                  color: suffixColor, pointerEvents: 'none',
                }}>
                  {suffix}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '6px', marginBottom: '24px' }}>
          <label style={{
            display: 'block', fontFamily: 'DM Mono, monospace',
            fontSize: '0.55rem', letterSpacing: '0.2em', textTransform: 'uppercase',
            color: C.textDark, marginBottom: '8px', marginTop: '18px',
          }}>
            Icon (emoji)
          </label>
          <input
            type="text" placeholder="🏺" value={form.icon}
            onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
            onFocus={() => setFocused('icon')} onBlur={() => setFocused(null)}
            style={{
              width: '100%', background: 'rgba(5, 5, 7, 0.8)',
              border: `1px solid ${focused === 'icon' ? C.purple : 'rgba(123, 94, 167, 0.2)'}`,
              borderRadius: '8px', outline: 'none',
              fontFamily: 'DM Mono, monospace', fontSize: '1.2rem',
              color: C.text, padding: '10px 14px', letterSpacing: '0.04em',
              transition: 'border-color 0.2s', boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Authenticity section */}
        <div style={{ borderTop: '1px solid rgba(123, 94, 167, 0.12)', paddingTop: '22px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L3 7V12C3 16.55 6.84 20.74 12 22C17.16 20.74 21 16.55 21 12V7L12 2Z"
                stroke="#9B7EC8" strokeWidth="1.8" strokeLinejoin="round"/>
              <path d="M8.5 12L11 14.5L15.5 10" stroke="#9B7EC8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div>
              <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.6rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: C.purpleLight }}>
                Authenticity Verification
              </div>
              <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.55rem', color: C.textDark, letterSpacing: '0.04em', marginTop: '2px' }}>
                Optional — submit docs to earn a Verified badge
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontFamily: 'DM Mono, monospace', fontSize: '0.55rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: C.textDark, marginBottom: '8px' }}>
              Verification Type
            </label>
            <select
              value={form.authType}
              onChange={e => setForm(f => ({ ...f, authType: e.target.value }))}
              style={{
                width: '100%', background: 'rgba(5, 5, 7, 0.8)',
                border: '1px solid rgba(123, 94, 167, 0.2)', borderRadius: '8px', outline: 'none',
                fontFamily: 'DM Mono, monospace', fontSize: '0.72rem',
                color: C.text, padding: '11px 14px', letterSpacing: '0.04em',
                boxSizing: 'border-box', cursor: 'pointer',
              }}
            >
              {AUTH_TYPES.map(t => <option key={t} value={t} style={{ background: '#0c0a14' }}>{t}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontFamily: 'DM Mono, monospace', fontSize: '0.55rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: C.textDark, marginBottom: '8px' }}>
              Issuing Authority
            </label>
            <input
              type="text" placeholder="e.g. Christie's, GIA, Sotheby's"
              value={form.authAuthority}
              onChange={e => setForm(f => ({ ...f, authAuthority: e.target.value }))}
              onFocus={() => setFocused('authAuthority')} onBlur={() => setFocused(null)}
              style={{
                width: '100%', background: 'rgba(5, 5, 7, 0.8)',
                border: `1px solid ${focused === 'authAuthority' ? C.purple : 'rgba(123, 94, 167, 0.2)'}`,
                borderRadius: '8px', outline: 'none',
                fontFamily: 'DM Mono, monospace', fontSize: '0.72rem',
                color: C.text, padding: '11px 14px', letterSpacing: '0.04em',
                transition: 'border-color 0.2s', boxSizing: 'border-box',
                boxShadow: focused === 'authAuthority' ? '0 0 0 3px rgba(123, 94, 167, 0.1)' : 'none',
              }}
            />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontFamily: 'DM Mono, monospace', fontSize: '0.55rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: C.textDark, marginBottom: '8px' }}>
              Proof of Ownership / Certificate of Authenticity
            </label>
            <label style={{
              display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px',
              background: 'rgba(5, 5, 7, 0.8)',
              border: `1px solid ${form.authDocName ? 'rgba(126, 200, 156, 0.3)' : 'rgba(123, 94, 167, 0.2)'}`,
              borderRadius: '8px', cursor: 'pointer', transition: 'border-color 0.2s',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke={form.authDocName ? '#7ec89c' : C.textDark} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="17 8 12 3 7 8" stroke={form.authDocName ? '#7ec89c' : C.textDark} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="12" y1="3" x2="12" y2="15" stroke={form.authDocName ? '#7ec89c' : C.textDark} strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
              <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.65rem', color: form.authDocName ? '#7ec89c' : C.textDark, letterSpacing: '0.04em', flex: 1 }}>
                {form.authDocName || 'Upload PDF, JPG, or PNG'}
              </span>
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }}
                onChange={e => { const f = e.target.files?.[0]; if (f) setForm(prev => ({ ...prev, authDocName: f.name })); }}
              />
            </label>
          </div>

          <div>
            <label style={{ display: 'block', fontFamily: 'DM Mono, monospace', fontSize: '0.55rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: C.textDark, marginBottom: '8px' }}>
              Smart Contract Address <span style={{ color: C.textDark, textTransform: 'none', letterSpacing: 0 }}>— optional</span>
            </label>
            <input
              type="text" placeholder="e.g. 7xKX...q8mT (on-chain assets)"
              value={form.authContract}
              onChange={e => setForm(f => ({ ...f, authContract: e.target.value }))}
              onFocus={() => setFocused('authContract')} onBlur={() => setFocused(null)}
              style={{
                width: '100%', background: 'rgba(5, 5, 7, 0.8)',
                border: `1px solid ${focused === 'authContract' ? C.purple : 'rgba(123, 94, 167, 0.2)'}`,
                borderRadius: '8px', outline: 'none',
                fontFamily: 'DM Mono, monospace', fontSize: '0.72rem',
                color: C.text, padding: '11px 14px', letterSpacing: '0.04em',
                transition: 'border-color 0.2s', boxSizing: 'border-box',
                boxShadow: focused === 'authContract' ? '0 0 0 3px rgba(123, 94, 167, 0.1)' : 'none',
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, fontFamily: 'DM Mono, monospace', fontSize: '0.65rem',
              letterSpacing: '0.14em', textTransform: 'uppercase', padding: '13px',
              background: 'transparent', color: C.textMuted,
              border: '1px solid rgba(123, 94, 167, 0.18)', borderRadius: '8px', cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit} disabled={!valid}
            onMouseEnter={() => setSubmitHover(true)} onMouseLeave={() => setSubmitHover(false)}
            style={{
              flex: 2, fontFamily: 'DM Mono, monospace', fontSize: '0.65rem',
              letterSpacing: '0.14em', textTransform: 'uppercase', padding: '13px',
              background: !valid
                ? 'rgba(123, 94, 167, 0.12)'
                : submitHover ? 'linear-gradient(135deg, #9B7EC8, #7B5EA7)' : 'linear-gradient(135deg, #7B5EA7, #5a3f8a)',
              color: !valid ? C.textDark : '#fff',
              border: 'none', borderRadius: '8px',
              cursor: valid ? 'pointer' : 'not-allowed', transition: 'all 0.25s',
              boxShadow: valid && submitHover ? '0 8px 28px rgba(123, 94, 167, 0.4)' : 'none',
            }}
          >
            Create Auction
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function NotifDropdown({ log, onMarkAll, onClear, onClose, onNavigate, isMobile }) {
  return createPortal(
    <>
      {/* backdrop */}
      <div
        style={{ position: 'fixed', inset: 0, zIndex: 400 }}
        onClick={onClose}
      />
      {/* panel */}
      <div style={{
        position: 'fixed',
        top: '68px',
        right: isMobile ? '12px' : '48px',
        zIndex: 401,
        background: '#0c0a14',
        border: '1px solid rgba(123, 94, 167, 0.28)',
        borderRadius: '14px',
        width: '340px',
        maxHeight: '420px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 24px 64px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.02)',
        overflow: 'hidden',
        animation: 'fadeInUp 0.2s ease both',
      }}>
        {/* header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 18px',
          borderBottom: '1px solid rgba(123, 94, 167, 0.12)',
          background: 'rgba(123, 94, 167, 0.04)',
          flexShrink: 0,
        }}>
          <span style={{
            fontFamily: 'DM Mono, monospace', fontSize: '0.58rem',
            letterSpacing: '0.18em', textTransform: 'uppercase', color: '#9B7EC8',
          }}>
            Notifications
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            {log.length > 0 && (
              <>
                <button
                  onClick={onMarkAll}
                  style={{
                    fontFamily: 'DM Mono, monospace', fontSize: '0.52rem',
                    letterSpacing: '0.08em', color: '#4e4660',
                    background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px',
                    transition: 'color 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = '#9589aa'}
                  onMouseLeave={e => e.currentTarget.style.color = '#4e4660'}
                >
                  Mark all read
                </button>
                <button
                  onClick={onClear}
                  style={{
                    fontFamily: 'DM Mono, monospace', fontSize: '0.52rem',
                    letterSpacing: '0.08em', color: '#4e4660',
                    background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px',
                    transition: 'color 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = '#e07c7c'}
                  onMouseLeave={e => e.currentTarget.style.color = '#4e4660'}
                >
                  Clear
                </button>
              </>
            )}
          </div>
        </div>

        {/* list */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {log.length === 0 ? (
            <div style={{
              padding: '40px 20px', textAlign: 'center',
            }}>
              <div style={{ fontSize: '1.6rem', marginBottom: '10px', opacity: 0.3 }}>🔔</div>
              <p style={{
                fontFamily: 'DM Mono, monospace', fontSize: '0.6rem',
                color: '#4e4660', letterSpacing: '0.06em',
              }}>
                No notifications yet
              </p>
            </div>
          ) : (
            log.map((n, i) => (
              <div
                key={n.id}
                onClick={() => { onNavigate(n.auctionId); onClose(); }}
                style={{
                  padding: '13px 18px',
                  borderBottom: i < log.length - 1 ? '1px solid rgba(123, 94, 167, 0.07)' : 'none',
                  background: n.read ? 'transparent' : 'rgba(123, 94, 167, 0.05)',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'flex-start', gap: '10px',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(123, 94, 167, 0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = n.read ? 'transparent' : 'rgba(123, 94, 167, 0.05)'; }}
              >
                {!n.read && (
                  <div style={{
                    width: '6px', height: '6px', borderRadius: '50%',
                    background: '#9B7EC8', flexShrink: 0, marginTop: '5px',
                  }} />
                )}
                <div style={{ flex: 1, minWidth: 0, paddingLeft: n.read ? '16px' : '0' }}>
                  <p style={{
                    fontFamily: 'DM Mono, monospace', fontSize: '0.6rem',
                    color: n.read ? '#6b5f80' : '#e8e4f0',
                    letterSpacing: '0.03em', lineHeight: 1.5,
                    margin: 0, marginBottom: '3px',
                  }}>
                    {n.message}
                  </p>
                  <span style={{
                    fontFamily: 'DM Mono, monospace', fontSize: '0.52rem',
                    color: '#4e4660', letterSpacing: '0.06em',
                  }}>
                    {timeAgo(n.timestamp)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>,
    document.body
  );
}

export default function Navbar() {
  const navigate = useNavigate();
  const { connected, publicKey, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  const [hovered, setHovered] = useState(false);
  const [createHover, setCreateHover] = useState(false);
  const [watchHover, setWatchHover] = useState(false);
  const [bellHover, setBellHover] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const isMobile = useIsMobile(640);

  const { watchlist } = useWatchlist();
  const { log, unreadCount, markAllRead, clearAll } = useNotifications();
  useNotificationChecker(watchlist);

  const watchCount = watchlist.length;

  const handleWalletClick = () => {
    if (connected) disconnect();
    else setVisible(true);
  };

  const handleBellClick = () => {
    setBellOpen(o => !o);
  };

  const btnLabel = connected && publicKey
    ? (hovered ? 'Disconnect' : truncate(publicKey))
    : 'Connect Wallet';

  const btnStyle = {
    fontFamily: 'DM Mono, monospace', fontSize: '0.62rem',
    letterSpacing: '0.14em', textTransform: 'uppercase',
    padding: '8px 20px', borderRadius: '5px', cursor: 'pointer', transition: 'all 0.25s',
    ...(connected
      ? {
          background: hovered ? 'rgba(224, 124, 124, 0.15)' : 'rgba(123, 94, 167, 0.12)',
          color: hovered ? '#e07c7c' : C.purpleLight,
          border: `1px solid ${hovered ? 'rgba(224, 124, 124, 0.35)' : 'rgba(155, 126, 200, 0.3)'}`,
        }
      : {
          background: hovered ? 'linear-gradient(135deg, #9B7EC8, #7B5EA7)' : 'transparent',
          color: hovered ? '#fff' : C.purpleLight,
          border: `1px solid ${hovered ? 'transparent' : 'rgba(155, 126, 200, 0.35)'}`,
        }),
  };

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        height: '64px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        padding: isMobile ? '0 16px' : '0 48px',
        background: C.bg,
        backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
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
            fontFamily: 'Cormorant Garamond, serif', fontSize: '1.6rem', fontWeight: 600,
            color: C.text, letterSpacing: '0.2em', textTransform: 'uppercase', lineHeight: 1,
          }}>
            Gavel
          </span>
        </Link>

        {/* Centre badge */}
        <div style={{
          position: 'absolute', left: '50%', transform: 'translateX(-50%)',
          display: isMobile ? 'none' : 'flex', alignItems: 'center', gap: '8px',
          fontFamily: 'DM Mono, monospace', fontSize: '0.6rem', color: C.textMuted,
          letterSpacing: '0.18em', textTransform: 'uppercase', pointerEvents: 'none',
        }}>
          <span style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: C.purpleLight, animation: 'pulse 2s infinite',
          }} />
          Arcium MPC · Live
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* Watchlist with count badge */}
          {!isMobile && (
            <button
              onClick={() => navigate('/watchlist')}
              onMouseEnter={() => setWatchHover(true)}
              onMouseLeave={() => setWatchHover(false)}
              style={{
                fontFamily: 'DM Mono, monospace', fontSize: '0.6rem',
                letterSpacing: '0.14em', textTransform: 'uppercase',
                padding: '8px 14px', borderRadius: '5px', cursor: 'pointer',
                background: 'transparent',
                color: watchHover ? C.purpleLight : C.textMuted,
                border: `1px solid ${watchHover ? 'rgba(155, 126, 200, 0.25)' : 'transparent'}`,
                transition: 'all 0.25s',
                display: 'flex', alignItems: 'center', gap: '6px',
                position: 'relative',
              }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill={watchHover ? C.purpleLight : 'none'}>
                <path d="M5 3h14a1 1 0 011 1v17l-8-4-8 4V4a1 1 0 011-1z"
                  stroke={watchHover ? C.purpleLight : C.textMuted}
                  strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
              Watchlist
              {watchCount > 0 && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  minWidth: '16px', height: '16px',
                  padding: '0 4px',
                  background: 'linear-gradient(135deg, #7B5EA7, #5a3f8a)',
                  borderRadius: '8px',
                  fontFamily: 'DM Mono, monospace', fontSize: '0.48rem',
                  color: '#fff', letterSpacing: '0',
                  fontWeight: 500,
                }}>
                  {watchCount}
                </span>
              )}
            </button>
          )}

          {/* Create */}
          {!isMobile && (
            <button
              onClick={() => setModalOpen(true)}
              onMouseEnter={() => setCreateHover(true)}
              onMouseLeave={() => setCreateHover(false)}
              style={{
                fontFamily: 'DM Mono, monospace', fontSize: '0.6rem',
                letterSpacing: '0.14em', textTransform: 'uppercase',
                padding: '8px 16px', borderRadius: '5px', cursor: 'pointer',
                background: createHover ? 'rgba(123, 94, 167, 0.15)' : 'transparent',
                color: createHover ? C.purpleLight : C.textMuted,
                border: `1px solid ${createHover ? 'rgba(155, 126, 200, 0.3)' : 'rgba(123, 94, 167, 0.18)'}`,
                transition: 'all 0.25s',
                display: 'flex', alignItems: 'center', gap: '5px',
              }}
            >
              <span style={{ fontSize: '0.75rem', lineHeight: 1 }}>+</span>
              Create
            </button>
          )}

          {/* Notification bell */}
          <button
            onClick={handleBellClick}
            onMouseEnter={() => setBellHover(true)}
            onMouseLeave={() => setBellHover(false)}
            style={{
              position: 'relative',
              background: bellOpen ? 'rgba(123, 94, 167, 0.12)' : 'transparent',
              border: `1px solid ${bellOpen || bellHover ? 'rgba(155, 126, 200, 0.25)' : 'transparent'}`,
              borderRadius: '5px', cursor: 'pointer',
              padding: '8px 10px', lineHeight: 0,
              transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            title="Notifications"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"
                stroke={bellOpen || bellHover ? C.purpleLight : C.textMuted}
                strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M13.73 21a2 2 0 01-3.46 0"
                stroke={bellOpen || bellHover ? C.purpleLight : C.textMuted}
                strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: '4px', right: '4px',
                minWidth: '14px', height: '14px',
                background: '#e07c7c',
                borderRadius: '7px',
                fontFamily: 'DM Mono, monospace', fontSize: '0.44rem',
                color: '#fff', fontWeight: 600,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '0 3px',
                border: '1.5px solid rgba(5, 5, 7, 0.88)',
              }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Wallet */}
          <button
            style={btnStyle}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={handleWalletClick}
          >
            {connected && (
              <span style={{
                display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%',
                background: hovered ? '#e07c7c' : '#7ec89c',
                marginRight: '8px', verticalAlign: 'middle', transition: 'background 0.25s',
              }} />
            )}
            {btnLabel}
          </button>
        </div>
      </nav>

      {modalOpen && <CreateModal onClose={() => setModalOpen(false)} />}

      {bellOpen && (
        <NotifDropdown
          log={log}
          onMarkAll={() => { markAllRead(); }}
          onClear={() => { clearAll(); }}
          onClose={() => setBellOpen(false)}
          onNavigate={(auctionId) => { markAllRead(); navigate(`/auction/${auctionId}`); }}
          isMobile={isMobile}
        />
      )}
    </>
  );
}
