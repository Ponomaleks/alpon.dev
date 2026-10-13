import React from 'react';

/** Languages with plain descriptive levels (Native / Professional working / Learning). No CEFR codes, no badges. */
export function LanguageList({ items = [], className = '' }) {
  return (
    <ul className={'fj-langs ' + className}>
      {items.map((l) => (
        <li key={l.name}><strong lang={l.lang}>{l.name}</strong><span>{l.level}</span>{l.note ? <small>{l.note}</small> : null}</li>
      ))}
    </ul>
  );
}
