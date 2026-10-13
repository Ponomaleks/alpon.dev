import { describe, expect, it } from 'vitest';
import { mergePageStyles, StylesheetError } from './one-stylesheet.ts';

// One stylesheet per page (home T19, LCP): Astro links a chunk per page plus one per group of
// pages that share styles; every link is one more request before the first paint.

const sheets: Record<string, string> = {
  '/_astro/global.a.css': ':root{--fjord-color-bg:#fff}',
  '/_astro/BaseLayout.b.css': '.header{display:flex}',
  '/_astro/index.c.css': '.hero{display:grid}',
};
const read = (href: string) => {
  const css = sheets[href];
  if (css === undefined) throw new Error(`no ${href}`);
  return css;
};
const link = (href: string) => `<link rel="stylesheet" href="${href}">`;
const page = (...hrefs: string[]) =>
  `<!DOCTYPE html><html><head><meta charset="utf-8">${hrefs.map(link).join('')}<title>t</title></head><body></body></html>`;
const links = (html: string) =>
  [...html.matchAll(/<link rel="stylesheet" href="([^"]+)">/g)].map((m) => m[1]);

describe('mergePageStyles', () => {
  it('replaces the links of a page with one, at the place of the first', () => {
    const { html, href, css } = mergePageStyles(page(...Object.keys(sheets)), read);
    expect(links(html)).toEqual([href]);
    expect(href).toMatch(/^\/_astro\/page\.[0-9a-f]{8}\.css$/);
    expect(html).toContain(`<meta charset="utf-8">${link(href ?? '')}<title>t</title>`);
    expect(css).toBeDefined();
  });

  it('keeps the rules in link order: tokens, then the Shell, then the page', () => {
    const { css = '' } = mergePageStyles(page(...Object.keys(sheets)), read);
    const at = ['--fjord-color-bg', '.header', '.hero'].map((part) => css.indexOf(part));
    expect(at.every((i) => i >= 0)).toBe(true);
    expect([...at].sort((a, b) => a - b)).toEqual(at);
  });

  it('names the file by its content, so pages with the same styles share it', () => {
    const one = mergePageStyles(page('/_astro/global.a.css', '/_astro/BaseLayout.b.css'), read);
    const same = mergePageStyles(page('/_astro/global.a.css', '/_astro/BaseLayout.b.css'), read);
    const other = mergePageStyles(page(...Object.keys(sheets)), read);
    expect(same.href).toBe(one.href);
    expect(other.href).not.toBe(one.href);
  });

  it('leaves a page with one stylesheet, or none, as it is', () => {
    for (const html of [page('/_astro/global.a.css'), page()]) {
      const result = mergePageStyles(html, read);
      expect(result.html).toBe(html);
      expect(result.css).toBeUndefined();
    }
  });

  it('touches only the stylesheets of the build, not another link', () => {
    const html = page('/_astro/global.a.css', '/_astro/index.c.css').replace(
      '<title>',
      '<link rel="stylesheet" href="https://example.com/x.css"><link rel="icon" href="/favicon.svg"><title>',
    );
    const result = mergePageStyles(html, read);
    expect(result.html).toContain('<link rel="stylesheet" href="https://example.com/x.css">');
    expect(result.html).toContain('<link rel="icon" href="/favicon.svg">');
    expect(result.html.match(/\/_astro\/[^"]+\.css/g)).toEqual([result.href]);
  });

  it('refuses a later sheet whose rule must come first in a file, naming the sheet', () => {
    const withImport: Record<string, string> = {
      ...sheets,
      '/_astro/index.c.css': '@import url("/x.css");.hero{}',
    };
    const failing = () =>
      mergePageStyles(page(...Object.keys(sheets)), (href) => withImport[href] ?? '');
    expect(failing).toThrow(StylesheetError);
    expect(failing).toThrow(/index\.c\.css.*@import/);
  });
});
