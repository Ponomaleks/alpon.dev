import React, { useEffect } from 'react';
import { Icon } from '../brand/Icon.jsx';

export function Toast({ tone = 'success', message = 'Copied', meta, className = '' }) {
  const icon = tone === 'error' ? 'circle-alert' : tone === 'info' ? 'info' : 'check';
  return (
    <div className={`fj-toast fj-toast--${tone} ${className}`} role={tone === 'error' ? 'alert' : 'status'}>
      <Icon name={icon} size={18} />
      <span>{message}</span>
      {meta ? <span className="fj-toast__meta">{meta}</span> : null}
    </div>
  );
}

/** Fixed bottom-centre region. Pass toasts=[{id, tone, message, meta}] and onExpire(id). */
export function ToastRegion({ toasts = [], onExpire, duration = 2400 }) {
  useEffect(() => {
    if (!onExpire) return;
    const timers = toasts.map((t) => setTimeout(() => onExpire(t.id), duration));
    return () => timers.forEach(clearTimeout);
  }, [toasts]);
  return (
    <div className="fj-toast-region" aria-live="polite">
      {toasts.map((t) => <Toast key={t.id} {...t} />)}
    </div>
  );
}
