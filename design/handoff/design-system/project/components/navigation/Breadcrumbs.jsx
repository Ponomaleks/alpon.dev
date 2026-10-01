import React from 'react';

export function Breadcrumbs({ items = [], className = '' }) {
  return (
    <nav className={'fj-crumbs ' + className} aria-label="Breadcrumb">
      <ol>
        {items.map((it, i) => (
          <li key={i}>{i === items.length - 1 ? <span aria-current="page">{it.label}</span> : <a href={it.href}>{it.label}</a>}</li>
        ))}
      </ol>
    </nav>
  );
}

