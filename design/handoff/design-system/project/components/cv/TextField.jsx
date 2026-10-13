import React, { useId } from 'react';
import { Icon } from '../brand/Icon.jsx';

export function TextField({ label, hint, error, multiline = false, optional = false, className = '', id, ...rest }) {
  const auto = useId();
  const fid = id || auto;
  const msg = error || hint;
  const Tag = multiline ? 'textarea' : 'input';
  return (
    <div className={'fj-field ' + className}>
      <label htmlFor={fid}>{label}{optional ? <small>optional</small> : null}</label>
      <Tag id={fid} className="fj-input" aria-invalid={error ? true : undefined} aria-describedby={msg ? fid + '-m' : undefined} {...rest} />
      {msg ? <span id={fid + '-m'} className={'fj-field__msg ' + (error ? 'fj-field__msg--error' : '')}>{error ? <Icon name="circle-alert" size={14} /> : null}{msg}</span> : null}
    </div>
  );
}
