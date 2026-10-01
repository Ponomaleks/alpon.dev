import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '../brand/Icon.jsx';

/** Ctrl/Cmd+K palette. items: [{ id, group, label, icon, hint, keywords, onSelect }] */
export function CommandPalette({ open, onClose, onOpen, items = [], placeholder = 'Go to, copy, switch…', inline = false, hotkey = true }) {
  const [q, setQ] = useState('');
  const [i, setI] = useState(0);
  const input = useRef(null);
  useEffect(() => {
    if (!hotkey) return;
    const on = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); open ? onClose && onClose() : onOpen && onOpen(); }
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, [open, hotkey]);
  useEffect(() => { if (open) { setQ(''); setI(0); if (!inline) setTimeout(() => input.current && input.current.focus({ preventScroll: true }), 10); } }, [open]);
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return items.filter((it) => !s || (it.label + ' ' + (it.keywords || '') + ' ' + (it.group || '')).toLowerCase().includes(s));
  }, [q, items]);
  if (!open) return null;
  const run = (it) => { it && it.onSelect && it.onSelect(); onClose && onClose(); };
  const onKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setI((x) => Math.min(list.length - 1, x + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setI((x) => Math.max(0, x - 1)); }
    else if (e.key === 'Enter') { e.preventDefault(); run(list[i]); }
    else if (e.key === 'Escape') { e.preventDefault(); onClose && onClose(); }
  };
  let lastGroup = null;
  return (
    <div className={`fj-palette-scrim ${inline ? 'fj-palette-scrim--inline' : ''}`} onMouseDown={(e) => e.target === e.currentTarget && onClose && onClose()}>
      <div className="fj-palette" role="dialog" aria-modal="true" aria-label="Command palette">
        <div className="fj-palette__search">
          <Icon name="search" size={18} />
          <input ref={input} value={q} onChange={(e) => { setQ(e.target.value); setI(0); }} onKeyDown={onKey} placeholder={placeholder}
            role="combobox" aria-expanded="true" aria-controls="fj-palette-list" aria-activedescendant={list[i] ? 'fj-pi-' + i : undefined} />
          <span className="fj-palette__esc">Esc</span>
        </div>
        <ul className="fj-palette__list" id="fj-palette-list" role="listbox">
          {list.length === 0 ? <li className="fj-palette__empty">No results for “{q}”</li> : null}
          {list.map((it, n) => {
            const head = it.group && it.group !== lastGroup ? (lastGroup = it.group, <li key={'g' + it.group} className="fj-palette__group" role="presentation">{it.group}</li>) : null;
            return (
              <React.Fragment key={it.id || it.label}>
                {head}
                <li id={'fj-pi-' + n} role="option" aria-selected={n === i} className="fj-palette__item" onMouseMove={() => setI(n)} onClick={() => run(it)}>
                  {it.icon ? <Icon name={it.icon} size={18} /> : null}<span>{it.label}</span>{it.hint ? <span className="fj-palette__hint">{it.hint}</span> : null}
                </li>
              </React.Fragment>
            );
          })}
        </ul>
        <div className="fj-palette__foot"><span>↑↓ navigate</span><span>↵ open</span><span>esc close</span></div>
      </div>
    </div>
  );
}
