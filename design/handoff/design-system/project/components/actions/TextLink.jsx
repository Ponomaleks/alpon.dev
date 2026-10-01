import React from 'react';
import { Icon } from '../brand/Icon.jsx';

export function TextLink({ href = '#', variant = 'inline', mono = false, disabled = false, className = '', children, ...rest }) {
  const ext = variant === 'external';
  return (
    <a className={`fj-link fj-link--${variant} ${mono ? 'fj-link--mono' : ''} ${className}`} href={disabled ? undefined : href}
      aria-disabled={disabled || undefined} target={ext ? '_blank' : undefined} rel={ext ? 'noopener noreferrer' : undefined} {...rest}>
      {children}
      {variant === 'standalone' ? <Icon name="arrow-right" size={16} className="fj-link__icon" /> : null}
      {ext ? <><Icon name="arrow-up-right" size={16} className="fj-link__icon" /><span className="fjord-visually-hidden"> (opens in a new tab)</span></> : null}
    </a>
  );
}
