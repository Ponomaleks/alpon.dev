import { parseCss, type Declaration, type Stylesheet } from './parse.ts';
import { BRAND_FILE, HANDOFF_DIR, type Sources } from './sources.ts';

// Fjord token generator (ADR-0001): one list of Natt values feeds both the [data-theme="natt"]
// block and the no-JS block that decides only when scripts are off.

const NATT = '[data-theme="natt"]';
const DAG = '[data-theme="dag"]';
const ON_SPRUCE = '.fjord-on-spruce';
const NO_JS_NATT = '@media (prefers-color-scheme: dark)';
const REDUCED_MOTION = 'prefers-reduced-motion';
const REDUCE = '@media (prefers-reduced-motion: reduce)';

/** Movement distances collapse to zero under reduced motion (rise, slide, parallax, scale). */
const MOVEMENT = /^--fjord-[a-z0-9-]*(rise|slide|parallax|scale)[a-z0-9-]*$/;
/** The stat count-up duration: counters show their final value under reduced motion. */
const COUNT_UP = '--fjord-duration-1200';
/** The one duration that survives reduced motion: opacity fades only (CLAUDE.md motion rules). */
const FADE: Declaration = ['--fjord-duration-fade', '200ms'];

/** Metric-matched fallback faces declared in src/styles/fonts.css (sad §8 Fonts). */
const FALLBACK_LOCALS = ['Arial', 'Roboto'];
const FONT_STACKS: [token: string, generic: string][] = [
  ['--fjord-font-sans', 'sans-serif'],
  ['--fjord-font-mono', 'monospace'],
];

const HEADER = `/* Fjord tokens — generated — do not edit.
   Sources: ${HANDOFF_DIR}/{colors,spacing,typography,motion}.css and ${BRAND_FILE}.
   Regenerate: node scripts/tokens/build.ts (fjord-foundation ADR-0001). */`;

/** Ordered declarations where a later property replaces an earlier one in place. */
class DeclarationList {
  readonly #map = new Map<string, string>();
  set(property: string, value: string) {
    this.#map.set(property, value);
  }
  get(property: string) {
    return this.#map.get(property);
  }
  has(property: string) {
    return this.#map.has(property);
  }
  addAll(declarations: Declaration[]) {
    for (const [property, value] of declarations) this.set(property, value);
    return this;
  }
  entries(): Declaration[] {
    return [...this.#map];
  }
}

function collect(sheets: Stylesheet[], selector: string): DeclarationList {
  const list = new DeclarationList();
  for (const sheet of sheets)
    for (const rule of sheet.rules) if (rule.selector === selector) list.addAll(rule.declarations);
  return list;
}

/** The brand palette wins; any handoff value that differs fails the build (BRAND.md wins). */
function applyBrandPalette(root: DeclarationList, brand: Sources['brand']) {
  const conflicts: string[] = [];
  for (const [name, { hex }] of Object.entries(brand.color)) {
    const token = `--fjord-${name}`;
    const handoff = root.get(token);
    if (handoff !== undefined && handoff.toUpperCase() !== hex.toUpperCase())
      conflicts.push(`${token}: brand ${hex} (${BRAND_FILE}), handoff ${handoff}`);
    root.set(token, hex);
  }
  if (conflicts.length > 0)
    throw new Error(`brand vs handoff palette conflict:\n  ${conflicts.join('\n  ')}`);
}

/** `10px` → `0px`, `1200ms` → `0ms`, `0.02` → `0`: zero with the original unit. */
const zero = (value: string) => value.replace(/^-?[\d.]+/, '0');

/** The brand family first, then its fallback faces, then the generic family. */
function fontStack(handoffStack: string, generic: string): string {
  const family = handoffStack
    .split(',')[0]
    ?.trim()
    .replace(/^["']|["']$/g, '');
  if (!family) throw new Error(`empty font stack: "${handoffStack}"`);
  const names = [family, ...FALLBACK_LOCALS.map((local) => `${family} Fallback ${local}`)];
  return [...names.map((name) => `"${name}"`), generic].join(', ');
}

function reducedMotion(root: DeclarationList): Declaration[] {
  const reduce: Declaration[] = root
    .entries()
    .filter(([property]) => MOVEMENT.test(property))
    .map(([property, value]) => [property, zero(value)]);
  const countUp = root.get(COUNT_UP);
  if (countUp === undefined) throw new Error(`${COUNT_UP} (count-up duration) is missing`);
  return [...reduce, [COUNT_UP, zero(countUp)]];
}

function rule(selector: string, declarations: Declaration[], indent = ''): string {
  const body = declarations.map(([p, v]) => `${indent}  ${p}: ${v};`).join('\n');
  return `${indent}${selector} {\n${body}\n${indent}}`;
}

export function generateTokens(sources: Sources): string {
  const { colors, spacing, typography, motion } = sources.handoff;
  const sheets = [colors, spacing, typography, motion].map(parseCss);

  const root = collect(sheets, ':root');
  applyBrandPalette(root, sources.brand);
  for (const [token, generic] of FONT_STACKS) {
    const handoff = root.get(token);
    if (handoff === undefined) throw new Error(`${token} is missing from the handoff typography`);
    root.set(token, fontStack(handoff, generic));
  }
  root.set(...FADE);

  const natt = collect(sheets, NATT).entries();
  // Dag resets a subtree to light: its own block plus the Dag value of everything Natt changes.
  const dag = collect(sheets, DAG);
  for (const [property] of natt)
    if (!dag.has(property)) dag.set(property, root.get(property) ?? 'initial');

  const responsive = sheets
    .flatMap((sheet) => sheet.media)
    .filter((media) => !media.query.includes(REDUCED_MOTION));

  return `${[
    HEADER,
    rule(':root', root.entries()),
    rule(DAG, dag.entries()),
    rule(NATT, natt),
    `${NO_JS_NATT} {\n${rule(':root:not([data-theme])', natt, '  ')}\n}`,
    rule(ON_SPRUCE, collect(sheets, ON_SPRUCE).entries()),
    ...responsive.map(
      (media) =>
        `${media.query} {\n${media.rules.map((r) => rule(r.selector, r.declarations, '  ')).join('\n')}\n}`,
    ),
    `${REDUCE} {
  /* Deliberate deviation from the handoff motion.css (fjord-foundation sad §8 Motion): every
     movement distance and the count-up duration collapse to 0; --fjord-duration-fade keeps
     opacity fades; other durations stay as they are. */
${rule(':root', reducedMotion(root), '  ')}
}`,
  ].join('\n\n')}\n`;
}
