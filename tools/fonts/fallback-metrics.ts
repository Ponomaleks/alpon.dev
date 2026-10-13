// Metric-matched fallback faces (fjord-foundation sad §8 Fonts): the size and line-metric
// overrides that make a local Arial or Roboto take the same space as the brand font, so text
// does not move when the brand font swaps in (AC-05).
//
// Brand metrics come from the default (Regular) instance of the variable brand TTF (hhea
// ascent/descent/lineGap, unitsPerEm, and the letter-frequency-weighted average width); local
// font metrics come from @capsizecss/metrics,
// measured the same way. Output: tools/fonts/fallback-metrics.json, mirrored by hand into the
// fallback @font-face rules of src/styles/fonts.css (a Vitest test keeps them equal).
//
// Run from the repo root: node tools/fonts/fallback-metrics.ts

import { writeFileSync } from 'node:fs';
import { entireMetricsCollection } from '@capsizecss/metrics/entireMetricsCollection';
import { fromFile } from '@capsizecss/unpack/fs';

// `sourceTtf` is the variable master the shipped woff2 is made from (home sad §1, Decision
// override); its default instance is Regular. `regularTtf` is the static brand Regular it must
// agree with (tools/fonts/fonts.test.ts compares the two).
export const BRAND_FAMILIES = [
  {
    name: 'Schibsted Grotesk',
    sourceTtf: 'tools/fonts/src/SchibstedGrotesk-wght.ttf',
    regularTtf: 'design/brand/fonts/SchibstedGrotesk-Regular.ttf',
    sourceLicence: 'tools/fonts/src/OFL-SchibstedGrotesk.txt',
    brandLicence: 'design/brand/fonts/OFL-SchibstedGrotesk.txt',
  },
  {
    name: 'JetBrains Mono',
    sourceTtf: 'tools/fonts/src/JetBrainsMono-wght.ttf',
    regularTtf: 'design/brand/fonts/JetBrainsMono-Regular.ttf',
    sourceLicence: 'tools/fonts/src/OFL-JetBrainsMono.txt',
    brandLicence: 'design/brand/fonts/OFL-JetBrainsMono.txt',
  },
] as const;

export const FALLBACKS = [
  { local: 'Arial', capsize: 'arial' },
  { local: 'Roboto', capsize: 'roboto' },
] as const;

interface FontMetrics {
  ascent: number;
  descent: number;
  lineGap: number;
  unitsPerEm: number;
  xWidthAvg: number;
}

export interface FallbackFace {
  sizeAdjust: string;
  ascentOverride: string;
  descentOverride: string;
  lineGapOverride: string;
}

/** A ratio as a CSS percentage, two decimals at most and no trailing zeros (as Prettier prints
 *  it): 1.04523 → "104.52%", 0 → "0%". */
export function formatPercent(ratio: number): string {
  return `${Number((ratio * 100).toFixed(2))}%`;
}

export function fallbackFace(brand: FontMetrics, local: FontMetrics): FallbackFace {
  const sizeAdjust = brand.xWidthAvg / brand.unitsPerEm / (local.xWidthAvg / local.unitsPerEm);
  const override = (value: number) => formatPercent(Math.abs(value) / (brand.unitsPerEm * sizeAdjust));
  return {
    sizeAdjust: formatPercent(sizeAdjust),
    ascentOverride: override(brand.ascent),
    descentOverride: override(brand.descent),
    lineGapOverride: override(brand.lineGap),
  };
}

export async function computeAll(): Promise<Record<string, Record<string, FallbackFace>>> {
  const result: Record<string, Record<string, FallbackFace>> = {};
  for (const family of BRAND_FAMILIES) {
    const brand = await fromFile(family.sourceTtf);
    result[family.name] = Object.fromEntries(
      FALLBACKS.map((f) => [f.local, fallbackFace(brand, entireMetricsCollection[f.capsize])]),
    );
  }
  return result;
}

if (import.meta.main) {
  const out = 'tools/fonts/fallback-metrics.json';
  writeFileSync(out, `${JSON.stringify(await computeAll(), null, 2)}\n`);
  console.log(`wrote ${out}`);
}
