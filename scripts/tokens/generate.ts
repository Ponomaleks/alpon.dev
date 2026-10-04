import { parseCss, type Declaration, type Stylesheet } from './parse.ts';
import { BRAND_FILE, HANDOFF_DIR, MEASURE_FONT, type Sources } from './sources.ts';

// Fjord token generator (ADR-0001): one list of Natt values feeds both the [data-theme="natt"]
// block and the no-JS block that decides only when scripts are off.

const NATT = '[data-theme="natt"]';
const DAG = '[data-theme="dag"]';
const ON_SPRUCE = '.fjord-on-spruce';
const NATT_ON_SPRUCE = `${NATT} ${ON_SPRUCE}`;
/** Contour and terrain line colours are named tokens in the handoff and inlined where used. */
const LINE_TOKEN_REF = /var\((--fjord-(?:contour|terrain)-line-[a-z-]+)\)/g;
const NO_JS_NATT = '@media (prefers-color-scheme: dark)';
const REDUCED_MOTION = 'prefers-reduced-motion';
const REDUCE = '@media (prefers-reduced-motion: reduce)';

/** Name segments of motion.css tokens that are movement distances: they collapse to 0. */
const DISTANCE = new Set(['rise', 'slide', 'parallax']);
/**
 * A motion.css token whose last segment is `scale`. The handoff CSS decides what it is
 * (review S2-05): `scale(var(--x))` makes it a factor, reset to 1 (never 0, review F-15);
 * `calc(1 + var(--x))` makes it a delta, reset to 0. Any other use fails the build.
 */
const SCALE = 'scale';
/** Durations are times, not distances: only the count-up one is reset (a `parallax` duration stays). */
const DURATION_PREFIX = '--fjord-duration-';
/** A number with an optional unit: anything else cannot be reset safely, so the build fails. */
const PLAIN_NUMBER = /^-?(?:\d+\.?\d*|\.\d+)[a-z%]*$/i;
/** The stat count-up duration: counters show their final value under reduced motion. */
const COUNT_UP = '--fjord-duration-1200';
/** The one duration that survives reduced motion: opacity fades only (CLAUDE.md motion rules). */
const FADE: Declaration = ['--fjord-duration-fade', '200ms'];

/**
 * Measures: the handoff gives them in `ch`, which is the advance of "0" in the face that is drawn,
 * so the box widened when the brand font swapped in and the text rewrapped (review S1-05). They
 * are emitted in `em` instead: relative to the font size like `ch`, independent of the face.
 */
const MEASURES = ['--fjord-measure', '--fjord-measure-narrow'];
const CH_LENGTH = /^(\d+(?:\.\d+)?)ch$/;

/** `48ch` → `29.344em` for a "0" advance of 0.6113 em; three decimals (< 0.03 px at 23 px). */
export function chToEm(value: string, zeroAdvance: number): string {
  const ch = CH_LENGTH.exec(value.trim());
  if (!ch) throw new Error(`measure "${value}" is not a ch length`);
  if (!Number.isFinite(zeroAdvance) || zeroAdvance <= 0 || zeroAdvance > 1)
    throw new Error(`the "0" advance ${zeroAdvance} em is not in (0, 1]`);
  return `${Number((Number(ch[1]) * zeroAdvance).toFixed(3))}em`;
}

/** Metric-matched fallback faces declared in src/styles/fonts.css (sad §8 Fonts). */
const FALLBACK_LOCALS = ['Arial', 'Roboto'];
const FONT_STACKS: [token: string, generic: string][] = [
  ['--fjord-font-sans', 'sans-serif'],
  ['--fjord-font-mono', 'monospace'],
];

