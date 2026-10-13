import React, { useId } from 'react';

export function Tooltip({ label, shortcut, placement = 'top', open = false, children, className = '' }) {
  const id = useId();
  const child = React.isValidElement(children) ? React.cloneElement(children, { 'aria-describedby': id }) : children;
  return (
    <span className={`fj-tip ${placement === 'bottom' ? 'fj-tip--bottom' : ''} ${open ? 'fj-tip--open' : ''} ${className}`}>
      {child}
      <span className="fj-tip__bubble" role="tooltip" id={id}>{label}{shortcut ? <kbd>{shortcut}</kbd> : null}</span>
    </span>
  );
}
