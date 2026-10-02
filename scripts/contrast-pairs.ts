// The contrast manifest (fjord-foundation spec §6 "Contrast", sad QG-3): every semantic
// foreground/background pair the Fjord tokens are used in. Text needs 4.5:1; large text, UI
// borders and the focus ring need 3:1 (WCAG 2.2 AA 1.4.3 / 1.4.11).
//
// Not in the manifest yet: --fjord-color-warning on --fjord-color-warning-soft (the handoff
// Callout --warning label, 12–13px mono). It measures 4.40:1 in Dag; reported to the Owner in the
// fjord-foundation PR. Add it when Callout is built, after the design source is fixed.

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
  pair('success', 'success-soft', 'ui', PAGE),
  pair('danger', 'danger-soft', 'ui', PAGE),
  // Focus ring and input borders.
  pair('focus-ring', 'bg', 'ui', ALL),
  pair('focus-ring', 'bg-raised', 'ui', PAGE),
  pair('border-strong', 'bg', 'ui', ALL),
  pair('border-strong', 'bg-raised', 'ui', PAGE),
];
