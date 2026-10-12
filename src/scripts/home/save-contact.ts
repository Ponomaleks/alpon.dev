// The sheet of "Add to contacts" (save-contact-hint AC-03 to AC-05). On a touch device a click on
// a contact card action opens the sheet as a modal <dialog>; the click is never prevented, so the
// download starts as usual. "Got it" and a tap outside the sheet close it; Escape is platform
// behaviour. Focus goes back to the action by hand: a tap does not focus a link in every
// browser, so the dialog cannot be trusted to remember it.

interface SheetDialog {
  open: boolean;
  showModal?: () => void;
  close(): void;
  addEventListener(type: 'click' | 'close', listener: (event: Event) => void): void;
  querySelector(selector: string): {
    addEventListener(type: 'click', listener: () => void): void;
  } | null;
  getBoundingClientRect(): { left: number; right: number; top: number; bottom: number };
}

interface ActionLink {
  addEventListener(type: 'click', listener: () => void): void;
  focus(): void;
}

interface SaveContactDeps {
  dialog: SheetDialog;
  links: Iterable<ActionLink>;
  /** `(hover: none) and (pointer: coarse)`; read at the time of the click. */
  touch: { matches: boolean };
}

export function initSaveContact({ dialog, links, touch }: SaveContactDeps): void {
  let opener: ActionLink | null = null;

  for (const link of links) {
    link.addEventListener('click', () => {
      if (!touch.matches || dialog.open || typeof dialog.showModal !== 'function') return;
      opener = link;
      dialog.showModal();
    });
  }

  dialog.querySelector('button')?.addEventListener('click', () => dialog.close());

  // The backdrop belongs to the dialog, so a tap on it is a click on the dialog itself, outside
  // its box. A click on the dialog's own padding is inside the box and keeps it open.
  dialog.addEventListener('click', (event) => {
    if ((event.target as unknown) !== dialog) return;
    const { clientX, clientY } = event as MouseEvent;
    const box = dialog.getBoundingClientRect();
    const inside =
      clientX >= box.left && clientX <= box.right && clientY >= box.top && clientY <= box.bottom;
    if (!inside) dialog.close();
  });

  dialog.addEventListener('close', () => {
    opener?.focus();
    opener = null;
  });
}
