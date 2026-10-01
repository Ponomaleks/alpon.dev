import React, { useEffect, useRef } from 'react';
import { Wordmark } from '../brand/Wordmark.jsx';
import { Contours } from '../brand/Contours.jsx';
import { Button } from '../actions/Button.jsx';
import { IconButton } from '../actions/IconButton.jsx';
import { ThemeToggle } from './SegmentedControl.jsx';

const LINKS = [{ id: 'projects', label: 'Projects', href: '#projects' }, { id: 'cv', label: 'CV', href: '#cv' }, { id: 'contact', label: 'Contact', href: '#contact' }];

export function MobileMenu({ open = true, onClose, current, links = LINKS, theme = 'dag', onThemeChange, inline = false, email = 'ponomaleks@gmail.com', phone = '+47 405 94 584' }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!open || inline) return;
    const prev = document.activeElement;
    ref.current && ref.current.querySelector('a,button') && ref.current.querySelector('a,button').focus();
    const onKey = (e) => { if (e.key === 'Escape') onClose && onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; prev && prev.focus && prev.focus(); };
  }, [open]);
  if (!open) return null;
  return (
    <div ref={ref} className={`fj-sheet fjord-on-spruce ${inline ? 'fj-sheet--inline' : ''}`} role="dialog" aria-modal={!inline} aria-label="Menu">
      <Contours shape="ridge" anchor="bottom-left" tone="spruce" scale={1.6} />
      <div className="fj-sheet__top">
        <Wordmark size={17} />
        <IconButton icon="x" label="Close menu" onClick={onClose} />
      </div>
      <nav aria-label="Main">
        <ul className="fj-sheet__nav">
          {links.map((l, i) => (
            <li key={l.id}><a href={l.href} onClick={onClose} aria-current={current === l.id ? 'page' : undefined}><span>{String(i + 1).padStart(2, '0')}</span>{l.label}</a></li>
          ))}
        </ul>
      </nav>
      <div className="fj-sheet__foot">
        <div className="fj-sheet__contacts">
          <a href={'mailto:' + email}>{email}</a>
          <a href={'tel:' + phone.replace(/\s/g, '')}>{phone}</a>
          <span lang="no">Oslo, Norge</span>
        </div>
        <div className="fj-sheet__row">
          <ThemeToggle theme={theme} onChange={onThemeChange} />
        </div>
        <Button block size="lg" href="#contact" arrow lang="no" onClick={onClose}>Get in touch</Button>
      </div>
    </div>
  );
}
