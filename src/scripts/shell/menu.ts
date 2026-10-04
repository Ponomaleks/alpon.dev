// Mobile menu (AC-04, AC-05, D-07; ADR-0002). The panel is a native modal <dialog>: Escape, the
// focus trap and focus return to the opener are platform behaviour. This script opens it, mirrors
// `aria-expanded`, closes it on any link (and never moves focus back to the button, G-1) and when
// the 768 query matches (G-2). A theme segment is not a link, so a theme change leaves it open.

interface MenuDialog {
  open: boolean;
  showModal?: () => void;
  close(): void;
  addEventListener(type: 'click' | 'close', listener: (event: Event) => void): void;
  querySelector(selector: string): { focus(): void } | null;
}

interface MenuButton {
  setAttribute(name: string, value: string): void;
  addEventListener(type: 'click', listener: () => void): void;
}

interface WidthQuery {
  addEventListener(type: 'change', listener: (event: { matches: boolean }) => void): void;
}

export function initMenu(dialog: MenuDialog, button: MenuButton, mq: WidthQuery): void {
  button.addEventListener('click', () => {
    if (typeof dialog.showModal !== 'function') return;
    dialog.showModal();
    button.setAttribute('aria-expanded', 'true');
    dialog.querySelector('.menu__nav a')?.focus();
  });

  dialog.addEventListener('click', (event) => {
    const target = event.target as Element | null;
    if (target?.closest('a[href]')) dialog.close();
  });

  dialog.addEventListener('close', () => button.setAttribute('aria-expanded', 'false'));

  mq.addEventListener('change', (event) => {
    if (event.matches && dialog.open) dialog.close();
  });
}
