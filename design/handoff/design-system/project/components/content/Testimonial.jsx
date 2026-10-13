import React from 'react';
import { TextLink } from '../actions/TextLink.jsx';

export function Testimonial({ quote, name, role, href, linkLabel = 'LinkedIn', className = '' }) {
  return (
    <figure className={'fj-quote ' + className}>
      <blockquote><p style={{ margin: 0 }}>“{quote}”</p></blockquote>
      <figcaption>
        <span className="fj-quote__who"><strong>{name}</strong><span>{role}</span></span>
        {href ? <TextLink variant="external" href={href}>{linkLabel}</TextLink> : null}
      </figcaption>
    </figure>
  );
}
