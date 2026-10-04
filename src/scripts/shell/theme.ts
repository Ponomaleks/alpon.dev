// Theme switching as pure functions (AC-10, AC-11, AC-12, AC-29; sad §6 flow 1). The document,
// storage and media query are injected; the ThemeToggle <script> only wires click events.

export type Theme = 'dag' | 'natt';

const STORAGE_KEY = 'fjord-theme';
const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

interface ThemeButton {
  dataset: Record<string, string | undefined>;
  setAttribute(name: string, value: string): void;
  closest(selector: string): unknown;
}

interface ThemeDocument {
  documentElement: { dataset: Record<string, string | undefined> };
  querySelectorAll(selector: string): Iterable<ThemeButton>;
  startViewTransition?: (update: () => void) => unknown;
}

export interface ThemeEnv {
  document: ThemeDocument;
  matchMedia: (query: string) => { matches: boolean };
  storage: { setItem(key: string, value: string): void };
}

export function isTheme(value: unknown): value is Theme {
  return value === 'dag' || value === 'natt';
}

/** Sets aria-pressed on every live theme button; samples keep their fixed state. */
export function syncPressed(theme: Theme, doc: Pick<ThemeDocument, 'querySelectorAll'>): void {
  for (const button of doc.querySelectorAll('[data-theme-button]')) {
    if (button.closest('[data-sample]')) continue;
    button.setAttribute('aria-pressed', String(button.dataset.themeValue === theme));
  }
}

export function switchTheme(value: unknown, source: ThemeButton, env: ThemeEnv): void {
  if (!isTheme(value) || source.closest('[data-sample]')) return;
  const { document: doc } = env;

  const apply = () => {
    doc.documentElement.dataset.theme = value;
    syncPressed(value, doc);
  };

  const { startViewTransition } = doc;
  const animate =
    typeof startViewTransition === 'function' &&
    !env.matchMedia(REDUCED_MOTION).matches &&
    !source.closest('dialog[open]');
  if (animate) startViewTransition.call(doc, apply);
  else apply();

  try {
    env.storage.setItem(STORAGE_KEY, value);
  } catch {
    // Storage blocked: the theme still changes for this page (AC-11), no error UI.
  }
}
