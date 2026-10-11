// Copy the email address (AC-14, AC-15; sad §8 Copy email). Activating the Copy button writes the
// address with the Clipboard API, then asks the Toast to confirm and marks the button done for a
// short time, as the design's CopyButton does (`data-done="true"`; the styles show "Copied").
// A refusal or a missing API gets the hand-copy message and never "Copied". The language and the
// texts come from the button's attributes (data-copy-lang, data-copy-done-label,
// data-copy-refusal; English by default), so this module holds no other language. The script
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

const REFUSAL_EN = "Couldn't copy. Select the address to copy it.";
const REFUSAL_PHONE_EN = "Couldn't copy. Select the number to copy it.";

export function initCopyEmail(env: CopyEmailEnv): void {
  initCopy(env, 'data-copy-email', REFUSAL_EN);
}

/** The Copy button of the phone row (save-contact-hint AC-13): its value is the number without spaces. */
export function initCopyPhone(env: CopyEmailEnv): void {
  initCopy(env, 'data-copy-phone', REFUSAL_PHONE_EN);
}

function initCopy(
  { document: doc, navigator: nav, duration }: CopyEmailEnv,
  hook: string,
  refusalEn: string,
): void {
  const button = doc.querySelector(`[${hook}]`);
  const address = button?.getAttribute(hook);
  if (!button || !address) return;

  const lang = button.getAttribute('data-copy-lang') || undefined;
  const doneLabel = button.getAttribute('data-copy-done-label') || 'Copied';
  const refusal = button.getAttribute('data-copy-refusal') || refusalEn;

  const toast = (detail: Record<string, string>) =>
    doc.dispatchEvent(
      new CustomEvent('fjord:toast', { detail: lang ? { ...detail, lang } : detail }),
    );

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
        toast({ message: doneLabel, meta: address, icon: 'check' });
      },
      () => {
        reset();
        toast({ message: refusal });
      },
    );
  });
}

interface PlainNode {
  parentElement: { closest(selector: string): unknown } | null;
  /** Present on an element: a selection over a whole element is anchored on it, not on its text. */
  closest?: (selector: string) => unknown;
}

interface PlainSelection {
  isCollapsed: boolean;
  anchorNode: PlainNode | null;
  focusNode: PlainNode | null;
  toString(): string;
}

export interface PlainCopyEnv {
  document: {
    addEventListener(type: 'copy', listener: (event: ClipboardEvent) => void): void;
    getSelection(): PlainSelection | null;
  };
}

// A selection that lies inside one `[data-copy-plain]` element (the phone number) is copied
// without its spaces, so it can be pasted into a dialler or a contact (save-contact-hint AC-14).
// Any other selection is left to the browser. The browser's own "copy link" of a long press does
// not fire this event and cannot be changed by a page.
export function initPlainCopy({ document: doc }: PlainCopyEnv): void {
  doc.addEventListener('copy', (event) => {
    const selection = doc.getSelection();
    if (!selection || selection.isCollapsed) return;
    const owner = (node: PlainNode | null) =>
      (node?.closest ? node : node?.parentElement)?.closest?.('[data-copy-plain]') ?? null;
    const from = owner(selection.anchorNode);
    if (!from || from !== owner(selection.focusNode)) return;
    const text = selection.toString().replace(/\s+/g, '');
    if (!text || !event.clipboardData) return;
    event.clipboardData.setData('text/plain', text);
    event.preventDefault();
  });
}
