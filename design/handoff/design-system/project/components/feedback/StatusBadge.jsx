import React from 'react';

const LABELS = { live: 'Live', progress: 'In progress', archived: 'Archived' };

export function StatusBadge({ status = 'live', children, className = '' }) {
  return <span className={`fj-status fj-status--${status} ${className}`}>{children || LABELS[status]}</span>;
}
