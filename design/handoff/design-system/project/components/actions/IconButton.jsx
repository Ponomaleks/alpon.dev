import React from 'react';
import { Icon } from '../brand/Icon.jsx';

export function IconButton({ icon, label, variant = 'ghost', size = 'md', disabled = false, onClick, className = '', ...rest }) {
  return (
    <button type="button" className={`fj-iconbtn fj-iconbtn--${variant} ${size === 'sm' ? 'fj-iconbtn--sm' : ''} ${className}`}
      aria-label={label} title={label} disabled={disabled} onClick={onClick} {...rest}>
      <Icon name={icon} size={size === 'sm' ? 18 : 20} />
    </button>
  );
}