const HEADER = `/* Fjord tokens — generated — do not edit.
   Sources: ${HANDOFF_DIR}/{colors,spacing,typography,motion}.css, ${BRAND_FILE}
   and the "0" advance in ${MEASURE_FONT} (measures, ch to em).
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
    for (const rule of sheet.rules)
      if (rule.selector.split(',').some((single) => single.trim() === selector))
        list.addAll(rule.declarations);
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

/** `10px` → `0px`, `1200ms` → `0ms`: zero with the original unit. */
function zero(property: string, value: string): string {
  if (!PLAIN_NUMBER.test(value))
    throw new Error(
      `${property}: "${value}" is not a plain number, so reduced motion cannot reset it`,
    );
  return value.replace(/^-?[\d.]+/, '0');
}

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

const segments = (property: string) => property.slice('--fjord-'.length).split('-');
const isScale = (property: string) => segments(property).at(-1) === SCALE;
/** A rise/slide/parallax distance or a scale token: reduced motion resets it. */
const isMovement = (property: string) =>
  isScale(property) ||
  (!property.startsWith(DURATION_PREFIX) &&
    segments(property).some((segment) => DISTANCE.has(segment)));

/** Movement tokens are reset only from motion.css, so one declared elsewhere fails the build. */
function assertMovementInMotion(files: [file: string, sheet: Stylesheet][]) {
  for (const [file, sheet] of files)
    for (const { declarations } of [...sheet.rules, ...sheet.media.flatMap((m) => m.rules)])
      for (const [property] of declarations)
        if (property.startsWith('--fjord-') && isMovement(property))
          throw new Error(
            `${property} is declared in ${file}.css: movement tokens belong in motion.css, ` +
              'where reduced motion resets them',
          );
}

/** `factor` or `delta`, from how the handoff CSS (comments stripped) uses the scale token. */
function scaleKind(property: string, handoffCss: string): 'factor' | 'delta' {
  const v = `var\\(\\s*${property}\\s*[,)]`; // custom property names hold no regex metacharacters
  const factor = new RegExp(`scale\\(\\s*${v}`).test(handoffCss);
  const delta = new RegExp(`calc\\(\\s*1\\s*\\+\\s*${v}`).test(handoffCss);
  if (factor && delta)
    throw new Error(`${property}: the handoff uses it both as a factor and as a delta`);
  if (factor) return 'factor';
  if (delta) return 'delta';
  throw new Error(
    `${property}: the handoff uses it neither as a factor (scale(var(${property}))) nor as a ` +
      `delta (calc(1 + var(${property}))), so reduced motion cannot reset it`,
  );
}

/** Reduced-motion values for the motion.css tokens: distances and deltas to 0, factors to 1. */
function reducedMotion(
  root: DeclarationList,
  motionTokens: Set<string>,
  handoffCss: string,
): Declaration[] {
  const reduce: Declaration[] = [];
  for (const [property, value] of root.entries()) {
    if (!motionTokens.has(property) || !isMovement(property)) continue;
    const reset = zero(property, value); // a plain number, or the build fails
    const factor = isScale(property) && scaleKind(property, handoffCss) === 'factor';
    reduce.push([property, factor ? '1' : reset]);
  }
  const countUp = root.get(COUNT_UP);
  if (countUp === undefined) throw new Error(`${COUNT_UP} (count-up duration) is missing`);
  return [...reduce, [COUNT_UP, zero(COUNT_UP, countUp)]];
}

/** Replaces `var(--fjord-contour-line-*)` with the value of that :root token. */
function inlineLineTokens(declarations: Declaration[], root: DeclarationList): Declaration[] {
  return declarations.map(([property, value]) => [
    property,
    value.replace(LINE_TOKEN_REF, (ref, token: string) => root.get(token) ?? ref),
  ]);
}

function rule(selector: string, declarations: Declaration[], indent = ''): string {
  const body = declarations.map(([p, v]) => `${indent}  ${p}: ${v};`).join('\n');
  return `${indent}${selector} {\n${body}\n${indent}}`;
}

export function generateTokens(sources: Sources): string {
  const { colors, spacing, typography, motion, usage } = sources.handoff;
  const others: [file: string, sheet: Stylesheet][] = [
    ['colors', parseCss(colors)],
    ['spacing', parseCss(spacing)],
    ['typography', parseCss(typography)],
  ];
  const motionSheet = parseCss(motion);
  const sheets = [...others.map(([, sheet]) => sheet), motionSheet];
  assertMovementInMotion(others);
  const handoffCss = [colors, spacing, typography, motion, usage]
    .join('\n')
    .replace(/\/\*[\s\S]*?\*\//g, '');
  const motionTokens = new Set(
    collect([motionSheet], ':root')
      .entries()
      .map(([p]) => p),
  );

  const root = collect(sheets, ':root');
  applyBrandPalette(root, sources.brand);
  for (const [property, value] of inlineLineTokens(root.entries(), root)) root.set(property, value);
  for (const [token, generic] of FONT_STACKS) {
    const handoff = root.get(token);
    if (handoff === undefined) throw new Error(`${token} is missing from the handoff typography`);
    root.set(token, fontStack(handoff, generic));
  }
  root.set(...FADE);
  for (const token of MEASURES) {
    const handoff = root.get(token);
    if (handoff === undefined) throw new Error(`${token} is missing from the handoff typography`);
    root.set(token, chToEm(handoff, sources.zeroAdvance));
  }

  const natt = inlineLineTokens(collect(sheets, NATT).entries(), root);
  // Dag resets a subtree to light: its own block plus the Dag value of everything Natt changes.
  const dag = new DeclarationList().addAll(inlineLineTokens(collect(sheets, DAG).entries(), root));
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
    rule(ON_SPRUCE, inlineLineTokens(collect(sheets, ON_SPRUCE).entries(), root)),
    rule(NATT_ON_SPRUCE, collect(sheets, NATT_ON_SPRUCE).entries()),
    ...responsive.map(
      (media) =>
        `${media.query} {\n${media.rules.map((r) => rule(r.selector, r.declarations, '  ')).join('\n')}\n}`,
    ),
    `${REDUCE} {
  /* Deliberate deviation from the handoff motion.css (fjord-foundation sad §8 Motion): every
     movement distance and the count-up duration collapse to 0, scale factors reset to 1, scale deltas to 0;
     --fjord-duration-fade keeps opacity fades; other durations stay as they are. */
${rule(':root', reducedMotion(root, motionTokens, handoffCss), '  ')}
}`,
  ].join('\n\n')}\n`;
}
