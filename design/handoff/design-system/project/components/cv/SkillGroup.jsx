import React from 'react';

/** Skills as a plain text list. No bars, no percentages, no logos. */
export function SkillGroup({ title, items = [], className = '' }) {
  return (
    <section className={'fj-skills ' + className}>
      <h3>{title}</h3>
      <p>{items.join(', ')}</p>
    </section>
  );
}
