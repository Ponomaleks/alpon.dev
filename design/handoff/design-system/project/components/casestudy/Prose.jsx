import React from 'react';

export function Prose({ children, className = '' }) {
  return <div className={'fj-prose ' + className}>{children}</div>;
}
