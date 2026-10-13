import React from 'react';
import { Contours } from './Contours.jsx';
import { Terrain } from './Terrain.jsx';

export function OgImage({ title = 'Alexander Ponomarenko', subtitle = 'Software Engineer · Full Stack Developer', eyebrow = '59.91° N, 10.75° E', seed, meta = 'Oslo, Norge', theme = 'spruce' }) {
  const spruce = theme === 'spruce';
  return (
    <div className={'fj-og ' + (spruce ? 'fjord-on-spruce' : '')} style={spruce ? null : { background: 'var(--fjord-stone)', color: 'var(--fjord-ink)' }}>
      {seed
        ? <Terrain seed={seed} tone={spruce ? 'spruce' : 'stone'} aspect="auto" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', background: 'transparent' }} />
        : <Contours shape={spruce ? 'ridge' : 'corner'} anchor={spruce ? 'bottom-right' : 'top-right'} tone={spruce ? 'spruce' : 'stone'} scale={1.25} />}
      <div className="fj-og__eyebrow">{eyebrow}</div>
      <div>
        <h1 className="fj-og__title">{title}</h1>
        {subtitle ? <p className="fj-og__sub">{subtitle}</p> : null}
      </div>
      <div className="fj-og__foot"><span>alpon.dev</span><small>{meta}</small></div>
    </div>
  );
}
