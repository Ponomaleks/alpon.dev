import React from 'react';
import { Contours } from '../brand/Contours.jsx';

export function EmptyState({ eyebrow = 'No results', title = 'Nothing here yet', body, action, className = '' }) {
  return (
    <div className={'fj-empty ' + className}>
      <Contours shape="corner" anchor="top-right" scale={1.1} />
      {eyebrow ? <span className="fj-empty__eyebrow">{eyebrow}</span> : null}
      <h3 className="fj-empty__title">{title}</h3>
      {body ? <p className="fj-empty__body">{body}</p> : null}
      {action || null}
    </div>
  );
}
