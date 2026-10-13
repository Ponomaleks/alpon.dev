import React from 'react';
import { Icon } from '../brand/Icon.jsx';

export function Callout({ label = 'Note', icon = 'info', tone = 'note', children, className = '' }) {
  return (
    <aside className={`fj-callout fj-callout--${tone} ${className}`}>
      <span className="fj-callout__label"><Icon name={icon} size={16} />{label}</span>
      {typeof children === 'string' ? <p>{children}</p> : children}
    </aside>
  );
}
