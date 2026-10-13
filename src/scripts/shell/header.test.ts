import { describe, expect, it } from 'vitest';
import { observeHeader } from './header';

// AC-03, D-13, ADR-0003 (T10). The header's scroll border: an IntersectionObserver on a top
// sentinel sets and removes `data-scrolled`. The script writes that one attribute only, never a
// class or an inline style. Browser behaviour is T20's.

type Callback = (entries: { isIntersecting: boolean }[]) => void;

function setup() {
  const writes: string[] = [];
  const attrs = new Map<string, string>();
  const header = {
    setAttribute(name: string, value: string) {
      writes.push(`set ${name}`);
      attrs.set(name, value);
    },
    removeAttribute(name: string) {
      writes.push(`remove ${name}`);
      attrs.delete(name);
    },
    toggleAttribute(name: string, force?: boolean) {
      const on = force ?? !attrs.has(name);
      writes.push(`toggle ${name}=${on}`);
      if (on) attrs.set(name, '');
      else attrs.delete(name);
      return on;
    },
    get classList(): never {
      throw new Error('the script must not touch classList');
    },
    get style(): never {
      throw new Error('the script must not touch style');
    },
  };
  const observed: unknown[] = [];
  let callback: Callback = () => {};
  class FakeObserver {
    constructor(cb: Callback) {
      callback = cb;
    }
    observe(target: unknown) {
      observed.push(target);
    }
    disconnect() {}
  }
  const sentinel = { id: 'sentinel' };
  observeHeader(header as never, sentinel as never, FakeObserver as never);
  return {
    attrs,
    writes,
    observed,
    sentinel,
    fire: (isIntersecting: boolean) => callback([{ isIntersecting }]),
  };
}

describe('observeHeader', () => {
  it('observes the sentinel', () => {
    const t = setup();
    expect(t.observed).toEqual([t.sentinel]);
  });

  it('sets data-scrolled when the sentinel has left the viewport', () => {
    const t = setup();
    t.fire(false);
    expect(t.attrs.has('data-scrolled')).toBe(true);
  });

  it('removes data-scrolled when the sentinel is back in view', () => {
    const t = setup();
    t.fire(false);
    t.fire(true);
    expect(t.attrs.has('data-scrolled')).toBe(false);
  });

  it('writes only the data-scrolled attribute', () => {
    const t = setup();
    t.fire(false);
    t.fire(true);
    expect(t.writes.length).toBeGreaterThan(0);
    for (const w of t.writes) expect(w).toMatch(/data-scrolled/);
  });
});
