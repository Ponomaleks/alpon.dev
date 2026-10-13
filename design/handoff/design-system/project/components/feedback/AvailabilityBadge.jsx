import React from 'react';

const DEFAULTS = { open: ['Open to work', 'Oslo area'], talking: ['In conversations', 'Oslo area'], employed: ['Employed', 'Not looking'] };

export function AvailabilityBadge({ status = 'open', label, detail, className = '' }) {
  const [l, d] = DEFAULTS[status] || DEFAULTS.open;
  return (
    <span className={`fj-avail fj-avail--${status} ${className}`}>
      <span className="fj-avail__dot" aria-hidden="true"></span>
      <span>{label || l}</span>
      {(detail ?? d) ? <><span className="fj-avail__sep" aria-hidden="true">·</span><span>{detail ?? d}</span></> : null}
    </span>
  );
}
