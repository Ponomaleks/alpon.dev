import React, { useId, useState } from 'react';
import { Icon } from '../brand/Icon.jsx';
import { TagList } from '../feedback/Tag.jsx';

export function ExperienceItem({ role, org, period, location, summary, points = [], stack = [], current = false, defaultOpen = false, className = '' }) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  return (
    <li className={`fj-xp-item ${current ? 'fj-xp-item--current' : ''} ${className}`}>
      <span className="fj-xp-item__when">{period}{location ? <><br />{location}</> : null}</span>
      <div>
        <button type="button" className="fj-xp-item__head" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>
          <span><span className="fj-xp-item__role">{role}</span><span className="fj-xp-item__org">{org}</span></span>
          <Icon name="chevron-down" size={20} className="fj-xp-item__chev" />
        </button>
        <div className="fj-xp-item__body" id={id} data-open={open} hidden={false} aria-hidden={!open}>
          <div>
            <div className="fj-xp-item__inner">
              {summary ? <p>{summary}</p> : null}
              {points.length ? <ul>{points.map((p, i) => <li key={i}>{p}</li>)}</ul> : null}
              {stack.length ? <TagList items={stack} /> : null}
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}

export function ExperienceList({ children, className = '' }) {
  return <ol className={'fj-xp ' + className}>{children}</ol>;
}
