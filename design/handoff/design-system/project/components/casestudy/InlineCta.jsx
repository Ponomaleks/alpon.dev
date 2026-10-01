import React from 'react';
import { Button } from '../actions/Button.jsx';

export function InlineCta({ title = 'Want something like this?', body = 'Let’s talk.', action = 'Get in touch', href = '#contact', className = '' }) {
  return (
    <div className={'fj-inlinecta ' + className}>
      <p>{title}<span>{body}</span></p>
      <Button variant="secondary" href={href} arrow lang="no">{action}</Button>
    </div>
  );
}
