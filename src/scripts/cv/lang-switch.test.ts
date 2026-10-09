import { describe, expect, it, vi } from 'vitest';
import { initLangSwitch, langHref } from './lang-switch';

// AC-08 (T18; ADR-0001; sad §8 Language switch). Links to the CV pages carry `data-cv-lang="en|no"`;
// the link of the page's own language carries aria-current="true" (CV head and Sticky action bar
// share the markup). Contract:
//   langHref(href, id): the address of a CV page with the fragment set, replaced or cleared.
//   initLangSwitch({ document, sectionInView }): `document.querySelectorAll('a[data-cv-lang]')`;
//   `sectionInView()` returns the shared id in view or null. It keeps every link to the other
//   language in step with that id (on init and on click), and stops navigation on the current one.

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
    ['data-cv-lang', lang],
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
  initLangSwitch({
    document: { querySelectorAll: () => all },
    sectionInView: () => ids.value,
  });
  const other = (pair: FakeLink[]) => pair[lang === 'en' ? 1 : 0];
  const current = (pair: FakeLink[]) => pair[lang === 'en' ? 0 : 1];
  return { head, bar, other, current };
}

describe('initLangSwitch', () => {
  it('sets the fragment of every link to the other language, head and bar, on the English page', () => {
    const { head, bar, other } = setup('en', { value: 'skills' });
    expect(other(head).attrs.get('href')).toBe('/cv/no#skills');
    expect(other(bar).attrs.get('href')).toBe('/cv/no#skills');
  });

  it('does the same on the Norwegian page', () => {
    const { head, bar, other } = setup('no', { value: 'experience' });
    expect(other(head).attrs.get('href')).toBe('/cv/en#experience');
    expect(other(bar).attrs.get('href')).toBe('/cv/en#experience');
  });

  it('replaces the fragment when the section in view changes, at activation', () => {
    const ids = { value: 'skills' as string | null };
    const { head, other } = setup('en', ids);
    ids.value = 'experience';
    click(other(head));
    expect(other(head).attrs.get('href')).toBe('/cv/no#experience');
  });

  it('clears the fragment when the Visitor is above the first section', () => {
    const ids = { value: 'skills' as string | null };
    const { head, bar, other } = setup('en', ids);
    ids.value = null;
    click(other(bar));
    expect(other(head).attrs.get('href')).toBe('/cv/no');
    expect(other(bar).attrs.get('href')).toBe('/cv/no');
  });

  it('does not stop the link to the other language', () => {
    const { head, other } = setup('en', { value: 'skills' });
    expect(click(other(head))).not.toHaveBeenCalled();
  });

  it('stops navigation on the link of the current language, in the head and in the bar', () => {
    const { head, bar, current } = setup('en', { value: 'skills' });
    expect(click(current(head))).toHaveBeenCalledTimes(1);
    expect(click(current(bar))).toHaveBeenCalledTimes(1);
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
