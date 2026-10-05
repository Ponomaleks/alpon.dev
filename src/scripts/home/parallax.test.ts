import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { initParallax } from './parallax';

// AC-31 (T10; sad §1 Decision override, §8 Hero parallax). The hero's contours layer follows the
// pointer through two custom properties, written with style.setProperty only, never beyond
// --fjord-parallax-max (10px), and never under reduced motion or on a coarse pointer.
// The document and matchMedia are injected; [data-hero] gets the pointer listener and
// [data-contours-parallax] gets the properties.

const MAX = 10;
const REDUCED = '(prefers-reduced-motion: reduce)';
const RECT = { left: 100, top: 50, width: 1000, height: 500 };

type PointerFn = (e: { clientX: number; clientY: number }) => void;

function setup(opts: { reduced?: boolean; fine?: boolean } = {}) {
  const { reduced = false, fine = true } = opts;
  const writes: [string, string][] = [];
  const forbidden: string[] = [];
  const style = {
    setProperty(name: string, value: string) {
      writes.push([name, value]);
    },
    set cssText(_v: string) {
      forbidden.push('cssText');
    },
  };
  const layer = {
    style,
    setAttribute(name: string) {
      if (name === 'style') forbidden.push('setAttribute(style)');
    },
  };
  const listeners: Record<string, PointerFn> = {};
  const hero = {
    addEventListener(type: string, fn: PointerFn) {
      listeners[type] = fn;
    },
    getBoundingClientRect: () => ({
      ...RECT,
      right: RECT.left + RECT.width,
      bottom: RECT.top + RECT.height,
      x: RECT.left,
      y: RECT.top,
    }),
  };
  const doc = {
    querySelector: (s: string) =>
      s === '[data-hero]' ? hero : s === '[data-contours-parallax]' ? layer : null,
  };
  const matchMedia = (q: string) => ({
    matches: q === REDUCED ? reduced : q.includes('hover: hover') ? fine : false,
    addEventListener() {},
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initParallax({ document: doc, matchMedia } as any);
  const move = (x: number, y: number) => listeners.pointermove?.({ clientX: x, clientY: y });
  return { writes, forbidden, move };
}

const px = (v: string) => Number.parseFloat(v);
const last = (writes: [string, string][]) =>
  Object.fromEntries(writes.map(([n, v]) => [n, px(v)])) as Record<string, number>;

describe('initParallax with a fine pointer and motion allowed', () => {
  it('writes --fj-px and --fj-py with setProperty when the pointer moves over the hero', () => {
    const s = setup();
    s.move(RECT.left + RECT.width, RECT.top + RECT.height);
    expect(new Set(s.writes.map(([n]) => n))).toEqual(new Set(['--fj-px', '--fj-py']));
  });

  it('follows the pointer in the same direction and is neutral at the centre', () => {
    const mid = setup();
    mid.move(RECT.left + RECT.width / 2, RECT.top + RECT.height / 2);
    const centre = last(mid.writes);
    expect(Math.abs(centre['--fj-px'])).toBeLessThan(0.5);
    expect(Math.abs(centre['--fj-py'])).toBeLessThan(0.5);

    const far = setup();
    far.move(RECT.left + RECT.width, RECT.top + RECT.height);
    const end = last(far.writes);
    const near = setup();
    near.move(RECT.left, RECT.top);
    const start = last(near.writes);
    expect(end['--fj-px']).toBeGreaterThan(0);
    expect(end['--fj-py']).toBeGreaterThan(0);
    expect(start['--fj-px']).toBeLessThan(0);
    expect(start['--fj-py']).toBeLessThan(0);
  });

  it('never goes beyond the parallax maximum, also for a pointer outside the hero', () => {
    const s = setup();
    const points: [number, number][] = [
      [RECT.left, RECT.top],
      [RECT.left + RECT.width, RECT.top + RECT.height],
      [-5000, -5000],
      [9000, 9000],
      [RECT.left + 250, RECT.top + 400],
    ];
    for (const [x, y] of points) s.move(x, y);
    expect(s.writes.length).toBeGreaterThan(0);
    for (const [, v] of s.writes) {
      expect(Number.isFinite(px(v))).toBe(true);
      expect(Math.abs(px(v))).toBeLessThanOrEqual(MAX);
    }
  });

  it('writes no style attribute and no cssText', () => {
    const s = setup();
    s.move(RECT.left + 300, RECT.top + 100);
    expect(s.forbidden).toEqual([]);
  });
});

describe('initParallax writes nothing', () => {
  it('under reduced motion', () => {
    const s = setup({ reduced: true });
    s.move(RECT.left + 300, RECT.top + 100);
    s.move(RECT.left + RECT.width, RECT.top + RECT.height);
    expect(s.writes).toEqual([]);
    expect(s.forbidden).toEqual([]);
  });

  it('on a coarse pointer or without hover', () => {
    const s = setup({ fine: false });
    s.move(RECT.left + 300, RECT.top + 100);
    s.move(RECT.left + RECT.width, RECT.top + RECT.height);
    expect(s.writes).toEqual([]);
    expect(s.forbidden).toEqual([]);
  });
});

describe('parallax.ts source', () => {
  it('uses setProperty only: no setAttribute("style") and no cssText', () => {
    const src = readFileSync(new URL('./parallax.ts', import.meta.url), 'utf8');
    expect(src).toContain('setProperty');
    expect(src).not.toMatch(/cssText/);
    expect(src).not.toMatch(/setAttribute\(\s*['"`]style['"`]/);
  });
});
