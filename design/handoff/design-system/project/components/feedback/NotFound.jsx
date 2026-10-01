import React from 'react';
import { Contours } from '../brand/Contours.jsx';

export function NotFound({ title = 'Page not found', body = 'This page is off the map. The link may be old, or the page has moved.', path, actions, className = '' }) {
  return (
    <section className={'fj-404 ' + className} aria-labelledby="fj-404-title">
      <Contours shape="ridge" anchor="top-right" scale={1.5} />
      <span className="fj-404__code">404{path ? ` · ${path}` : ''}</span>
      <h1 className="fj-404__title" id="fj-404-title">{title}</h1>
      <p className="fj-404__body">{body}</p>
      {actions ? <div className="fj-404__actions">{actions}</div> : null}
    </section>
  );
}
