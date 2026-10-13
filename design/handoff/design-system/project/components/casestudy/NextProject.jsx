import React from 'react';
import { Icon } from '../brand/Icon.jsx';
import { Terrain } from '../brand/Terrain.jsx';

export function NextProject({ title, summary, href = '#', slug, image, label = 'Next project', className = '' }) {
  return (
    <a className={'fj-next ' + className} href={href}>
      <div>
        <span className="fj-eyebrow">{label}</span>
        <h2 className="fj-next__title" style={{ marginTop: 12 }}>{title}<Icon name="arrow-right" size={28} /></h2>
        {summary ? <p>{summary}</p> : null}
      </div>
      <div className="fj-media">{image ? <img src={image} alt="" /> : <Terrain seed={slug || title} tone="spruce" aspect="auto" />}</div>
    </a>
  );
}
