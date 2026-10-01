import React from 'react';

export function Tag({ children, className = '' }) {
  return <span className={'fj-tag ' + className}>{children}</span>;
}

export function TagList({ items = [], plain = false, label = 'Stack', className = '' }) {
  return (
    <ul className={`fj-tags ${plain ? 'fj-tags--plain' : ''} ${className}`} aria-label={label}>
      {items.map((t) => <li key={t}><span className="fj-tag">{t}</span></li>)}
    </ul>
  );
}
