import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { checkPlaceholders, SAMPLE_ATTRIBUTE } from './check-placeholders.ts';

// AC-28: square brackets that stand for a missing value fail the build, naming the page and
// the text. Marked Styleguide sample data is the only exemption.

const dirs: string[] = [];
afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

/** A fixture dist/ with the given pages (path relative to dist). */
function dist(pages: Record<string, string>): string {
  const root = mkdtempSync(join(tmpdir(), 'fjord-placeholders-'));
  dirs.push(root);
  for (const [path, html] of Object.entries(pages)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), html);
  }
  return root;
}

const page = (body: string, head = '') =>
  `<!doctype html><html><head>${head}</head><body>${body}</body></html>`;

describe('placeholders on pages for Visitors (AC-28)', () => {
  it('passes a page without brackets', () => {
    const root = dist({ 'index.html': page('<p>Now: MSc Computer Science</p>') });
    expect(checkPlaceholders(root)).toEqual([]);
  });

  it('fails naming the page and the text for "[current project]"', () => {
    const root = dist({
      'index.html': page('<p>Now</p>'),
      'cv/index.html': page('<p>Now: [current project] · MSc</p>'),
    });
    const msg = checkPlaceholders(root).join('\n');
    expect(msg).toContain('[current project]');
    expect(msg).toMatch(/cv.index\.html/);
    expect(msg).not.toMatch(/^index\.html/m);
  });

  it('finds a placeholder split by inline markup', () => {
    const root = dist({ 'index.html': page('<p>Now: <em>[current</em> project]</p>') });
    expect(checkPlaceholders(root).length).toBeGreaterThan(0);
  });

  it('reports every page that has one', () => {
    const root = dist({
      'index.html': page('<p>[one]</p>'),
      '404.html': page('<p>[two]</p>'),
    });
    const msg = checkPlaceholders(root).join('\n');
    expect(msg).toContain('[one]');
    expect(msg).toContain('[two]');
  });

  it('passes the same text inside a marked sample block', () => {
    const root = dist({
      'styleguide/index.html': page(
        `<section ${SAMPLE_ATTRIBUTE}><p>[current project]</p></section>`,
      ),
    });
    expect(checkPlaceholders(root)).toEqual([]);
  });

  it('exempts a nested element inside the marked block but not the text after it', () => {
    const root = dist({
      'styleguide/index.html': page(
        `<div ${SAMPLE_ATTRIBUTE}><div><p>[inside]</p></div></div><p>[outside]</p>`,
      ),
    });
    const msg = checkPlaceholders(root).join('\n');
    expect(msg).toContain('[outside]');
    expect(msg).not.toContain('[inside]');
  });

  it('ignores brackets in script, style and ld+json content', () => {
    const root = dist({
      'index.html': page(
        '<p>Hello</p>' +
          '<script>const a = [1, 2]; a[0] = "[x]";</script>' +
          '<style>a[href^="http"] { color: red }</style>' +
          '<script type="application/ld+json">{"sameAs":["https://a","https://b"]}</script>',
        '<script>var q = [];</script>',
      ),
    });
    expect(checkPlaceholders(root)).toEqual([]);
  });

  it('ignores brackets in attribute values', () => {
    const root = dist({
      'index.html': page('<a href="/x" data-list="[1,2]" aria-label="[none]">Link</a>'),
    });
    expect(checkPlaceholders(root)).toEqual([]);
  });

  it('ignores brackets in HTML comments', () => {
    const root = dist({ 'index.html': page('<!-- [todo] --><p>Hi</p>') });
    expect(checkPlaceholders(root)).toEqual([]);
  });

  it('fails closed when dist has no pages', () => {
    const root = dist({ 'readme.txt': 'x' });
    expect(checkPlaceholders(root).join('\n')).toMatch(/no pages/i);
  });
});
