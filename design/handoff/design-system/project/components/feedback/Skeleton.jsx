import React from 'react';

export function Skeleton({ variant = 'text', width, height, lines = 1, className = '', style }) {
  if (variant === 'text' && lines > 1) {
    return (
      <span aria-hidden="true" style={{ display: 'block', ...style }}>
        {Array.from({ length: lines }, (_, i) => (
          <span key={i} className="fj-skel fj-skel--text" style={{ width: i === lines - 1 ? '62%' : width || '100%' }}></span>
        ))}
      </span>
    );
  }
  return <span aria-hidden="true" className={`fj-skel fj-skel--${variant} ${className}`} style={{ width: width || '100%', height, ...style }}></span>;
}
