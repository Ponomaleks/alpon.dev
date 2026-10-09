import { describe, expect, it, vi } from 'vitest';
import { initLangSwitch, langHref } from './lang-switch';

// AC-08 (ADR-0001; sad §8 Language switch). The CV head and the Sticky action bar hold the same
// pair of links (`[data-lang-switch] a[data-switch-to]`); the link of the page's own language
// carries aria-current="true". Contract:
//   langHref(href, id): the address of a CV page with the fragment set, replaced or cleared.
//   initLangSwitch({ document, sectionInView, savePosition }):
//     - in the bar (`[data-shell-bar]`) the link to the other language carries the section in view
//       at the moment of the click, or no fragment above the first section;
//     - in the CV head the link to the other language never carries a fragment and calls
//       `savePosition()` on activation, so the other page can open at the same scroll position;
//     - the link of the current language does not navigate, in both places.

describe('langHref', () => {
  it('sets the fragment on an address without one', () => {
    expect(langHref('/cv/no', 'experience')).toBe('/cv/no#experience');
  });

  it('replaces an existing fragment', () => {
    expect(langHref('/cv/no#skills', 'experience')).toBe('/cv/no#experience');
  });

  it('clears the fragment when no section is in view', () => {
    expect(langHref('/cv/no#skills', null)).toBe('/cv/no');
    expect(langHref('/cv/en', null)).toBe('/cv/en');
  });

  it('leaves an address that is not a CV page alone', () => {
    expect(langHref('https://example.com/cv/no#a', 'skills')).toBe('https://example.com/cv/no#a');
    expect(langHref('/linkedin', 'skills')).toBe('/linkedin');
  });
});

type Handler = (e: { preventDefault(): void }) => void;

interface FakeLink {
  attrs: Map<string, string>;
  handlers: Handler[];
  getAttribute(name: string): string | null;
  setAttribute(name: string, value: string): void;
  addEventListener(type: 'click', l: Handler): void;
}

function link(lang: string, href: string, current = false): FakeLink {
  const attrs = new Map<string, string>([
    ['data-switch-to', lang],
    ['href', href],
  ]);
  if (current) attrs.set('aria-current', 'true');
  const handlers: Handler[] = [];
  return {
    attrs,
    handlers,
    getAttribute: (n) => attrs.get(n) ?? null,
    setAttribute: (n, v) => void attrs.set(n, v),
    addEventListener: (_t, l) => void handlers.push(l),
  };
}

function click(l: FakeLink) {
  const preventDefault = vi.fn();
  l.handlers.forEach((h) => h({ preventDefault }));
  return preventDefault;
}

function setup(lang: 'en' | 'no', ids: { value: string | null }, extra: FakeLink[] = []) {
  // The CV head and the Sticky action bar each hold a pair of links.
  const make = () => [link('en', '/cv/en', lang === 'en'), link('no', '/cv/no', lang === 'no')];
  const head = make();
  const bar = make();
  const all = [...head, ...bar, ...extra];
  const savePosition = vi.fn();
  initLangSwitch({
    document: {
      querySelectorAll: (selector) => (selector.includes('[data-shell-bar]') ? bar : all),
    },
    sectionInView: () => ids.value,
    savePosition,
  });
  const other = (pair: FakeLink[]) => pair[lang === 'en' ? 1 : 0];
  const current = (pair: FakeLink[]) => pair[lang === 'en' ? 0 : 1];
  return { head, bar, other, current, savePosition };
}

describe('initLangSwitch: the Sticky action bar carries the section', () => {
  it('sets the fragment of the bar link to the other language on the English page', () => {
    const { bar, other } = setup('en', { value: 'skills' });
    expect(other(bar).attrs.get('href')).toBe('/cv/no#skills');
  });

  it('does the same on the Norwegian page', () => {
    const { bar, other } = setup('no', { value: 'experience' });
    expect(other(bar).attrs.get('href')).toBe('/cv/en#experience');
  });

  it('takes the section in view at the moment of the click', () => {
    const ids = { value: 'skills' as string | null };
    const { bar, other } = setup('en', ids);
    ids.value = 'experience';
    click(other(bar));
    expect(other(bar).attrs.get('href')).toBe('/cv/no#experience');
  });

  it('clears the fragment above the first section at the click, even after reading further down', () => {
    const ids = { value: 'education' as string | null };
    const { bar, other } = setup('en', ids);
    ids.value = null;
    click(other(bar));
    expect(other(bar).attrs.get('href')).toBe('/cv/no');
  });

  it('saves no position from the bar', () => {
    const { bar, other, savePosition } = setup('en', { value: 'skills' });
    click(other(bar));
    expect(savePosition).not.toHaveBeenCalled();
  });
});

describe('initLangSwitch: the CV head keeps the position, never a section', () => {
  it('gives the head link no fragment, whatever section is in view', () => {
    const { head, other } = setup('en', { value: 'skills' });
    expect(other(head).attrs.get('href')).toBe('/cv/no');
  });

  it('keeps it without a fragment at activation and saves the position once', () => {
    const ids = { value: null as string | null };
    const { head, other, savePosition } = setup('no', ids);
    ids.value = 'experience';
    click(other(head));
    expect(other(head).attrs.get('href')).toBe('/cv/en');
    expect(savePosition).toHaveBeenCalledTimes(1);
  });

  it('removes a fragment the markup carried', () => {
    const stale = link('no', '/cv/no#skills');
    const current = link('en', '/cv/en', true);
    initLangSwitch({
      document: {
        querySelectorAll: (selector) =>
          selector.includes('[data-shell-bar]') ? [] : [current, stale],
      },
      sectionInView: () => 'skills',
      savePosition: () => {},
    });
    expect(stale.attrs.get('href')).toBe('/cv/no');
  });
});

describe('initLangSwitch: both places', () => {
  it('does not stop the link to the other language', () => {
    const { head, bar, other } = setup('en', { value: 'skills' });
    expect(click(other(head))).not.toHaveBeenCalled();
    expect(click(other(bar))).not.toHaveBeenCalled();
  });

  it('stops navigation on the link of the current language and saves nothing', () => {
    const { head, bar, current, savePosition } = setup('en', { value: 'skills' });
    expect(click(current(head))).toHaveBeenCalledTimes(1);
    expect(click(current(bar))).toHaveBeenCalledTimes(1);
    expect(savePosition).not.toHaveBeenCalled();
  });

  it('keeps the address of the current-language link', () => {
    const { head, current } = setup('no', { value: 'skills' });
    expect(current(head).attrs.get('href')).toBe('/cv/no');
  });

  it('leaves a link to another address alone', () => {
    const stray = link('no', 'https://example.com/elsewhere');
    setup('en', { value: 'skills' }, [stray]);
    expect(stray.attrs.get('href')).toBe('https://example.com/elsewhere');
  });
});
