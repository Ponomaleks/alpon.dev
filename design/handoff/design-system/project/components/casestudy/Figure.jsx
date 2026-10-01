import React from 'react';
import { Terrain } from '../brand/Terrain.jsx';

export function Figure({ src, alt = '', caption, index, seed, ratio = '16 / 10', className = '' }) {
  return (
    <figure className={'fj-figure ' + className}>
      <div className="fj-media" style={{ aspectRatio: ratio }}>
        {src ? <img src={src} alt={alt} loading="lazy" decoding="async" /> : <Terrain seed={seed || caption || 'figure'} tone="auto" aspect="auto" />}
      </div>
      {caption ? <figcaption>{index ? <b>{index}</b> : null}<span>{caption}</span></figcaption> : null}
    </figure>
  );
}
