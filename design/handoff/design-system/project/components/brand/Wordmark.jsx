import React from 'react';

export function Wordmark({ href = '/', size = 16, className = '', style }) {
  const inner = <>alpon<span>.dev</span></>;
  const st = { fontSize: size, ...style };
  return href
    ? <a className={'fj-wordmark ' + className} href={href} style={st} aria-label="alpon.dev, home">{inner}</a>
    : <span className={'fj-wordmark ' + className} style={st}>{inner}</span>;
}
