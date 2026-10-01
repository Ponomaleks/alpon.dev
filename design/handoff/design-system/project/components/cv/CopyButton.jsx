import React, { useState } from 'react';
import { Icon } from '../brand/Icon.jsx';

/** Copies text; shows "Copied" inline and calls onCopied (use it to raise a Toast). */
export function CopyButton({ value, label = 'Copy', done = 'Copied', onCopied, className = '' }) {
  const [ok, setOk] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(value); } catch (e) {}
    setOk(true); onCopied && onCopied(value);
    setTimeout(() => setOk(false), 1800);
  };
  return (
    <button type="button" className={'fj-copy ' + className} data-done={ok} onClick={copy} aria-label={ok ? done : `${label} ${value}`}>
      <Icon name={ok ? 'check' : 'copy'} size={14} /><span lang={ok ? 'no' : undefined}>{ok ? done : label}</span>
    </button>
  );
}
