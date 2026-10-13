import React, { useEffect, useRef, useState } from 'react';

function fmt(n, decimals) { return n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).replace(/,/g, '\u202F'); }

/** Big number + label + optional context/source. Counts up once when scrolled into view. */
export function Stat({ value, prefix = '', suffix = '', unit, label, context, decimals = 0, countUp = true, duration = 1200, as = 'div', className = '' }) {
  const ref = useRef(null);
  const num = typeof value === 'number';
  const [shown, setShown] = useState(num && countUp ? 0 : value);
  useEffect(() => {
    if (!num || !countUp || !ref.current) { setShown(value); return; }
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !('IntersectionObserver' in window)) { setShown(value); return; }
    let raf, done = false;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || done) return;
      done = true; io.disconnect();
      const t0 = performance.now();
      const tick = (t) => {
        const k = Math.min(1, (t - t0) / duration), eased = 1 - Math.pow(1 - k, 3);
        setShown(value * eased);
        if (k < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    io.observe(ref.current);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [value]);
  const El = as;
  const final = num ? prefix + fmt(value, decimals) + suffix : String(value);
  return (
    <El className={'fj-stat ' + className} ref={ref}>
      <span className="fj-stat__value" aria-label={final + (unit ? ' ' + unit : '')}>
        <span aria-hidden="true">{num ? prefix + fmt(shown, decimals) + suffix : shown}{unit ? <small>{unit}</small> : null}</span>
      </span>
      {label ? <span className="fj-stat__label">{label}</span> : null}
      {context ? <span className="fj-stat__ctx">{context}</span> : null}
    </El>
  );
}

export function StatRow({ items = [], compact = false, label = 'Key facts', className = '' }) {
  return (
    <ul className={`fj-stats ${compact ? 'fj-stats--compact' : ''} ${className}`} style={{ '--fj-n': items.length }} aria-label={label}>
      {items.map((it, i) => <Stat key={i} as="li" {...it} />)}
    </ul>
  );
}
