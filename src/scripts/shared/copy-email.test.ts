import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { initCopyEmail } from './copy-email';

// AC-14, AC-15 (T14; sad §8 Copy email). Activating the Copy button writes the address with the
// Clipboard API, then dispatches `fjord:toast`. Success: "Copied" (English, no lang), the address as
// meta, icon "check". Refusal or no clipboard: the English refusal message, no icon, never
// "Copied". Contract: initCopyEmail({ document, navigator }); the button is
// `[data-copy-email]` and its attribute value is the address; the click listener is on it.
// Owner's design review (reverses D-18): after a successful write the button also carries
// `data-done="true"` for `duration` milliseconds (the --fjord-duration-copied token, injected),
// as the design's CopyButton does. The script only sets and removes that attribute.

const ADDRESS = 'ponomaleks@gmail.com';
const REFUSAL = "Couldn't copy. Select the address to copy it.";
const DURATION = 1800;

interface ToastDetail {
  message?: string;
  meta?: string;
  lang?: string;
  icon?: string;
}

function setup(
  clipboard: { writeText: (text: string) => Promise<void> } | undefined,
  extraAttrs: Record<string, string> = {},
) {
  const toasts: ToastDetail[] = [];
  let click: () => unknown = () => undefined;
  const attrs = new Map<string, string>([
    ['data-copy-email', ADDRESS],
    ...Object.entries(extraAttrs),
  ]);
  const button = {
    getAttribute: (name: string) => attrs.get(name) ?? null,
    setAttribute: (name: string, value: string) => void attrs.set(name, value),
    removeAttribute: (name: string) => void attrs.delete(name),
    addEventListener: (type: string, listener: () => unknown) => {
      if (type === 'click') click = listener;
    },
  };
  const doc = {
    querySelector: (selector: string) => (selector.includes('data-copy-email') ? button : null),
    dispatchEvent: (event: { type: string; detail?: ToastDetail }) => {
      if (event.type === 'fjord:toast' && event.detail) toasts.push(event.detail);
      return true;
    },
  };
  initCopyEmail({ document: doc, navigator: { clipboard }, duration: DURATION } as never);
  const press = async () => {
    await click();
    await new Promise((resolve) => setTimeout(resolve, 0));
  };
  return { toasts, press, click: () => click(), done: () => attrs.get('data-done') ?? null };
}

describe('initCopyEmail', () => {
  it('writes the address and confirms with Copied, the address and the check icon', async () => {
    const written: string[] = [];
    const { toasts, press } = setup({
      writeText: (text) => {
        written.push(text);
        return Promise.resolve();
      },
    });
    await press();
    expect(written).toEqual([ADDRESS]);
    expect(toasts).toEqual([{ message: 'Copied', meta: ADDRESS, icon: 'check' }]);
  });

  it('shows no confirmation before the write has resolved', async () => {
    let resolve: () => void = () => undefined;
    const { toasts, press } = setup({
      writeText: () =>
        new Promise<void>((r) => {
          resolve = r;
        }),
    });
    await press();
    expect(toasts).toEqual([]);
    resolve();
    await new Promise((r) => setTimeout(r, 0));
    expect(toasts.map((t) => t.message)).toEqual(['Copied']);
  });

  it('tells the Visitor to copy by hand when the write is rejected, without icon or Copied', async () => {
    const { toasts, press } = setup({ writeText: () => Promise.reject(new Error('denied')) });
    await press();
    expect(toasts).toHaveLength(1);
    expect(toasts[0]?.message).toBe(REFUSAL);
    expect(toasts[0]?.icon).toBeUndefined();
    expect(JSON.stringify(toasts)).not.toContain('Copied');
  });

  it('gives the same refusal when the browser has no clipboard API', async () => {
    const { toasts, press } = setup(undefined);
    await press();
    expect(toasts).toHaveLength(1);
    expect(toasts[0]?.message).toBe(REFUSAL);
    expect(toasts[0]?.icon).toBeUndefined();
    expect(JSON.stringify(toasts)).not.toContain('Copied');
  });
});

