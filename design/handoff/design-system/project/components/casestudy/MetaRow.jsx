import React from 'react';

export function MetaRow({ items = [], className = '' }) {
  return (
    <dl className={'fj-meta ' + className} style={{ '--fj-n': items.length }}>
      {items.map((it) => <div key={it.label}><dt>{it.label}</dt><dd>{it.value}</dd></div>)}
    </dl>
  );
}
