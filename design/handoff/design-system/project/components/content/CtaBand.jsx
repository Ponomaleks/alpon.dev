import React from 'react';
import { Contours } from '../brand/Contours.jsx';
import { Button } from '../actions/Button.jsx';

export function CtaBand({ title = 'Good products are built together.', body, primary = { label: 'Get in touch', href: '#contact' }, secondary = { label: 'View CV', href: '#cv' }, compact = false, ambient = true, className = '' }) {
  return (
    <section className={`fj-band fjord-on-spruce ${compact ? 'fj-band--compact' : ''} ${className}`}>
      <Contours shape="ridge" anchor="bottom-right" tone="spruce" scale={1.4} ambient={ambient} parallax={ambient} />
      <div className="fj-band__in">
        <h2 className="fj-band__title">{title}</h2>
        {body ? <p className="fj-band__body">{body}</p> : null}
        <div className="fj-band__actions">
          {primary ? <Button size="lg" href={primary.href} arrow onClick={primary.onClick}>{primary.label}</Button> : null}
          {secondary ? <Button size="lg" variant="secondary" href={secondary.href} onClick={secondary.onClick}>{secondary.label}</Button> : null}
        </div>
      </div>
    </section>
  );
}
