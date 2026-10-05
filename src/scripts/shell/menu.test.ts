import { afterEach, describe, expect, it } from 'vitest';
import { initMenu } from './menu';

// AC-04, AC-05, D-07, G-1, G-2, G-6 (T11). The mobile menu script: open through showModal,
// mirror aria-expanded, close on any link (focus to the same-page hash target, G-1), close at 768 and wider,
// and leave the panel open on a theme change. Focus return after Escape is platform behaviour.

type Listener = (event: unknown) => void;

function setup(opts: { showModal?: boolean } = {}) {
  const hasShowModal = opts.showModal ?? true;
  const calls: string[] = [];
  const focused: string[] = [];
  const listeners = new Map<string, Listener[]>();
  const add = (map: Map<string, Listener[]>, type: string, fn: Listener) =>
    map.set(type, [...(map.get(type) ?? []), fn]);

  const dialog: Record<string, unknown> = {
    open: false,
    addEventListener: (type: string, fn: Listener) => add(listeners, type, fn),
    close() {
      calls.push('close');
      if (!dialog.open) return;
      dialog.open = false;
      for (const fn of listeners.get('close') ?? []) fn({ type: 'close' });
    },
    // The wordmark link is the first <a> in the panel; the opening focus must go to the first
    // navigation link, which only the [data-menu-nav] hook selects.
    querySelector: (selector: string) =>
      selector.includes('data-menu-nav') ? firstLink : wordmark,
  };
  if (hasShowModal)
    dialog.showModal = () => {
      calls.push('showModal');
      dialog.open = true;
    };

  const wordmark = { focus: () => focused.push('wordmark') };
  const firstLink = { focus: () => focused.push('first-link') };
  const attrs = new Map<string, string>([['aria-expanded', 'false']]);
  const buttonListeners = new Map<string, Listener[]>();
  const button = {
    setAttribute: (n: string, v: string) => attrs.set(n, v),
    getAttribute: (n: string) => attrs.get(n) ?? null,
    addEventListener: (type: string, fn: Listener) => add(buttonListeners, type, fn),
    focus: () => focused.push('button'),
  };

  const mqListeners: Listener[] = [];
  const mq = {
    matches: false,
    addEventListener: (_: string, fn: Listener) => mqListeners.push(fn),
  };

  initMenu(dialog as never, button as never, mq as never);

  const target = (kind: 'link' | 'button') => ({
    closest: (sel: string) => (kind === 'link' && sel.startsWith('a') ? {} : null),
  });
  return {
    dialog,
    attrs,
    calls,
    focused,
    mq,
    listenersClick: (event: unknown) => listeners.get('click')?.forEach((fn) => fn(event)),
    clickButton: () => buttonListeners.get('click')?.forEach((fn) => fn({})),
    clickInside: (kind: 'link' | 'button') =>
      listeners.get('click')?.forEach((fn) => fn({ target: target(kind) })),
    setWidth: (matches: boolean) => {
      mq.matches = matches;
      mqListeners.forEach((fn) => fn({ matches }));
    },
  };
}

