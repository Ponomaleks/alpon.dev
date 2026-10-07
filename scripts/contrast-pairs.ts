// The contrast manifest (fjord-foundation spec §6 "Contrast", sad QG-3): every semantic
// foreground/background pair the Fjord tokens are used in. Text needs 4.5:1; large text, UI
// borders and the focus ring need 3:1 (WCAG 2.2 AA 1.4.3 / 1.4.11). The list mirrors what the
// components render: a pair no rule renders is not listed.
//
// A 'decorative' pair is a line that is neither text nor needed to identify a control or to
// understand a graphic, so WCAG 1.4.11 sets no minimum for it. It is measured and printed on every
// run but never fails the check. Control boundaries (Button, input, switch outlines) stay 'ui'.
//
// KNOWN_FAILURES lists pairs that are measured but expected to fail until the design source is
// fixed. Each one is printed on every run, and the check fails once it passes, so it moves back
// to the normal pairs instead of being forgotten.

export type PairKind = 'text' | 'large' | 'ui' | 'decorative';
export type GatedKind = Exclude<PairKind, 'decorative'>;

export interface Pair {
  fg: string;
  bg: string;
  kind: PairKind;
  /** Themes the pair is measured in. */
  themes: Theme[];
}

export type Theme = 'Dag' | 'Natt' | 'on-spruce';

export const THRESHOLD: Record<GatedKind, number> = { text: 4.5, large: 3, ui: 3 };

const c = (name: string) => `--fjord-color-${name}`;
const pair = (fg: string, bg: string, kind: PairKind, themes: Theme[]): Pair => ({
  fg: c(fg),
  bg: c(bg),
  kind,
  themes,
});

const PAGE: Theme[] = ['Dag', 'Natt'];
const ALL: Theme[] = ['Dag', 'Natt', 'on-spruce'];
const HERO: Theme[] = ['Natt', 'on-spruce'];

export const PAIRS: Pair[] = [
  // Body and secondary text on every ground.
  pair('text', 'bg', 'text', ALL),
  // The selected segment of the theme switch: the text colour as fill, the page ground as label.
  pair('bg', 'text', 'text', ALL),
  pair('text', 'bg-raised', 'ui', ALL),
  pair('text', 'bg-raised', 'text', ALL),
  pair('text', 'bg-sunken', 'text', PAGE),
  pair('text-muted', 'bg', 'text', ALL),
  pair('text-muted', 'bg-raised', 'text', ALL),
  pair('text-muted', 'bg-sunken', 'text', PAGE),
  pair('text', 'selection', 'text', PAGE),
  pair('text', 'accent-soft', 'text', ALL),
  // Links.
  pair('link', 'bg', 'text', ALL),
  pair('link', 'bg-raised', 'text', ALL),
  pair('link-hover', 'bg', 'text', ALL),
  // Inverse grounds, the primary CTA and floating UI.
  pair('text-inverse', 'bg-inverse', 'text', PAGE),
  // The on-spruce wordmark (footer, header, menu panel) takes the inverse colour on the spruce ground.
  pair('text-inverse', 'bg', 'text', ['on-spruce']),
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
  // Base components: Badge status text, links on the band and footer ground, the focus ring on
  // sunken and soft grounds. Hovered Buttons render text on accent-soft, listed above.
  pair('success', 'bg-raised', 'text', PAGE),
  pair('warning', 'bg-raised', 'text', PAGE),
  pair('link', 'bg-sunken', 'text', PAGE),
  pair('focus-ring', 'bg-sunken', 'ui', PAGE),
  pair('focus-ring', 'accent-soft', 'ui', ALL),
  // TerrainMap .terrain__trail: the dashed route where it crosses the sunken map frame. The panel
  // is aria-hidden decoration and no control has a strong border on a sunken ground.
  pair('border-strong', 'bg-sunken', 'decorative', PAGE),
];

export interface HomePair {
  component: string;
  fg: string;
  bg: string;
  kind: GatedKind;
  themes: Theme[];
}

const home = (
  component: string,
  fg: string,
  bg: string,
  kind: GatedKind,
  themes: Theme[],
): HomePair => ({ component, fg: c(fg), bg: c(bg), kind, themes });

// Home AC-33 / AC-02: the pairs the home components and the header over the hero render. Each must
// also be a gated entry of PAIRS (a test keeps the two in step).
export const HOME_PAIRS: HomePair[] = [
  // The hero stands on spruce in Dag and on the night ground in Natt (page design, Home.jsx).
  home('Hero', 'text', 'bg', 'text', HERO),
  home('Hero', 'text-muted', 'bg', 'text', HERO),
  home('Hero', 'link', 'bg', 'text', HERO),
  home('Hero', 'border-strong', 'bg', 'ui', HERO),
  home('KeyFacts', 'text', 'bg-raised', 'text', PAGE),
  home('KeyFacts', 'text-muted', 'bg-raised', 'text', PAGE),
  home('ExperienceList', 'text', 'bg', 'text', PAGE),
  home('ExperienceList', 'text-muted', 'bg', 'text', PAGE),
  home('ExperienceList', 'link', 'bg', 'text', PAGE),
  home('ExperienceList', 'focus-ring', 'bg', 'ui', PAGE),
  home('Header over hero', 'text', 'bg', 'text', ALL),
  home('Header over hero', 'cta-text', 'cta-bg', 'text', ALL),
  home('Header over hero', 'focus-ring', 'bg', 'ui', ALL),
  home('Header over hero', 'border-strong', 'bg', 'ui', ALL),
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
];
