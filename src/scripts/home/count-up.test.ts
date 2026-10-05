import { describe, expect, it } from 'vitest';
import { initCountUp } from './count-up';

// AC-06, sad §8 Count-up (T11). Each value counts once from zero to its final number when the
// panel first comes into view, keeping prefix and suffix. Under reduced motion or without
// IntersectionObserver the script writes nothing: the final numbers stay as printed.
// Contract: initCountUp(root, env). `root` is the panel; its counting copies are the
// `[data-count-to]` elements (with `data-prefix` / `data-suffix`); the script sets
// `data-count-state` on the root (never hides anything). Browser behaviour is T20's.

type Callback = (entries: { isIntersecting: boolean }[]) => void;

function setup(
  items: [number, string, string][],
  opts: { reducedMotion?: boolean; observer?: boolean } = {},
) {
  const rootWrites: string[] = [];
  const textWrites: string[] = [];
  const els = items.map(([to, prefix, suffix]) => {
    const attrs: Record<string, string> = {
      'data-count-to': String(to),
      'data-prefix': prefix,
      'data-suffix': suffix,
    };
    let text = `${prefix}${to}${suffix}`;
    return {
      get textContent() {
        return text;
      },
      set textContent(v: string) {
        text = v;
        textWrites.push(v);
      },
      getAttribute: (n: string) => attrs[n] ?? null,
      hasAttribute: (n: string) => n in attrs,
    };
  });
  const rootAttrs: Record<string, string> = {};
  const root = {
    querySelectorAll: () => els,
    setAttribute: (n: string, v: string) => {
      rootWrites.push(`${n}=${v}`);
      rootAttrs[n] = v;
    },
    removeAttribute: (n: string) => Reflect.deleteProperty(rootAttrs, n),
    getAttribute: (n: string) => rootAttrs[n] ?? null,
  };
  let callback: Callback = () => {};
  const observed: unknown[] = [];
  class FakeObserver {
    constructor(cb: Callback) {
      callback = cb;
    }
    observe(t: unknown) {
      observed.push(t);
    }
    unobserve() {}
    disconnect() {}
  }
  let queue: ((t: number) => void)[] = [];
  const env = {
    ObserverCtor: opts.observer === false ? null : FakeObserver,
    reducedMotion: opts.reducedMotion ?? false,
    frame: (cb: (t: number) => void) => void queue.push(cb),
  };
  initCountUp(root as never, env as never);
  /** Run the frames queued so far at timestamp `t`, once. */
  const tick = (t: number) => {
    const run = queue;
    queue = [];
    run.forEach((cb) => cb(t));
  };
  /** Play the animation through, from `t0` to well past any sane duration. */
  const finish = (t0 = 1000) => {
    for (let t = t0; t <= t0 + 10_000 && queue.length; t += 100) tick(t);
  };
  return {
    root,
    rootAttrs,
    rootWrites,
    textWrites,
    observed,
    queued: () => queue.length,
    tick,
    finish,
    fire: (isIntersecting = true) => callback([{ isIntersecting }]),
    texts: () => els.map((e) => e.textContent),
  };
}

const facts: [number, string, string][] = [
  [3, '', '+'],
  [40, '~', ''],
  [2000, '~', ''],
  [100, '', '+'],
];
const squash = (s: string) => s.replace(/[\s\u00a0\u202f]/g, '');
const digits = (s: string) => Number(squash(s).replace(/\D/g, ''));
const FINAL = ['3+', '~40', '~2000', '100+'];

describe('initCountUp', () => {
  it('observes the panel and writes nothing before it comes into view', () => {
    const t = setup(facts);
    expect(t.observed).toEqual([t.root]);
    expect(t.textWrites).toEqual([]);
    expect(t.queued()).toBe(0);
  });

  it('ignores an observer entry that is not intersecting', () => {
    const t = setup(facts);
    t.fire(false);
    expect(t.queued()).toBe(0);
    expect(t.textWrites).toEqual([]);
  });

  it('starts every value from zero, keeping its prefix and suffix', () => {
    const t = setup(facts);
    t.fire();
    t.tick(1000);
    expect(t.texts().map(squash)).toEqual(['0+', '~0', '~0', '0+']);
  });

  it('never goes down on the way and ends on the exact final value, prefix and suffix kept', () => {
    const t = setup(facts);
    t.fire();
    t.tick(1000);
    let last = [0, 0, 0, 0];
    for (let at = 1100; at <= 11_000; at += 100) {
      t.tick(at);
      const now = t.texts().map(digits);
      now.forEach((n, i) => expect(n).toBeGreaterThanOrEqual(last[i]));
      last = now;
    }
    expect(t.texts().map(squash)).toEqual(FINAL);
    expect(t.queued()).toBe(0);
  });

  it('shows a value between zero and the final one part-way through', () => {
    const t = setup([[2000, '~', '']]);
    t.fire();
    t.tick(1000);
    let mid = 0;
    for (let at = 1100; at <= 11_000 && t.queued(); at += 100) {
      t.tick(at);
      const n = digits(t.texts()[0]);
      if (n > 0 && n < 2000) mid++;
    }
    expect(mid).toBeGreaterThan(0);
  });

  it('counts once only: a second intersection, during or after, starts nothing', () => {
    const t = setup(facts);
    t.fire();
    t.tick(1000);
    t.fire();
    expect(t.queued()).toBe(1);
    t.finish(1100);
    const written = t.textWrites.length;
    t.fire();
    t.fire();
    expect(t.queued()).toBe(0);
    t.finish(20_000);
    expect(t.textWrites.length).toBe(written);
    expect(t.texts().map(squash)).toEqual(FINAL);
  });

  it('sets a state attribute on the panel when counting starts', () => {
    const t = setup(facts);
    expect(t.rootAttrs['data-count-state']).toBeUndefined();
    t.fire();
    t.tick(1000);
    expect(t.rootAttrs['data-count-state']).toBeDefined();
  });

  it('does nothing under reduced motion: no observer, no writes, final values stay', () => {
    const t = setup(facts, { reducedMotion: true });
    expect(t.observed).toEqual([]);
    t.fire();
    t.finish();
    expect(t.textWrites).toEqual([]);
    expect(t.rootWrites).toEqual([]);
    expect(t.texts().map(squash)).toEqual(FINAL);
  });

  it('does nothing without IntersectionObserver', () => {
    const t = setup(facts, { observer: false });
    t.finish();
    expect(t.textWrites).toEqual([]);
    expect(t.rootWrites).toEqual([]);
    expect(t.texts().map(squash)).toEqual(FINAL);
  });
});
