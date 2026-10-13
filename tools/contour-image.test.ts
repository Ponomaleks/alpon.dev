import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { ridge } from '../src/components/brand/contour-paths.ts';
import { contourImage, IMAGE, TOKEN, TOKENS, tokenValue } from './contour-image.ts';

// release-1 AC-06, D-10: the contour image of the closing band and the mobile menu is generated
// from the ridge contour data and the spruce tone. The file is committed, so it is held to both.

const repo = fileURLToPath(new URL('../', import.meta.url));
const file = () => readFileSync(join(repo, IMAGE), 'utf8');
const tokens = readFileSync(join(repo, TOKENS), 'utf8');

describe('public/img/contours-ridge-spruce.svg', () => {
  it('carries the colour of the token --fjord-contour-line-spruce', () => {
    const declared = tokens.match(/--fjord-contour-line-spruce:\s*([^;]+);/)?.[1]?.trim();
    expect(declared).toMatch(/^rgba?\(/);
    const strokes = [...file().matchAll(/\sstroke="([^"]*)"/g)].map((m) => m[1]);
    expect(strokes).toEqual([declared]);
    expect(file()).not.toMatch(/var\(|currentColor|<style/);
  });

  it('holds the ridge contour data, one path per ring, in order', () => {
    const paths = [...file().matchAll(/<path\b[^>]*\sd="([^"]*)"/g)].map((m) => m[1]);
    expect(paths.length).toBeGreaterThan(0);
    expect(paths).toEqual([...ridge]);
  });

  it('keeps the view box and the 1 px lines of the Contours component', () => {
    expect(file()).toMatch(/^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" viewBox="0 0 85 55" /);
    expect(file()).toMatch(/\sfill="none"/);
    expect(file()).toMatch(/\sstroke-width="1"/);
    expect(file().match(/vector-effect="non-scaling-stroke"/g)).toHaveLength(ridge.length);
    // No size of its own: the <img> covers its layer.
    expect(file()).not.toMatch(/<svg\b[^>]*\s(?:width|height)=/);
  });

  it('is what the generator writes today (run `node tools/contour-image.ts` after a change)', () => {
    expect(file()).toBe(contourImage(ridge, tokenValue(tokens, TOKEN)));
  });
});

describe('tokenValue', () => {
  it('reads the first declaration of a custom property', () => {
    expect(tokenValue(':root{--a: 1px;--b: rgba(1, 2, 3, .4);}', '--b')).toBe('rgba(1, 2, 3, .4)');
  });

  it('does not take a longer name for the one asked for', () => {
    expect(tokenValue(':root{--b-wide: 2px; --b: 1px}', '--b')).toBe('1px');
  });

  it('fails when the property is not declared', () => {
    expect(() => tokenValue(':root{--a: 1px}', '--b')).toThrow(/--b is not declared/);
  });
});

describe('contourImage', () => {
  it('writes one path per ring with the given stroke', () => {
    expect(contourImage(['M0 0L1 1', 'M2 2L3 3'], 'red')).toBe(
      [
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 85 55" fill="none" stroke="red" stroke-width="1">',
        '<path d="M0 0L1 1" vector-effect="non-scaling-stroke"/>',
        '<path d="M2 2L3 3" vector-effect="non-scaling-stroke"/>',
        '</svg>',
        '',
      ].join('\n'),
    );
  });
});
