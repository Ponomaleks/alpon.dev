import React from 'react';

export function FilterChips({ options = [], selected = [], onChange, label = 'Filter', multi = true, className = '' }) {
  const opts = options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o));
  const toggle = (v) => {
    if (!onChange) return;
    if (!multi) return onChange(selected.includes(v) ? [] : [v]);
    onChange(selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v]);
  };
  return (
    <div className={'fj-chips ' + className} role="group" aria-label={label}>
      {opts.map((o) => (
        <button key={o.value} type="button" className="fj-chip" aria-pressed={selected.includes(o.value)} disabled={o.disabled} onClick={() => toggle(o.value)}>
          {o.label}{o.count != null ? <span className="fj-chip__n">{o.count}</span> : null}
        </button>
      ))}
    </div>
  );
}

