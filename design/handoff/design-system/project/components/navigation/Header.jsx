import React, { useEffect, useState } from 'react';
import { Wordmark } from '../brand/Wordmark.jsx';
import { Button } from '../actions/Button.jsx';
import { IconButton } from '../actions/IconButton.jsx';
import { ThemeToggle } from './SegmentedControl.jsx';

const LINKS = [{ id: 'projects', label: 'Projects', href: '#projects' }, { id: 'cv', label: 'CV', href: '#cv' }, { id: 'contact', label: 'Contact', href: '#contact' }];

export function Header({ current, links = LINKS, theme = 'dag', onThemeChange, onOpenPalette, onOpenMenu, ctaHref = '#contact', ctaVariant = 'primary', compact = false, className = '' }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on(); window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  const mac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);
  return (
    <header className={`fj-header ${scrolled ? 'fj-header--scrolled' : ''} ${compact ? 'fj-header--compact' : ''} ${className}`}>
      <div className="fj-header__in">
        <Wordmark size={17} />
        <nav aria-label="Main">
          <ul className="fj-header__nav">
            {links.map((l) => <li key={l.id}><a href={l.href} aria-current={current === l.id ? 'page' : undefined}>{l.label}</a></li>)}
          </ul>
        </nav>
        <div className="fj-header__end fj-header__desk">
          <button type="button" className="fj-kbd" onClick={onOpenPalette} aria-label="Open command palette">
            <span className="fj-kbd__text">Search</span><kbd>{mac ? '⌘' : 'Ctrl'} K</kbd>
          </button>
          <ThemeToggle theme={theme} onChange={onThemeChange} />
          <Button size="sm" variant={ctaVariant} href={ctaHref} arrow>Get in touch</Button>
        </div>
        <div className="fj-header__mobile">
          <Button size="sm" href={ctaHref}>Get in touch</Button>
          <IconButton icon="menu" label="Open menu" onClick={onOpenMenu} aria-haspopup="dialog" />
        </div>
      </div>
    </header>
  );
}
