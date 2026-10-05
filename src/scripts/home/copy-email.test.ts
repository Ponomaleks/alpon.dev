import { describe, expect, it } from 'vitest';
import { initCopyEmail } from './copy-email';

// AC-14, AC-15 (T14; sad §8 Copy email). Activating the Copy button writes the address with the
// Clipboard API, then dispatches `fjord:toast`. Success: "Kopiert" (lang "no"), the address as
// meta, icon "check". Refusal or no clipboard: the English refusal message, no icon, never
// "Kopiert". Contract: initCopyEmail({ document, navigator }); the button is
// `[data-copy-email]` and its attribute value is the address; the click listener is on it.

const ADDRESS = 'ponomaleks@gmail.com';
const REFUSAL = "Couldn't copy. Select the address to copy it.";

interface ToastDetail {
  message?: string;
  meta?: string;
  lang?: string;
  icon?: string;
}

function setup(clipboard: { writeText: (text: string) => Promise<void> } | undefined) {
  const toasts: ToastDetail[] = [];
  let click: () => unknown = () => undefined;
  const button = {
    getAttribute: (name: string) => (name === 'data-copy-email' ? ADDRESS : null),
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
  initCopyEmail({ document: doc, navigator: { clipboard } } as never);
  const press = async () => {
    await click();
    await new Promise((resolve) => setTimeout(resolve, 0));
  };
  return { toasts, press };
}

describe('initCopyEmail', () => {
  it('writes the address and confirms with Kopiert, the address and the check icon', async () => {
    const written: string[] = [];
    const { toasts, press } = setup({
      writeText: (text) => {
        written.push(text);
        return Promise.resolve();
      },
    });
    await press();
    expect(written).toEqual([ADDRESS]);
    expect(toasts).toEqual([{ message: 'Kopiert', lang: 'no', meta: ADDRESS, icon: 'check' }]);
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
    expect(toasts.map((t) => t.message)).toEqual(['Kopiert']);
  });

  it('tells the Visitor to copy by hand when the write is rejected, without icon or Kopiert', async () => {
    const { toasts, press } = setup({ writeText: () => Promise.reject(new Error('denied')) });
    await press();
    expect(toasts).toHaveLength(1);
    expect(toasts[0]?.message).toBe(REFUSAL);
    expect(toasts[0]?.icon).toBeUndefined();
    expect(JSON.stringify(toasts)).not.toContain('Kopiert');
  });

  it('gives the same refusal when the browser has no clipboard API', async () => {
    const { toasts, press } = setup(undefined);
    await press();
    expect(toasts).toHaveLength(1);
    expect(toasts[0]?.message).toBe(REFUSAL);
    expect(toasts[0]?.icon).toBeUndefined();
    expect(JSON.stringify(toasts)).not.toContain('Kopiert');
  });
});
