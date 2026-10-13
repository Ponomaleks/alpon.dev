import React from 'react';
import { qrData } from './qrData.js';

export function QrTile({ size = 160, caption, label = 'QR code for alpon.dev', className = '', style }) {
  const tile = (
    <div className={'fj-qr ' + className} style={{ width: size, ...style }} role="img" aria-label={label}>
      <svg viewBox={qrData.viewBox}>{qrData.paths.map((d, i) => <path key={i} d={d} fill="currentColor" />)}</svg>
    </div>
  );
  if (!caption) return tile;
  return <figure className="fj-qr-figure">{tile}<figcaption>{caption}</figcaption></figure>;
}
