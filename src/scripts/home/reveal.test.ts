import { describe, expect, it } from 'vitest';
import { initReveal } from './reveal';

// AC-36, sad §8 Section reveal (T15). Sections are visible by default. At start the script marks
// only sections that lie outside the viewport (`data-reveal="pending"`), sets `data-reveal="in"`
// when each first comes into view, never marks the target of the address fragment, and does
// nothing under reduced motion or without IntersectionObserver.
// Contract: initReveal(sections, env). `sections` are the elements to reveal; env carries the
// viewport height, the already resolved fragment target (or null), the observer class and the
// reduced-motion flag. Browser behaviour is checked by the e2e specs.

type Entry = { target: unknown; isIntersecting: boolean };
type Callback = (entries: Entry[]) => void;

const VIEWPORT = 800;

function makeSection(top: number, contains: (n: unknown) => boolean = () => false) {
  const writes: string[] = [];
  const attrs: Record<string, string> = {};
  return {
    writes,
    getBoundingClientRect: () => ({ top, bottom: top + 400, height: 400 }),
    setAttribute(n: string, v: string) {
      writes.push(`${n}=${v}`);
      attrs[n] = v;
    },
    getAttribute: (n: string) => attrs[n] ?? null,
    hasAttribute: (n: string) => n in attrs,
    removeAttribute: () => {},
    contains,
  };
}

function setup(
  sections: ReturnType<typeof makeSection>[],
  opts: { reducedMotion?: boolean; observer?: boolean; target?: unknown } = {},
) {
  let callback: Callback = () => {};
  const observed: unknown[] = [];
  const unobserved: unknown[] = [];
  class FakeObserver {
    constructor(cb: Callback) {
      callback = cb;
    }
    observe(t: unknown) {
      observed.push(t);
    }
    unobserve(t: unknown) {
      unobserved.push(t);
    }
    disconnect() {}
  }
  initReveal(
    sections as never,
    {
      viewportHeight: VIEWPORT,
      target: opts.target ?? null,
      ObserverCtor: opts.observer === false ? null : FakeObserver,
      reducedMotion: opts.reducedMotion ?? false,
    } as never,
  );
  return {
    observed,
    unobserved,
    intersect: (el: unknown, isIntersecting = true) => callback([{ target: el, isIntersecting }]),
  };
}

describe('initReveal (AC-36)', () => {
  it('marks a section below the viewport as pending', () => {
    const below = makeSection(VIEWPORT + 200);
    setup([below]);
    expect(below.getAttribute('data-reveal')).toBe('pending');
  });

  it('never marks a section that is in view at start', () => {
    const inView = makeSection(100);
    const straddling = makeSection(VIEWPORT - 50);
    setup([inView, straddling]);
    expect(inView.writes).toEqual([]);
    expect(straddling.writes).toEqual([]);
  });

  it('never marks the target of the address fragment, even below the viewport', () => {
    const target = { id: 'contact' };
    const contact = makeSection(VIEWPORT + 2000, (n) => n === target);
    const other = makeSection(VIEWPORT + 1000);
    setup([other, contact], { target });
    expect(contact.writes).toEqual([]);
    expect(other.getAttribute('data-reveal')).toBe('pending');
  });

  it('sets "in" once when a pending section first comes into view, then stops watching it', () => {
    const below = makeSection(VIEWPORT + 200);
    const run = setup([below]);
    expect(run.observed).toContain(below);
    run.intersect(below, false);
    expect(below.getAttribute('data-reveal')).toBe('pending');
    run.intersect(below);
    expect(below.getAttribute('data-reveal')).toBe('in');
    run.intersect(below, false);
    run.intersect(below);
    expect(below.writes).toEqual(['data-reveal=pending', 'data-reveal=in']);
    expect(run.unobserved).toContain(below);
  });

  it('writes nothing under reduced motion', () => {
    const below = makeSection(VIEWPORT + 200);
    const run = setup([below], { reducedMotion: true });
    expect(below.writes).toEqual([]);
    expect(run.observed).toEqual([]);
  });

  it('writes nothing without IntersectionObserver, so content stays visible', () => {
    const below = makeSection(VIEWPORT + 200);
    setup([below], { observer: false });
    expect(below.writes).toEqual([]);
  });
});
