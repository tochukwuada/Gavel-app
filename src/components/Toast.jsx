import { useState, useEffect } from 'react';

const TYPE = {
  success: { border: 'rgba(126,200,156,0.45)', accent: '#7ec89c', bg: 'rgba(126,200,156,0.05)' },
  warning: { border: 'rgba(212,168,68,0.45)',  accent: '#d4a844', bg: 'rgba(212,168,68,0.05)' },
  outbid:  { border: 'rgba(224,124,124,0.45)', accent: '#e07c7c', bg: 'rgba(224,124,124,0.05)' },
  info:    { border: 'rgba(155,126,200,0.4)',  accent: '#9B7EC8', bg: 'rgba(123,94,167,0.07)' },
};

export function showToast(message, type = 'info', detail = null, duration = 4200) {
  window.dispatchEvent(new CustomEvent('gavel:toast', {
    detail: { id: Date.now() + Math.random(), message, type, detail, duration },
  }));
}

function Toast({ toast, onDismiss }) {
  const [visible, setVisible] = useState(false);
  const s = TYPE[toast.type] || TYPE.info;

  useEffect(() => {
    let innerT;
    const raf = requestAnimationFrame(() => setVisible(true));
    const t = setTimeout(() => {
      setVisible(false);
      innerT = setTimeout(() => onDismiss(toast.id), 320);
    }, toast.duration);
    return () => { cancelAnimationFrame(raf); clearTimeout(t); clearTimeout(innerT); };
  }, []);

  return (
    <div
      onClick={() => { setVisible(false); setTimeout(() => onDismiss(toast.id), 320); }}
      style={{
        background: 'linear-gradient(135deg, #0f0b1c, #0c0a14)',
        border: `1px solid ${s.border}`,
        borderLeft: `3px solid ${s.accent}`,
        borderRadius: '10px',
        padding: '14px 16px',
        minWidth: '280px',
        maxWidth: '360px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.025)',
        transform: visible ? 'translateX(0)' : 'translateX(calc(100% + 28px))',
        opacity: visible ? 1 : 0,
        transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1), opacity 0.3s ease',
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-start',
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      <div style={{
        width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0, marginTop: '1px',
        background: s.bg, border: `1px solid ${s.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.75rem', color: s.accent, fontFamily: 'DM Mono, monospace',
      }}>
        {toast.type === 'success' ? '✓' : toast.type === 'warning' ? '⚠' : toast.type === 'outbid' ? '↑' : '◉'}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: 'DM Mono, monospace', fontSize: '0.62rem',
          letterSpacing: '0.08em', color: '#e8e4f0',
          marginBottom: toast.detail ? '3px' : 0,
        }}>
          {toast.message}
        </div>
        {toast.detail && (
          <div style={{
            fontFamily: 'DM Mono, monospace', fontSize: '0.56rem',
            color: '#9589aa', letterSpacing: '0.04em', lineHeight: 1.55,
          }}>
            {toast.detail}
          </div>
        )}
      </div>
    </div>
  );
}

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handler = (e) => setToasts(prev => [...prev, e.detail]);
    window.addEventListener('gavel:toast', handler);
    return () => window.removeEventListener('gavel:toast', handler);
  }, []);

  const dismiss = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  if (!toasts.length) return null;

  return (
    <div style={{
      position: 'fixed', bottom: '24px', right: '24px',
      zIndex: 9999, display: 'flex', flexDirection: 'column',
      gap: '8px', pointerEvents: 'none',
    }}>
      {toasts.map(t => (
        <div key={t.id} style={{ pointerEvents: 'auto' }}>
          <Toast toast={t} onDismiss={dismiss} />
        </div>
      ))}
    </div>
  );
}
