// The contrast manifest (fjord-foundation spec §6 "Contrast", sad QG-3): every semantic
// foreground/background pair the Fjord tokens are used in. Text needs 4.5:1; large text, UI
// borders and the focus ring need 3:1 (WCAG 2.2 AA 1.4.3 / 1.4.11).
//
// KNOWN_FAILURES lists pairs that are measured but expected to fail until the design source is
// fixed. Each one is printed on every run, and the check fails once it passes, so it moves back
// to the normal pairs instead of being forgotten.

export type PairKind = 'text' | 'large' | 'ui';

export interface Pair {
  fg: string;
  bg: string;
  kind: PairKind;
  /** Themes the pair is measured in. */
  themes: Theme[];
}

export type Theme = 'Dag' | 'Natt' | 'on-spruce';

export const THRESHOLD: Record<PairKind, number> = { text: 4.5, large: 3, ui: 3 };

const c = (name: string) => `--fjord-color-${name}`;
const pair = (fg: string, bg: string, kind: PairKind, themes: Theme[]): Pair => ({
  fg: c(fg),
  bg: c(bg),
  kind,
  themes,
});

const PAGE: Theme[] = ['Dag', 'Natt'];
const ALL: Theme[] = ['Dag', 'Natt', 'on-spruce'];

export const PAIRS: Pair[] = [
  // Body and secondary text on every ground.
  pair('text', 'bg', 'text', ALL),
  pair('text', 'bg-raised', 'text', ALL),
  pair('text', 'bg-sunken', 'text', PAGE),
  pair('text-muted', 'bg', 'text', ALL),
  pair('text-muted', 'bg-raised', 'text', ALL),
  pair('text-muted', 'bg-sunken', 'text', PAGE),
  pair('text', 'selection', 'text', PAGE),
  pair('text', 'accent-soft', 'text', PAGE),
  // Links.
  pair('link', 'bg', 'text', ALL),
  pair('link', 'bg-raised', 'text', ALL),
  pair('link-hover', 'bg', 'text', ALL),
  // Inverse grounds, the primary CTA and floating UI.
  pair('text-inverse', 'bg-inverse', 'text', PAGE),
  pair('cta-text', 'cta-bg', 'text', ALL),
  pair('cta-text', 'cta-hover', 'text', ALL),
  pair('tooltip-text', 'tooltip-bg', 'text', PAGE),
  // Status text on the page ground; status panels (text plus a status icon).
  pair('success', 'bg', 'text', PAGE),
  pair('warning', 'bg', 'text', PAGE),
  pair('danger', 'bg', 'text', PAGE),
  pair('text', 'success-soft', 'text', PAGE),
  pair('text', 'danger-soft', 'text', PAGE),
  pair('text', 'warning-soft', 'text', PAGE),
  pair('success', 'success-soft', 'ui', PAGE),
  pair('danger', 'danger-soft', 'ui', PAGE),
  // The Callout --warning label (12–13px mono) is text, not just a status mark.
  pair('warning', 'warning-soft', 'text', PAGE),
  // Focus ring and input borders.
  pair('focus-ring', 'bg', 'ui', ALL),
  pair('focus-ring', 'bg-raised', 'ui', PAGE),
  pair('border-strong', 'bg', 'ui', ALL),
  pair('border-strong', 'bg-raised', 'ui', PAGE),
  // Base components: Badge status text, ghost Button hover, links and buttons on the band and
  // footer ground, text on the inverse ground, focus ring and borders on sunken and soft grounds.
  pair('success', 'bg-raised', 'text', PAGE),
  pair('warning', 'bg-raised', 'text', PAGE),
  pair('text-muted', 'accent-soft', 'text', PAGE),
  pair('link', 'bg-sunken', 'text', PAGE),
  pair('text-muted', 'bg-inverse', 'text', PAGE),
  pair('focus-ring', 'bg-sunken', 'ui', PAGE),
  pair('focus-ring', 'accent-soft', 'ui', PAGE),
  pair('border-strong', 'bg-sunken', 'ui', PAGE),
  pair('border-strong', 'accent-soft', 'ui', PAGE),
];

export interface KnownFailure {
  fg: string;
  bg: string;
  theme: Theme;
  note: string;
}

export const KNOWN_FAILURES: KnownFailure[] = [
  // spec §8 OQ-01: the Owner darkens the Dag warning color in the design source.
  {
    fg: c('warning'),
    bg: c('warning-soft'),
    theme: 'Dag',
    note: 'known failure, fix before step 7 Callout',
  },
  {
    fg: c('text-muted'),
    bg: c('accent-soft'),
    theme: 'Dag',
    note: 'known failure (4.43:1), report to the Owner: token fix in the design source',
  },
  {
    fg: c('text-muted'),
    bg: c('bg-inverse'),
    theme: 'Dag',
    note: 'known failure (1.80:1, the inverse ground is dark in Dag), report to the Owner: token fix in the design source',
  },
  {
    fg: c('border-strong'),
    bg: c('bg-sunken'),
    theme: 'Dag',
    note: 'known failure (2.95:1), report to the Owner: token fix in the design source',
  },
  {
    fg: c('border-strong'),
    bg: c('accent-soft'),
    theme: 'Dag',
    note: 'known failure (2.79:1), report to the Owner: token fix in the design source',
  },
];
