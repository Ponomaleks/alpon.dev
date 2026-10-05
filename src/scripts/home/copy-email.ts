// Copy the email address (AC-14, AC-15; sad §8 Copy email). Activating the Copy button writes the
// address with the Clipboard API, then asks the Toast to confirm. A refusal or a missing API gets
// the English hand-copy message and never "Kopiert". The document and navigator are injected.

interface CopyButton {
  getAttribute(name: string): string | null;
  addEventListener(type: 'click', listener: () => unknown): void;
}

export interface CopyEmailEnv {
  document: {
    querySelector(selector: string): CopyButton | null;
    dispatchEvent(event: Event): boolean;
  };
  navigator: { clipboard?: { writeText(text: string): Promise<void> } };
}

const REFUSAL = "Couldn't copy. Select the address to copy it.";

export function initCopyEmail({ document: doc, navigator: nav }: CopyEmailEnv): void {
  const button = doc.querySelector('[data-copy-email]');
  const address = button?.getAttribute('data-copy-email');
  if (!button || !address) return;

  const toast = (detail: Record<string, string>) =>
    doc.dispatchEvent(new CustomEvent('fjord:toast', { detail }));

  // The handler returns at once; the Toast follows the write, never precedes it.
  button.addEventListener('click', () => {
    const write = nav.clipboard
      ? nav.clipboard.writeText(address)
      : Promise.reject(new Error('no clipboard'));
    write.then(
      () => toast({ message: 'Kopiert', lang: 'no', meta: address, icon: 'check' }),
      () => toast({ message: REFUSAL }),
    );
  });
}
