import React from 'react';

/** Columns of nodes joined by hairline arrows. columns: [{ label, nodes: [{ title, note, accent }] }] */
export function ArchDiagram({ columns = [], label = 'Architecture', className = '' }) {
  return (
    <div className={'fj-arch ' + className} role="img" aria-label={label + ': ' + columns.map((c) => c.label + ' (' + c.nodes.map((n) => n.title).join(', ') + ')').join(' → ')} data-om-raster>
      {columns.map((c) => (
        <div className="fj-arch__col" key={c.label}>
          <span className="fj-arch__label">{c.label}</span>
          {c.nodes.map((n) => <div key={n.title} className={'fj-arch__node ' + (n.accent ? 'fj-arch__node--accent' : '')}><strong>{n.title}</strong>{n.note ? <span>{n.note}</span> : null}</div>)}
        </div>
      ))}
    </div>
  );
}
