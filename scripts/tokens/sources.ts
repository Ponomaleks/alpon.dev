import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { create } from 'fontkitten';

// The read-only design sources the generator reads (ADR-0001). design/ is never written.

const TOKEN_FILES = ['colors', 'spacing', 'typography', 'motion'] as const;

export interface Sources {
  /**
   * design/handoff/site/project/_ds/<bundle>/tokens/*.css, in cascade order, plus `usage`: every
   * other handoff CSS file (base, components), where tokens are used, e.g. inside scale().
   */
  handoff: Record<(typeof TOKEN_FILES)[number] | 'usage', string>;
  /** design/brand/tokens.json: the core palette, which wins on conflict (BRAND.md). */
  brand: { color: Record<string, { hex: string }> };
  /**
   * The advance width of "0" in Schibsted Grotesk Regular, in em: what `1ch` is in the brand
   * face. The generator converts the handoff `ch` measures with it (review S1-05).
   */
  zeroAdvance: number;
}

export const HANDOFF_PROJECT =
  'design/handoff/site/project/_ds/fjord-design-system-44c954ec-c46f-4ba1-8ea8-f72f1cb07b3d';
export const HANDOFF_DIR = `${HANDOFF_PROJECT}/tokens`;
export const BRAND_FILE = 'design/brand/tokens.json';
export const MEASURE_FONT = 'design/brand/fonts/SchibstedGrotesk-Regular.ttf';

/**
 * The advance of "0" over the units per em. Glyph id 0 is .notdef (the font has no "0"), and an
 * advance outside (0, 1] em is not a digit width; both would silently skew every `ch` measure.
 */
export function zeroAdvanceEm(glyphId: number, advanceWidth: number, unitsPerEm: number): number {
  if (glyphId === 0) throw new Error('the measure font has no "0" (glyph is .notdef)');
  const advance = advanceWidth / unitsPerEm;
  if (!Number.isFinite(advance) || advance <= 0 || advance > 1)
    throw new Error(`the "0" advance ${advance} em is not in (0, 1]`);
  return advance;
}

/** The advance of "0" (U+0030) in the font file at `path`; `codePoint` is a seam for tests. */
export function zeroAdvance(path: string, codePoint = 0x30): number {
  const font = create(readFileSync(path));
  if (!('glyphForCodePoint' in font)) throw new Error(`${path} is a font collection`);
  const glyph = font.glyphForCodePoint(codePoint);
  return zeroAdvanceEm(glyph.id, glyph.advanceWidth, font.unitsPerEm);
}

export function readSources(root: string): Sources {
  const handoff = (name: string) => readFileSync(join(root, HANDOFF_DIR, `${name}.css`), 'utf8');
  const tokenFiles = new Set(TOKEN_FILES.map((name) => `tokens/${name}.css`));
  const usage = readdirSync(join(root, HANDOFF_PROJECT), { recursive: true, encoding: 'utf8' })
    .map((file) => file.replaceAll('\\', '/'))
    .filter((file) => file.endsWith('.css') && !tokenFiles.has(file))
    .sort()
    .map((file) => readFileSync(join(root, HANDOFF_PROJECT, file), 'utf8'))
    .join('\n');
  return {
    handoff: {
      colors: handoff('colors'),
      spacing: handoff('spacing'),
      typography: handoff('typography'),
      motion: handoff('motion'),
      usage,
    },
    brand: JSON.parse(readFileSync(join(root, BRAND_FILE), 'utf8')) as Sources['brand'],
    zeroAdvance: zeroAdvance(join(root, MEASURE_FONT)),
  };
}
