import { describe, expect, it, vi } from 'vitest';
import { initPrint } from './print';

// AC-11 (T30; sad §8 Script-only controls, Print). The "Print" button (`[data-print]`) asks the
// browser to print. Contract: initPrint({ document, print }); the click listener is on the button;
// `print` is window.print, injected. Nothing else happens on activation; no button, no error.

function setup(withButton = true) {
  let click: () => unknown = () => undefined;
  const button = {
    addEventListener: (type: string, listener: () => unknown) => {
      if (type === 'click') click = listener;
    },
  };
  const doc = {
    querySelector: (selector: string) =>
      withButton && selector.includes('data-print') ? button : null,
  };
  const print = vi.fn();
  initPrint({ document: doc, print } as never);
  return { print, click: () => click() };
}

describe('initPrint', () => {
  it('does not print before the button is activated', () => {
    const { print } = setup();
    expect(print).not.toHaveBeenCalled();
  });

  it('calls print once per activation', () => {
    const { print, click } = setup();
    click();
    expect(print).toHaveBeenCalledTimes(1);
    click();
    expect(print).toHaveBeenCalledTimes(2);
  });

  it('does nothing when the page has no Print button', () => {
    expect(() => setup(false)).not.toThrow();
  });
});
