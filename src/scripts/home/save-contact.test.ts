import { describe, expect, it } from 'vitest';
import { initSaveContact } from './save-contact';

// save-contact-hint AC-03, AC-04, AC-05 (T5). The script opens the sheet after a click on a
// contact card action on a touch device, never prevents the click, and closes the sheet on
// "Got it" and on a tap outside it. Escape is platform behaviour of the modal dialog.

type Listener = (event: unknown) => void;

function setup(opts: { touch?: boolean; showModal?: boolean; links?: number } = {}) {
  const calls: string[] = [];
  const listeners = new Map<string, Listener[]>();
  const on = (map: Map<string, Listener[]>, type: string, fn: Listener) =>
    map.set(type, [...(map.get(type) ?? []), fn]);

  const gotIt = { listeners: new Map<string, Listener[]>() };
  const dialog: Record<string, unknown> = {
    open: false,
    addEventListener: (type: string, fn: Listener) => on(listeners, type, fn),
    close() {
      if (!dialog.open) return;
      calls.push('close');
      dialog.open = false;
      for (const fn of listeners.get('close') ?? []) fn({ type: 'close' });
    },
    querySelector: (selector: string) =>
      selector === 'button'
        ? { addEventListener: (type: string, fn: Listener) => on(gotIt.listeners, type, fn) }
        : null,
    getBoundingClientRect: () => ({ left: 0, right: 390, top: 500, bottom: 844 }),
  };
  if (opts.showModal ?? true)
    dialog.showModal = () => {
      calls.push('showModal');
      dialog.open = true;
    };

  const links = Array.from({ length: opts.links ?? 3 }, (_, i) => {
    const own = new Map<string, Listener[]>();
    return {
      name: `link-${i}`,
      addEventListener: (type: string, fn: Listener) => on(own, type, fn),
      focus: () => calls.push(`focus link-${i}`),
      click() {
        let prevented = false;
        const event = { preventDefault: () => (prevented = true) };
        for (const fn of own.get('click') ?? []) fn(event);
        return prevented;
      },
    };
  });

  const touch = { matches: opts.touch ?? true };
  initSaveContact({ dialog: dialog as never, links: links as never, touch });

  return {
    calls,
    dialog,
    links,
    touch,
    gotIt: () => {
      for (const fn of gotIt.listeners.get('click') ?? []) fn({});
    },
    tap: (x: number, y: number, target: unknown = dialog) => {
      for (const fn of listeners.get('click') ?? []) fn({ target, clientX: x, clientY: y });
    },
    escape: () => (dialog.close as () => void)(),
  };
}

describe('initSaveContact: opening (AC-03)', () => {
  it('opens the sheet as a modal on a click on a touch device and never prevents the click', () => {
    const s = setup();
    for (const link of s.links) {
      expect(link.click()).toBe(false);
      expect(s.dialog.open).toBe(true);
      s.gotIt();
    }
    expect(s.calls.filter((c) => c === 'showModal')).toHaveLength(3);
  });

  it('opens it on every activation', () => {
    const s = setup();
    s.links[0]?.click();
    s.gotIt();
    s.links[0]?.click();
    expect(s.calls.filter((c) => c === 'showModal')).toHaveLength(2);
    expect(s.dialog.open).toBe(true);
  });

  it('does not call showModal again while the sheet is open', () => {
    const s = setup();
    s.links[0]?.click();
    s.links[1]?.click();
    expect(s.calls.filter((c) => c === 'showModal')).toHaveLength(1);
  });
});

describe('initSaveContact: not opening (AC-05)', () => {
  it('leaves the click alone on a device that is not a touch device', () => {
    const s = setup({ touch: false });
    expect(s.links[0]?.click()).toBe(false);
    expect(s.calls).toEqual([]);
  });

  it('reads the device at the time of the click', () => {
    const s = setup({ touch: false });
    s.touch.matches = true;
    s.links[0]?.click();
    expect(s.calls).toEqual(['showModal']);
  });

  it('does nothing where the browser has no showModal', () => {
    const s = setup({ showModal: false });
    expect(s.links[0]?.click()).toBe(false);
    expect(s.dialog.open).toBe(false);
  });
});

describe('initSaveContact: closing (AC-04)', () => {
  it('"Got it" closes the sheet and focus returns to the action that opened it', () => {
    const s = setup();
    s.links[1]?.click();
    s.gotIt();
    expect(s.dialog.open).toBe(false);
    expect(s.calls).toEqual(['showModal', 'close', 'focus link-1']);
  });

  it('a tap outside the sheet closes it; a tap inside does not', () => {
    const s = setup();
    s.links[0]?.click();
    s.tap(200, 600);
    expect(s.dialog.open).toBe(true);
    s.tap(200, 700, { inside: true });
    expect(s.dialog.open).toBe(true);
    s.tap(200, 100);
    expect(s.dialog.open).toBe(false);
    expect(s.calls.at(-1)).toBe('focus link-0');
  });

  it('Escape (the dialog closing by itself) also returns focus to the action', () => {
    const s = setup();
    s.links[2]?.click();
    s.escape();
    expect(s.calls).toEqual(['showModal', 'close', 'focus link-2']);
  });
});
