import React from 'react';

export function SegmentedControl({ options = [], value, onChange, label, size = 'md', disabled = false, className = '' }) {
  const opts = options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o));
  const onKey = (e, i) => {
    if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    e.preventDefault();
    const n = opts[(i + (e.key === 'ArrowRight' ? 1 : opts.length - 1)) % opts.length];
    onChange && onChange(n.value);
    const btns = e.currentTarget.parentElement.querySelectorAll('button');
    btns[opts.indexOf(n)] && btns[opts.indexOf(n)].focus();
  };
  return (
    <div className={`fj-seg ${size === 'lg' ? 'fj-seg--lg' : ''} ${className}`} role="radiogroup" aria-label={label}>
      {opts.map((o, i) => {
        const on = o.value === value;
        return (
          <button key={o.value} type="button" role="radio" aria-checked={on} tabIndex={on ? 0 : -1} disabled={disabled}
            lang={o.lang} onClick={() => onChange && onChange(o.value)} onKeyDown={(e) => onKey(e, i)}>{o.label}</button>
        );
      })}
    </div>
  );
}

export function ThemeToggle({ theme = 'dag', onChange, className = '' }) {
  return (
    <SegmentedControl className={className} label="Theme" value={theme} onChange={onChange}
      options={[{ value: 'dag', label: 'Light' }, { value: 'natt', label: 'Dark' }]} />
  );
}

/** Applies a theme to <html> with a cross-fade (View Transitions when available). */
export function applyTheme(theme) {
  const set = () => { document.documentElement.setAttribute('data-theme', theme); try { localStorage.setItem('fjord-theme', theme); } catch (e) {} };
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (document.startViewTransition && !reduce) document.startViewTransition(set); else set();
}
