import React from 'react';
import { Icon } from '../brand/Icon.jsx';

export function Button({ variant = 'primary', size = 'md', href, external = false, arrow = false, icon, iconEnd, disabled = false, loading = false, block = false, type = 'button', onClick, className = '', children, ...rest }) {
  const cls = `fj-btn fj-btn--${variant} ${size !== 'md' ? 'fj-btn--' + size : ''} ${block ? 'fj-btn--block' : ''} ${className}`;
  const is = size === 'sm' ? 16 : 18;
  const content = (
    <>
      {loading ? <Icon name="loader" size={is} className="fj-btn__spin" /> : icon ? <Icon name={icon} size={is} /> : null}
      <span>{children}</span>
      {iconEnd ? <Icon name={iconEnd} size={is} /> : null}
      {arrow ? <Icon name={external ? 'arrow-up-right' : 'arrow-right'} size={is} className="fj-btn__arrow" /> : null}
    </>
  );
  const off = disabled || loading;
  if (href) {
    return (
      <a className={cls} href={off ? undefined : href} aria-disabled={disabled || undefined} aria-busy={loading || undefined}
        target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined} onClick={onClick} {...rest}>{content}</a>
    );
  }
  return (
    <button className={cls} type={type} aria-disabled={disabled || undefined} aria-busy={loading || undefined}
      onClick={off ? (e) => e.preventDefault() : onClick} {...rest}>{content}</button>
  );
}