describe('initMenu', () => {
  it('opens through showModal and sets aria-expanded="true"', () => {
    const t = setup();
    t.clickButton();
    expect(t.calls).toContain('showModal');
    expect(t.dialog.open).toBe(true);
    expect(t.attrs.get('aria-expanded')).toBe('true');
  });

  it('puts focus on the first navigation link, not the wordmark, after opening', () => {
    const t = setup();
    t.clickButton();
    expect(t.focused).toEqual(['first-link']);
  });

  it('aria-expanded follows the open state when the dialog closes by itself (Escape)', () => {
    const t = setup();
    t.clickButton();
    (t.dialog.close as () => void)();
    expect(t.attrs.get('aria-expanded')).toBe('false');
  });

  it('closes on a link click', () => {
    const t = setup();
    t.clickButton();
    t.clickInside('link');
    expect(t.dialog.open).toBe(false);
    expect(t.attrs.get('aria-expanded')).toBe('false');
  });

  // G-1 (R3): dialog.close() hands focus back to the opener like the platform does, so the
  // script must move focus to the hash target only after close() has returned.
  describe('focus after a link click (G-1)', () => {
    type Anchor = { pathname: string; hash: string; closest: (sel: string) => unknown };

    function linkSetup(opts: { targetTabIndex?: number; noTarget?: boolean } = {}) {
      const events: string[] = [];
      const t = setup();
      const realClose = t.dialog.close as () => void;
      // Like the platform: closing a modal dialog returns focus to the element that opened it.
      t.dialog.close = () => {
        realClose();
        events.push('close');
        events.push('focus:button');
      };
      const tabIndex = opts.targetTabIndex ?? -1;
      const attrs = new Map<string, string>();
      let focusArgs: unknown[] = [];
      const hashTarget = {
        id: 'contact',
        get tabIndex() {
          return attrs.has('tabindex') ? Number(attrs.get('tabindex')) : tabIndex;
        },
        hasAttribute: (n: string) => attrs.has(n),
        getAttribute: (n: string) => attrs.get(n) ?? null,
        setAttribute: (n: string, v: string) => {
          attrs.set(n, v);
          events.push(`set:${n}=${v}`);
        },
        focus: (...args: unknown[]) => {
          focusArgs = args;
          events.push('focus:target');
        },
        scrollIntoView: () => events.push('scroll'),
      };
      const doc = {
        getElementById: (id: string) => (!opts.noTarget && id === 'contact' ? hashTarget : null),
      };
      (globalThis as Record<string, unknown>).document = doc;
      (t.dialog as Record<string, unknown>).ownerDocument = doc;
      (globalThis as Record<string, unknown>).location = {
        pathname: '/',
        origin: 'https://x.test',
      };
      const click = (pathname: string, hash: string) => {
        const a: Anchor = { pathname, hash, closest: () => a };
        t.listenersClick({ target: a });
      };
      return { t, events, attrs, hashTarget, click, focusArgs: () => focusArgs };
    }

    afterEach(() => {
      delete (globalThis as Record<string, unknown>).document;
      delete (globalThis as Record<string, unknown>).location;
    });

    it('closes first, then focuses the hash target, so focus does not end on the button', () => {
      const s = linkSetup();
      s.t.clickButton();
      s.click('/', '#contact');
      expect(s.events.indexOf('close')).toBeGreaterThanOrEqual(0);
      expect(s.events.indexOf('focus:target')).toBeGreaterThan(s.events.indexOf('focus:button'));
      expect(s.events[s.events.length - 1]).toBe('focus:target');
    });

    it('lets the target scroll into view (no preventScroll)', () => {
      const s = linkSetup();
      s.t.clickButton();
      s.click('/', '#contact');
      expect(JSON.stringify(s.focusArgs())).not.toContain('"preventScroll":true');
    });

    it('adds tabindex="-1" before focusing a target that is not focusable', () => {
      const s = linkSetup({ targetTabIndex: -1 });
      s.t.clickButton();
      s.click('/', '#contact');
      expect(s.attrs.get('tabindex')).toBe('-1');
      expect(s.events.indexOf('set:tabindex=-1')).toBeLessThan(s.events.indexOf('focus:target'));
    });

    it('leaves a natively focusable target (a link or button) without a tabindex', () => {
      const s = linkSetup({ targetTabIndex: 0 });
      s.t.clickButton();
      s.click('/', '#contact');
      expect(s.attrs.has('tabindex')).toBe(false);
      expect(s.events).toContain('focus:target');
    });

    it('does not move focus for a link to another page', () => {
      const s = linkSetup();
      s.t.clickButton();
      s.click('/cv', '#contact');
      expect(s.events).toContain('close');
      expect(s.events).not.toContain('focus:target');
      expect(s.attrs.has('tabindex')).toBe(false);
    });

    it('does not move focus for a same-page link without a hash, or with a missing target', () => {
      const a = linkSetup();
      a.t.clickButton();
      a.click('/', '');
      expect(a.events).not.toContain('focus:target');
      const b = linkSetup({ noTarget: true });
      b.t.clickButton();
      expect(() => b.click('/', '#contact')).not.toThrow();
      expect(b.events).not.toContain('focus:target');
    });
  });

  it('closes when the 768 media query matches (G-2)', () => {
    const t = setup();
    t.clickButton();
    t.setWidth(true);
    expect(t.dialog.open).toBe(false);
    expect(t.attrs.get('aria-expanded')).toBe('false');
  });

  it('does not close when the query stops matching, or while closed', () => {
    const t = setup();
    t.clickButton();
    t.setWidth(false);
    expect(t.dialog.open).toBe(true);
  });

  it('stays open when something other than a link is activated, such as a theme segment (G-6)', () => {
    const t = setup();
    t.clickButton();
    t.clickInside('button');
    expect(t.dialog.open).toBe(true);
    expect(t.attrs.get('aria-expanded')).toBe('true');
  });

  it('does not throw when showModal is missing', () => {
    const t = setup({ showModal: false });
    expect(() => t.clickButton()).not.toThrow();
    expect(t.attrs.get('aria-expanded')).toBe('false');
  });
});
