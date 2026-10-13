import React from 'react';
import { Icon } from '../brand/Icon.jsx';

export function Pagination({ prev, next, className = '' }) {
  return (
    <nav className={'fj-pager ' + className} aria-label="Pagination">
      {prev ? <a className="fj-pager__prev" href={prev.href} rel="prev"><span className="fj-pager__dir"><Icon name="arrow-left" size={14} />{prev.label || 'Previous'}</span><span className="fj-pager__title">{prev.title}</span></a> : <span></span>}
      {next ? <a className="fj-pager__next" href={next.href} rel="next"><span className="fj-pager__dir">{next.label || 'Next'}<Icon name="arrow-right" size={14} /></span><span className="fj-pager__title">{next.title}</span></a> : null}
    </nav>
  );
}
