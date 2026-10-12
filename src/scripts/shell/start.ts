// The Shell's one script file (release-1 D-06 a): BaseLayout loads this module, and it wires the
// five parts of the Shell to the page. One file is one request before the first paint instead of
// five. Each part is wired only when its element is on the page; the behaviour itself lives in
// the modules beside this one, which take the document, storage and media queries as arguments.
import { applyBarAction, decideBar } from './action-bar';
import { observeHeader } from './header';
import { initMenu } from './menu';
import { isTheme, restoreStoredTheme, switchTheme, syncPressed } from './theme';
import { initToast } from './toast';

function startTheme() {
  // `localStorage` is read when a theme is saved, inside the saving try/catch: with storage
  // blocked, reading it throws, and that must not break the page on load (AC-11).
  const env = {
    document,
    matchMedia: (q: string) => window.matchMedia(q),
    get storage() {
      return localStorage;
    },
  };

  // A page restored from the back/forward cache keeps the old theme: re-apply the stored one.
  window.addEventListener('pageshow', (event) => restoreStoredTheme(event, env));

  // Expose the theme already set on <html> as the pressed segment from load (AC-12).
  const current = document.documentElement.dataset.theme;
  if (isTheme(current)) syncPressed(current, document);

  for (const button of document.querySelectorAll<HTMLButtonElement>('[data-theme-button]')) {
    button.addEventListener('click', () => switchTheme(button.dataset.themeValue, button, env));
  }
}

function startHeader() {
  const header = document.querySelector('[data-header]');
  const sentinel = document.querySelector('[data-header-sentinel]');
  if (header && sentinel && 'IntersectionObserver' in window) observeHeader(header, sentinel);
}

function startMenu() {
  const dialog = document.querySelector<HTMLDialogElement>('dialog#mobile-menu');
  const button = document.querySelector<HTMLButtonElement>('[aria-controls="mobile-menu"]');
  if (dialog && button) {
    initMenu(dialog, button, window.matchMedia('(min-width: 768px)'));
    dialog.querySelector('.fj-iconbtn')?.addEventListener('click', () => dialog.close());
  }
}

function startActionBar() {
  const bar = document.querySelector<HTMLElement>('[data-shell-bar]');
  if (!bar) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let prev = window.scrollY;
  let queued = false;

  const update = () => {
    queued = false;
    const next = window.scrollY;
    applyBarAction(
      bar,
      decideBar({
        prev,
        next,
        // Keyboard focus only (G-4): a pointer tap on the tab leaves focus there but is not keyboard use.
        focusInside:
          bar.contains(document.activeElement) &&
          (document.activeElement?.matches(':focus-visible') ?? false),
        reducedMotion: reduced.matches,
      }),
    );
    // Keep the reference only after a decision that acted on it, so small steps add up.
    if (Math.abs(next - prev) >= 8 || next < 40) prev = next;
  };

  window.addEventListener(
    'scroll',
    () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(update);
    },
    { passive: true },
  );
}

function startToast() {
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--fjord-duration-toast');
  // The built CSS may serialise 4000ms as "4s": read the unit, the Toast wants milliseconds.
  const value = parseFloat(raw);
  initToast({ document, duration: raw.trim().endsWith('ms') ? value : value * 1000 });
}

// The order the five component scripts ran in before they became one file.
startTheme();
startHeader();
startMenu();
startActionBar();
startToast();