describe('the done state of the Copy button', () => {
  beforeEach(() => void vi.useFakeTimers());
  afterEach(() => void vi.useRealTimers());

  const ok = { writeText: () => Promise.resolve() };
  const denied = { writeText: () => Promise.reject(new Error('denied')) };
  const settle = () => vi.advanceTimersByTimeAsync(0);

  it('marks the button done only after the write has resolved', async () => {
    let resolve: () => void = () => undefined;
    const { click, done } = setup({
      writeText: () =>
        new Promise<void>((r) => {
          resolve = r;
        }),
    });
    click();
    await settle();
    expect(done()).toBeNull();
    resolve();
    await settle();
    expect(done()).toBe('true');
  });

  it('clears the mark after the duration, not before', async () => {
    const { click, done } = setup(ok);
    click();
    await settle();
    await vi.advanceTimersByTimeAsync(DURATION - 1);
    expect(done()).toBe('true');
    await vi.advanceTimersByTimeAsync(1);
    expect(done()).toBeNull();
  });

  it('never marks the button when the write is rejected or there is no clipboard', async () => {
    for (const clipboard of [denied, undefined]) {
      const { click, done } = setup(clipboard);
      click();
      await settle();
      expect(done()).toBeNull();
      await vi.advanceTimersByTimeAsync(DURATION);
      expect(done()).toBeNull();
    }
  });

  it('starts the time again on a second click during the done state', async () => {
    const { click, done } = setup(ok);
    click();
    await settle();
    await vi.advanceTimersByTimeAsync(1000);
    click();
    await settle();
    await vi.advanceTimersByTimeAsync(DURATION - 1);
    expect(done()).toBe('true');
    await vi.advanceTimersByTimeAsync(1);
    expect(done()).toBeNull();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('drops the mark at once when a later click is refused', async () => {
    let allow = true;
    const { click, done, toasts } = setup({
      writeText: () => (allow ? Promise.resolve() : Promise.reject(new Error('denied'))),
    });
    click();
    await settle();
    expect(done()).toBe('true');
    allow = false;
    click();
    await settle();
    expect(done()).toBeNull();
    expect(toasts.map((t) => t.message)).toEqual(['Copied', REFUSAL]);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('still asks for the Toast exactly once per click', async () => {
    const { click, toasts } = setup(ok);
    click();
    await settle();
    expect(toasts).toHaveLength(1);
    click();
    await settle();
    expect(toasts).toHaveLength(2);
    await vi.advanceTimersByTimeAsync(DURATION * 2);
    expect(toasts).toHaveLength(2);
  });
});

// T13 (AC-02, AC-04, AC-23; sad §8): the module holds no Norwegian text. The button carries the
// language and the texts: data-copy-lang, data-copy-done-label, data-copy-refusal.
describe('a button that follows the language of the page', () => {
  const NO = {
    'data-copy-lang': 'no',
    'data-copy-done-label': 'Kopiert',
    'data-copy-refusal': 'Kunne ikke kopiere. Marker adressen for å kopiere den.',
  };
  const ok = { writeText: () => Promise.resolve() };
  const denied = { writeText: () => Promise.reject(new Error('denied')) };

  it('confirms with Kopiert, the address and lang "no"', async () => {
    const { toasts, press } = setup(ok, NO);
    await press();
    expect(toasts).toEqual([{ message: 'Kopiert', meta: ADDRESS, lang: 'no', icon: 'check' }]);
  });

  it('gives the refusal in the language of the button, marked with it', async () => {
    const { toasts, press } = setup(denied, NO);
    await press();
    expect(toasts).toEqual([{ message: NO['data-copy-refusal'], lang: 'no' }]);
  });

  it('gives the Norwegian refusal also when there is no clipboard API', async () => {
    const { toasts, press } = setup(undefined, NO);
    await press();
    expect(toasts[0]?.message).toBe(NO['data-copy-refusal']);
    expect(toasts[0]?.lang).toBe('no');
  });

  it('an English button sends no lang', async () => {
    const { toasts, press } = setup(ok);
    await press();
    expect(toasts[0]).not.toHaveProperty('lang');
  });
});
