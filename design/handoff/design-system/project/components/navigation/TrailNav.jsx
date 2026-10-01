import React, { useEffect, useRef, useState } from 'react';

/** Vertical "trail" for case studies: a line with waypoints that fills as you scroll.
 *  Controlled via `active` + `progress` (0–1), or automatic from section ids in the document. */
export function TrailNav({ sections = [], active, progress, label = 'On this page', className = '' }) {
  const [auto, setAuto] = useState({ active: 0, progress: 0 });
  const ref = useRef(null);
  const controlled = active !== undefined;
  useEffect(() => {
    if (controlled) return;
    const on = () => {
      const els = sections.map((s) => document.getElementById(s.id)).filter(Boolean);
      if (!els.length) return;
      const mid = window.innerHeight * 0.35;
      let a = 0;
      els.forEach((el, n) => { if (el.getBoundingClientRect().top < mid) a = n; });
      const first = els[0].getBoundingClientRect().top + window.scrollY, last = els[els.length - 1].getBoundingClientRect().bottom + window.scrollY;
      const p = Math.min(1, Math.max(0, (window.scrollY + mid - first) / (last - first)));
      setAuto({ active: a, progress: p });
    };
    on(); window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, [controlled, sections.length]);
  const a = controlled ? active : auto.active;
  const p = progress !== undefined ? progress : controlled ? (sections.length > 1 ? a / (sections.length - 1) : 0) : auto.progress;
  return (
    <nav className={'fj-trail-wrap ' + className} aria-label={label}>
      <ol className="fj-trail" ref={ref}>
        <span className="fj-trail__line" aria-hidden="true"></span>
        <span className="fj-trail__fill" aria-hidden="true" style={{ height: `calc((100% - 12px) * ${p})` }}></span>
        {sections.map((s, n) => (
          <li key={s.id} className={n < a ? 'is-passed' : n === a ? 'is-active' : ''}>
            <a href={'#' + s.id} aria-current={n === a ? 'location' : undefined}><span className="fj-trail__pt" aria-hidden="true"></span>{String(n + 1).padStart(2, '0')} {s.label}</a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
