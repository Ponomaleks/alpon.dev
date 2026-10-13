import React, { useEffect, useRef, useState } from 'react';

/** Bottom bar with two actions; hides on scroll down, shows on scroll up. Mobile only (<768px) unless inline. */
export function StickyActionBar({ children, visible, inline = false, scrollRoot, threshold = 8, className = '' }) {
  const [shown, setShown] = useState(true);
  const last = useRef(0);
  useEffect(() => {
    if (visible !== undefined) return;
    const el = scrollRoot || window;
    const read = () => (scrollRoot ? scrollRoot.scrollTop : window.scrollY);
    const on = () => {
      const y = read(), d = y - last.current;
      if (Math.abs(d) < threshold) return;
      setShown(d < 0 || y < 40);
      last.current = y;
    };
    el.addEventListener('scroll', on, { passive: true });
    return () => el.removeEventListener('scroll', on);
  }, [visible, scrollRoot]);
  const on = visible !== undefined ? visible : shown;
  return (
    <div className={`fj-actionbar ${on ? '' : 'fj-actionbar--hidden'} ${inline ? 'fj-actionbar--inline' : ''} ${className}`} aria-hidden={!on || undefined}>
      {children}
    </div>
  );
}

/** Scroll-linked 2px progress line pinned to the top of the viewport. */
export function ScrollProgress({ value, className = '' }) {
  const [p, setP] = useState(value || 0);
  useEffect(() => {
    if (value !== undefined) { setP(value); return; }
    const on = () => { const h = document.documentElement; setP(h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight)); };
    on(); window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, [value]);
  return <div className={'fj-progress ' + className} aria-hidden="true"><span style={{ transform: `scaleX(${p})` }}></span></div>;
}
