import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import stylelint from 'stylelint';
import { describe, expect, it } from 'vitest';
import { parseCss } from '../tokens/parse.ts';

// src/styles/base.css: the element base ported from the handoff, tokens only (base-components ADR-0004),
// readable with scripts off (AC-04) and with no motion of its own (AC-14).

const root = fileURLToPath(new URL('../../', import.meta.url));
const path = `${root}src/styles/base.css`;
const css = () => readFileSync(path, 'utf8');
const rules = () => parseCss(css()).rules;
const decl = (selector: string, property: string) =>
  rules()
    .filter((r) =>
      r.selector
        .split(',')
        .map((s) => s.trim())
        .includes(selector),
    )
    .flatMap((r) => r.declarations)
    .find(([p]) => p === property)?.[1];

describe('src/styles/base.css', () => {
  it('exists and has zero Stylelint findings', async () => {
    expect(existsSync(path)).toBe(true);
    const { results } = await stylelint.lint({ files: path, cwd: root });
    expect(results[0]?.warnings).toEqual([]);
  });

  it('declares no animation and only token-based transitions, never under reduced motion', () => {
    expect(css()).not.toMatch(/@keyframes|animation(-name)?\s*:/);
    const sheet = parseCss(css());
    const transitions = (r: { declarations: [string, string][] }) =>
      r.declarations.some(([p]) => p.startsWith('transition'));
    expect(sheet.rules.filter(transitions)).toEqual([]);
    for (const media of sheet.media)
      if (media.rules.some(transitions))
        expect(media.query).toBe('@media (prefers-reduced-motion: no-preference)');
    for (const rule of [...sheet.rules, ...sheet.media.flatMap((m) => m.rules)])
      for (const [property, value] of rule.declarations)
        if (property.startsWith('transition'))
          expect(
            value
              .replace(/var\(--fjord-[a-z0-9-]+\)/g, '')
              .replace(/[a-z-]+|,/g, '')
              .trim(),
          ).toBe('');
  });

  it('stops looping animation and smooth scrolling under reduced motion (review F-16)', () => {
    const reduce = parseCss(css()).media.find(
      (m) => m.query === '@media (prefers-reduced-motion: reduce)',
    );
    const guard = reduce?.rules.find(
      (r) => r.selector.replace(/\s+/g, ' ') === '*, *::before, *::after',
    );
    expect(Object.fromEntries(guard?.declarations ?? [])).toEqual({
      'animation-iteration-count': '1 !important',
      'scroll-behavior': 'auto !important',
    });
  });

  it('sets border-box sizing on every element', () => {
    expect(decl('*', 'box-sizing')).toBe('border-box');
    expect(decl('*::before', 'box-sizing')).toBe('border-box');
  });

  it('paints the page from the theme tokens', () => {
    expect(decl('html', 'background-color')).toBe('var(--fjord-color-bg)');
    expect(decl('html', 'color')).toBe('var(--fjord-color-text)');
  });

  it('sets body type from the sans stack and the body scale', () => {
    expect(decl('body', 'font-family')).toBe('var(--fjord-font-sans)');
    expect(decl('body', 'font-size')).toBe('var(--fjord-text-body)');
    expect(decl('body', 'line-height')).toBe('var(--fjord-leading-body)');
    expect(decl('body', 'font-weight')).toBe('var(--fjord-weight-regular)');
    expect(decl('body', 'margin')).toBe('0');
  });

  it('sets headings, links, selection and monospace elements from tokens', () => {
    expect(decl('h1', 'font-weight')).toBe('var(--fjord-weight-semibold)');
    expect(decl('h1', 'line-height')).toBe('var(--fjord-leading-heading)');
    expect(decl('a', 'color')).toBe('var(--fjord-color-link)');
    expect(decl('a:hover', 'color')).toBe('var(--fjord-color-link-hover)');
    expect(decl('::selection', 'background-color')).toBe('var(--fjord-color-selection)');
    expect(decl('code', 'font-family')).toBe('var(--fjord-font-mono)');
  });

  it('draws a visible focus ring from the focus tokens', () => {
    expect(decl(':focus-visible', 'outline')).toBe(
      'var(--fjord-focus-width) solid var(--fjord-color-focus-ring)',
    );
    expect(decl(':focus-visible', 'outline-offset')).toBe('var(--fjord-focus-offset)');
  });
});
