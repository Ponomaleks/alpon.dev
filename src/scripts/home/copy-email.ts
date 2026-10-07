// Copy the email address (AC-14, AC-15; sad §8 Copy email). Activating the Copy button writes the
// address with the Clipboard API, then asks the Toast to confirm and marks the button done for a
// short time, as the design's CopyButton does (`data-done="true"`; the styles show "Copied").
// A refusal or a missing API gets the English hand-copy message and never "Copied". The script
// only sets and removes the attribute. The document, navigator and duration are injected.

interface CopyButton {
  getAttribute(name: string): string | null;
  setAttribute(name: string, value: string): void;
  removeAttribute(name: string): void;
  addEventListener(type: 'click', listener: () => unknown): void;
}

export interface CopyEmailEnv {
  document: {
    querySelector(selector: string): CopyButton | null;
    dispatchEvent(event: Event): boolean;
  };
  navigator: { clipboard?: { writeText(text: string): Promise<void> } };
  /** How long the button stays done: the --fjord-duration-copied token, in milliseconds. */
  duration: number;
}

const REFUSAL = "Couldn't copy. Select the address to copy it.";

export function initCopyEmail({ document: doc, navigator: nav, duration }: CopyEmailEnv): void {
  const button = doc.querySelector('[data-copy-email]');
  const address = button?.getAttribute('data-copy-email');
  if (!button || !address) return;

  const toast = (detail: Record<string, string>) =>
    doc.dispatchEvent(new CustomEvent('fjord:toast', { detail }));

  let timer: ReturnType<typeof setTimeout> | undefined;
  const reset = () => {
    clearTimeout(timer);
    timer = undefined;
    button.removeAttribute('data-done');
  };

  // The handler returns at once; the confirmation follows the write, never precedes it.
  button.addEventListener('click', () => {
    const write = nav.clipboard
      ? nav.clipboard.writeText(address)
      : Promise.reject(new Error('no clipboard'));
    write.then(
      () => {
        // A second copy during the done state starts the time again.
        clearTimeout(timer);
        button.setAttribute('data-done', 'true');
        timer = setTimeout(reset, duration);
        toast({ message: 'Copied', meta: address, icon: 'check' });
      },
      () => {
        reset();
        toast({ message: REFUSAL });
      },
    );
  });
}
