import React from 'react';
import { Contours } from './Contours.jsx';

export function Portrait({ src, alt = 'Alexander Ponomarenko', width = 280, ratio = '4 / 5', contours = true, className = '', style }) {
  return (
    <div className={'fj-portrait ' + className} style={{ width, ...style }}>
      {contours ? <div className="fj-portrait__contours"><Contours shape="ridge" anchor="bottom-right" scale={1} tone="auto" /></div> : null}
      <div className="fj-portrait__frame" style={{ aspectRatio: ratio }}>
        {src ? <img src={src} alt={alt} loading="lazy" decoding="async" /> : null}
      </div>
    </div>
  );
}
