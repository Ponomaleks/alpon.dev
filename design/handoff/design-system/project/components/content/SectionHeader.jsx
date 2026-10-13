import React from 'react';

export function SectionHeader({ index, eyebrow, title, lead, size = 'md', as = 'h2', id, className = '' }) {
  const H = as;
  return (
    <header className={`fj-sechead ${size !== 'md' ? 'fj-sechead--' + size : ''} ${className}`}>
      {(index || eyebrow) ? <span className="fj-eyebrow">{index ? <b>{index}</b> : null}{index && eyebrow ? <i>/</i> : null}{eyebrow ? <span>{eyebrow}</span> : null}</span> : null}
      <H className="fj-sechead__title" id={id}>{title}</H>
      {lead ? <p className="fj-sechead__lead">{lead}</p> : null}
    </header>
  );
}

export function Eyebrow({ index, children, className = '' }) {
  return <span className={'fj-eyebrow ' + className}>{index ? <><b>{index}</b><i>/</i></> : null}<span>{children}</span></span>;
}
