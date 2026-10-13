import React, { useEffect, useRef } from 'react';
import { contourData } from './contourData.js';

const TONES = { spruce: 'rgba(156,195,178,.28)', stone: 'rgba(46,94,78,.13)', auto: 'var(--fjord-color-contour-line)' };
const NATURAL = { ridge: ['left', 'bottom'], corner: ['right', 'top'] };

export function useParallax(ref, enabled) {
  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el || typeof window === 'undefined') return;
    const ok = window.matchMedia('(pointer: fine) and (min-width: 1024px) and (prefers-reduced-motion: no-preference)');
    if (!ok.matches) return;
    let raf = 0;
    const onMove = (e) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const x = (e.clientX / window.innerWidth - 0.5) * -20;
        const y = (e.clientY / window.innerHeight - 0.5) * -20;
        el.style.setProperty('--fj-px', x.toFixed(1) + 'px');
        el.style.setProperty('--fj-py', y.toFixed(1) + 'px');
      });
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => { window.removeEventListener('pointermove', onMove); cancelAnimationFrame(raf); };
  }, [enabled]);
}

export function Contours({ shape = 'ridge', anchor, tone = 'auto', scale = 1.3, ambient = false, parallax = false, strokeWidth = 1, className = '', style }) {
  const ref = useRef(null);
  useParallax(ref, parallax);
  const [nh, nv] = NATURAL[shape] || NATURAL.ridge;
  const a = anchor || `${nv}-${nh}`;
  const [av, ah] = a.split('-');
  const flipX = ah !== nh, flipY = av !== nv;
  const paths = contourData[shape] || contourData.ridge;
  const pos = { width: scale * 100 + '%', height: scale * 100 + '%', [ah]: 0, [av]: 0 };
  const par = `x${ah === 'left' ? 'Min' : 'Max'}Y${av === 'top' ? 'Min' : 'Max'} slice`;
  const t = `translate(${flipX ? 85 : 0} ${flipY ? 55 : 0}) scale(${flipX ? -1 : 1} ${flipY ? -1 : 1})`;
  return (
    <div className={`fj-contours ${ambient ? 'fj-contours--drift' : ''} ${className}`} aria-hidden="true" style={style}>
      <div className="fj-contours__layer" ref={ref}>
        <svg viewBox={contourData.viewBox} preserveAspectRatio={par} style={pos}>
          <g transform={t} fill="none" stroke={TONES[tone] || TONES.auto} strokeWidth={strokeWidth} vectorEffect="non-scaling-stroke">
            {paths.map((d, i) => <path key={i} d={d} vectorEffect="non-scaling-stroke" />)}
          </g>
        </svg>
      </div>
    </div>
  );
}
