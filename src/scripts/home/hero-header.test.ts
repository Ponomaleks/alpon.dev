import { describe, expect, it } from 'vitest';
import { initHeroHeader } from './hero-header';

// AC-33 (ADR-0001, sad §8 Header over the hero). The header carries `data-over-hero` from the
// server; the page script removes it once the hero no longer reaches below the header and puts it
// back when it does. The elements, the observer and the page event target are injected; the page
// entry only calls initHeroHeader() with the real ones. The script writes that one attribute.

const ATTR = 'data-over-hero';
const HEADER_HEIGHT = 64;

type Entry = { isIntersecting: boolean };

function setup(heroBottom: number, over = true) {
  const header = {
    attrs: (over ? { [ATTR]: '' } : {}) as Record<string, string>,
    getBoundingClientRect: () => ({ top: 0, bottom: HEADER_HEIGHT, height: HEADER_HEIGHT }),
    getAttribute(n: string) {
      return this.attrs[n] ?? null;
    },
    hasAttribute(n: string) {
      return n in this.attrs;
    },
    setAttribute(n: string, v: string) {
      this.attrs[n] = v;
    },
    removeAttribute(n: string) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete -- a fake of Element
      delete this.attrs[n];
    },
  };
  const hero = {
    bottom: heroBottom,
    getBoundingClientRect() {
      return { top: this.bottom - 600, bottom: this.bottom, height: 600 };
    },
  };
  const observers: {
    callback: (entries: Entry[]) => void;
    options?: { rootMargin?: string };
    observed: unknown[];
  }[] = [];
  class FakeObserver {
    private readonly record: (typeof observers)[number];
    constructor(callback: (entries: Entry[]) => void, options?: { rootMargin?: string }) {
      this.record = { callback, options, observed: [] };
      observers.push(this.record);
    }
    observe(target: unknown) {
      this.record.observed.push(target);
    }
    disconnect() {
      this.record.observed.length = 0;
    }
    unobserve() {}
  }
  const listeners: Record<string, ((event: unknown) => void)[]> = {};
  const target = {
    addEventListener(type: string, fn: (event: unknown) => void) {
      (listeners[type] ??= []).push(fn);
    },
    removeEventListener() {},
  };
  const init = () =>
    initHeroHeader({
      header: header as unknown as Element,
      hero: hero as unknown as Element,
      ObserverCtor: FakeObserver as unknown as typeof IntersectionObserver,
      target: target as unknown as EventTarget,
    });
  /** The hero moves; the observer (any of those created) reports a crossing. */
  const scrollTo = (bottom: number) => {
    hero.bottom = bottom;
    for (const o of observers) o.callback([{ isIntersecting: bottom > HEADER_HEIGHT }]);
  };
  const pageshow = (persisted: boolean) => {
    for (const fn of listeners.pageshow ?? []) fn({ type: 'pageshow', persisted });
  };
  const over_ = () => header.hasAttribute(ATTR);
  return { header, hero, observers, listeners, init, scrollTo, pageshow, over: over_ };
}

describe('initHeroHeader: at start (AC-33)', () => {
  it('keeps the attribute at the top of the page, with the hero under the header', () => {
    const s = setup(600);
    s.init();
    expect(s.over()).toBe(true);
  });

  it('removes the attribute at once when the page starts scrolled past the hero', () => {
    const s = setup(20);
    s.init();
    // synchronous: no observer callback has run yet
    expect(s.over()).toBe(false);
  });

  it('treats a hero bottom exactly at the header bottom as having left', () => {
    const s = setup(HEADER_HEIGHT);
    s.init();
    expect(s.over()).toBe(false);
  });

  it('keeps the attribute while the hero bottom is one pixel below the header bottom', () => {
    const s = setup(HEADER_HEIGHT + 1);
    s.init();
    expect(s.over()).toBe(true);
  });

  it('puts the attribute back at start when the markup lacks it and the hero is under the header', () => {
    const s = setup(600, false);
    s.init();
    expect(s.over()).toBe(true);
  });
});

describe('initHeroHeader: on scroll (AC-33)', () => {
  it('observes the hero with a top root margin of minus the header height', () => {
    const s = setup(600);
    s.init();
    expect(s.observers.length).toBeGreaterThan(0);
    const last = s.observers[s.observers.length - 1];
    expect(last?.observed).toContain(s.hero);
    expect(last?.options?.rootMargin ?? '').toMatch(new RegExp(`^-${HEADER_HEIGHT}px(\\s|$)`));
  });

  it('removes the attribute as the hero leaves and restores it as the hero returns', () => {
    const s = setup(600);
    s.init();
    s.scrollTo(30);
    expect(s.over()).toBe(false);
    s.scrollTo(300);
    expect(s.over()).toBe(true);
    s.scrollTo(-200);
    expect(s.over()).toBe(false);
    s.scrollTo(HEADER_HEIGHT + 1);
    expect(s.over()).toBe(true);
  });

  it('writes only data-over-hero on the header', () => {
    const s = setup(600);
    s.init();
    s.scrollTo(0);
    s.scrollTo(500);
    expect(Object.keys(s.header.attrs)).toEqual([ATTR]);
    s.scrollTo(0);
    expect(Object.keys(s.header.attrs)).toEqual([]);
  });
});

describe('initHeroHeader: pageshow (AC-33)', () => {
  it('listens for pageshow', () => {
    const s = setup(600);
    s.init();
    expect(s.listeners.pageshow?.length ?? 0).toBeGreaterThan(0);
  });

  it('after a back-forward restore at a scrolled position the attribute is removed at once', () => {
    const s = setup(600);
    s.init();
    // the browser restores the scroll position without an observer callback
    s.hero.bottom = 10;
    s.pageshow(true);
    expect(s.over()).toBe(false);
  });

  it('after a restore at the top the attribute is back', () => {
    const s = setup(10);
    s.init();
    expect(s.over()).toBe(false);
    s.hero.bottom = 600;
    s.pageshow(true);
    expect(s.over()).toBe(true);
  });
});
