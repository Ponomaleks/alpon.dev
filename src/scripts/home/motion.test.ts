/* eslint-disable @typescript-eslint/no-dynamic-delete -- fakes of Storage and Element delete by key */
import { describe, expect, it } from 'vitest';
import { initMotion } from './motion';

// AC-30, AC-31 (sad §6 critical flow 2, ADR-0003). The document, session storage and media
// query are injected; the page script only calls initMotion with the real ones. The hero is
// [data-hero], the control [data-motion-control]; the script sets attributes only.

const REDUCED = '(prefers-reduced-motion: reduce)';

function setup(opts: { saved?: string; storage?: 'ok' | 'throws'; reduced?: boolean } = {}) {
  const { saved, storage = 'ok', reduced = false } = opts;
  const store: Record<string, string> = saved === undefined ? {} : { 'fjord-motion': saved };
  const hero = {
    attrs: {} as Record<string, string>,
    style: {} as Record<string, string>,
    className: '',
    getAttribute(n: string) {
      return this.attrs[n] ?? null;
    },
    setAttribute(n: string, v: string) {
      this.attrs[n] = v;
    },
    removeAttribute(n: string) {
      delete this.attrs[n];
    },
    hasAttribute(n: string) {
      return n in this.attrs;
    },
  };
  const button = {
    attrs: { 'aria-label': 'Pause animation', 'aria-pressed': 'false' } as Record<string, string>,
    listeners: {} as Record<string, () => void>,
    getAttribute(n: string) {
      return this.attrs[n] ?? null;
    },
    setAttribute(n: string, v: string) {
      this.attrs[n] = v;
    },
    addEventListener(type: string, fn: () => void) {
      this.listeners[type] = fn;
    },
  };
  const doc = {
    querySelector: (s: string) =>
      s === '[data-hero]' ? hero : s === '[data-motion-control]' ? button : null,
  };
  let mqListener: ((e: { matches: boolean }) => void) | undefined;
  const mq = {
    matches: reduced,
    addEventListener: (_t: string, fn: (e: { matches: boolean }) => void) => {
      mqListener = fn;
    },
  };
  const blocked = () => {
    throw new Error('blocked');
  };
  const env = {
    document: doc,
    storage: {
      getItem: (k: string) => (storage === 'throws' ? blocked() : (store[k] ?? null)),
      setItem: (k: string, v: string) => (storage === 'throws' ? blocked() : (store[k] = v)),
      removeItem: (k: string) => (storage === 'throws' ? blocked() : delete store[k]),
    },
    matchMedia: (q: string) => (q === REDUCED ? mq : { matches: false, addEventListener() {} }),
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initMotion(env as any);
  return {
    motion: () => hero.attrs['data-motion'],
    click: () => button.listeners['click']?.(),
    changeReduced: (matches: boolean) => {
      mq.matches = matches;
      mqListener?.({ matches });
    },
    button,
    store,
    hero,
  };
}

describe('initMotion (AC-30)', () => {
  it('sets data-motion="running" when nothing is saved', () => {
    expect(setup().motion()).toBe('running');
  });

  it('sets data-motion="paused" when "paused" is saved, and the control offers to play', () => {
    const t = setup({ saved: 'paused' });
    expect(t.motion()).toBe('paused');
    expect(t.button.attrs['aria-label']).toBe('Play animation');
    expect(t.button.attrs['aria-pressed']).toBe('true');
  });

  it('ignores an unknown saved value', () => {
    expect(setup({ saved: 'banana' }).motion()).toBe('running');
  });

  it('a click pauses: attribute, name and aria-pressed change and "paused" is stored', () => {
    const t = setup();
    t.click();
    expect(t.motion()).toBe('paused');
    expect(t.button.attrs['aria-label']).toBe('Play animation');
    expect(t.button.attrs['aria-pressed']).toBe('true');
    expect(t.store['fjord-motion']).toBe('paused');
  });

  it('a second click resumes: running, "Pause animation", not pressed, the value is cleared', () => {
    const t = setup();
    t.click();
    t.click();
    expect(t.motion()).toBe('running');
    expect(t.button.attrs['aria-label']).toBe('Pause animation');
    expect(t.button.attrs['aria-pressed']).toBe('false');
    expect(t.store).not.toHaveProperty('fjord-motion');
  });

  it('ignores a throwing storage and the choice still applies', () => {
    const t = setup({ storage: 'throws' });
    expect(t.motion()).toBe('running');
    t.click();
    expect(t.motion()).toBe('paused');
    expect(t.button.attrs['aria-pressed']).toBe('true');
    t.click();
    expect(t.motion()).toBe('running');
  });

  it('sets attributes only: no class and no inline style on the hero', () => {
    const t = setup();
    t.click();
    expect(t.hero.className).toBe('');
    expect(t.hero.style).toEqual({});
  });
});

describe('initMotion under reduced motion (AC-31)', () => {
  it('sets no data-motion attribute, even with a saved "paused"', () => {
    expect(setup({ reduced: true }).motion()).toBeUndefined();
    expect(setup({ reduced: true, saved: 'paused' }).motion()).toBeUndefined();
  });

  it('removes the attribute when the device setting changes to reduce later', () => {
    const t = setup();
    expect(t.motion()).toBe('running');
    t.changeReduced(true);
    expect(t.motion()).toBeUndefined();
  });
});
