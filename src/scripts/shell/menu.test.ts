import { describe, expect, it } from 'vitest';
import { initMenu } from './menu';

// AC-04, AC-05, D-07, G-1, G-2, G-6 (T11). The mobile menu script: open through showModal,
// mirror aria-expanded, close on any link (no focus back to the button), close at 768 and wider,
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

  it('a link click never sends focus back to the menu button (G-1)', () => {
    const t = setup();
    t.clickButton();
    t.focused.length = 0;
    t.clickInside('link');
    expect(t.focused).not.toContain('button');
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
