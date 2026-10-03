import { readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { entireMetricsCollection } from '@capsizecss/metrics/entireMetricsCollection';
import { fromFile } from '@capsizecss/unpack/fs';
import { create, type Font } from 'fontkitten';
import { describe, expect, it } from 'vitest';
import { BRAND_FAMILIES, FALLBACKS, formatPercent } from './fallback-metrics.ts';

// AC-05 / AC-15: seven self-hosted brand faces with the Norwegian letters, and metric-matched
// fallback faces derived from the brand TTF metrics (sad §8 Fonts).

const repo = (path: string) => fileURLToPath(new URL(`../../${path}`, import.meta.url));
const KB = 1024;
const REQUIRED = 'æøåÆØÅ–—';

const FILES = [
  'schibsted-grotesk-400',
  'schibsted-grotesk-500',
  'schibsted-grotesk-600',
  'schibsted-grotesk-700',
  'jetbrains-mono-400',
  'jetbrains-mono-500',
  'jetbrains-mono-700',
];

function open(path: string): Font {
  const font = create(readFileSync(path));
  if (!('hasGlyphForCodePoint' in font)) throw new Error(`${path} is a font collection`);
  return font;
}

describe('brand font files', () => {
  for (const name of FILES) {
    const path = repo(`public/fonts/${name}.woff2`);

    it(`${name}.woff2 is a woff2 file of at most 30 KB`, () => {
      expect(statSync(path).size).toBeLessThanOrEqual(30 * KB);
      expect(open(path).type).toBe('WOFF2');
    });

    it(`${name}.woff2 maps ${REQUIRED}`, () => {
      const font = open(path);
      const missing = [...REQUIRED].filter((c) => !font.hasGlyphForCodePoint(c.codePointAt(0)!));
      expect(missing).toEqual([]);
    });
  }
});

type Metrics = Record<string, Record<string, Record<string, string>>>;
const loadMetrics = (): Metrics =>
  JSON.parse(readFileSync(repo('tools/fonts/fallback-metrics.json'), 'utf8')) as Metrics;

describe('fallback metrics (tools/fonts/fallback-metrics.json)', () => {
  for (const family of BRAND_FAMILIES) {
    for (const fallback of FALLBACKS) {
      it(`${family.name} over ${fallback.local} matches the TTF hhea metrics`, async () => {
        const ttf = open(repo(family.regularTtf));
        const { xWidthAvg } = await fromFile(repo(family.regularTtf));
        const local = entireMetricsCollection[fallback.capsize];
        const sizeAdjust = xWidthAvg / ttf.unitsPerEm / (local.xWidthAvg / local.unitsPerEm);
        const per = (value: number) => formatPercent(Math.abs(value) / (ttf.unitsPerEm * sizeAdjust));

        expect(loadMetrics()[family.name]?.[fallback.local]).toEqual({
          sizeAdjust: formatPercent(sizeAdjust),
          ascentOverride: per(ttf.hhea.ascent),
          descentOverride: per(ttf.hhea.descent),
          lineGapOverride: per(ttf.hhea.lineGap),
        });
      });
    }
  }
});

describe('src/styles/fonts.css', () => {
  const loadCss = () => readFileSync(repo('src/styles/fonts.css'), 'utf8');
  const loadFaces = () =>
    [...loadCss().matchAll(/@font-face\s*\{([^}]*)\}/g)].map((m) => m[1] ?? '');
  const descriptor = (face: string, name: string) =>
    face.match(new RegExp(String.raw`(?:^|;|\s)${name}\s*:\s*([^;]+);`))?.[1]?.trim();

  it('holds only @font-face rules (ADR-0003 exclusion contract)', () => {
    const rest = loadCss().replace(/\/\*[\s\S]*?\*\//g, '').replace(/@font-face\s*\{[^}]*\}/g, '');
    expect(rest.trim()).toBe('');
  });

  it('declares every brand weight from its own file with font-display: swap', () => {
    const brand = loadFaces()
      .filter((face) => descriptor(face, 'src')?.includes('/fonts/'))
      .map((face) => ({
        family: descriptor(face, 'font-family'),
        weight: descriptor(face, 'font-weight'),
        src: descriptor(face, 'src'),
        display: descriptor(face, 'font-display'),
      }));
    const expected = FILES.map((file) => {
      const weight = file.slice(-3);
      const family = file.startsWith('schibsted') ? "'Schibsted Grotesk'" : "'JetBrains Mono'";
      return { family, weight, src: `url('/fonts/${file}.woff2') format('woff2')`, display: 'swap' };
    });
    expect(brand).toEqual(expected);
  });

  it('declares the metric-matched fallback faces from fallback-metrics.json', () => {
    const faces = loadFaces();
    const metrics = loadMetrics();
    for (const family of BRAND_FAMILIES) {
      for (const fallback of FALLBACKS) {
        const name = `'${family.name} Fallback ${fallback.local}'`;
        const face = faces.find((f) => descriptor(f, 'font-family') === name);
        const m = metrics[family.name]?.[fallback.local];
        expect(face, name).toBeDefined();
        expect(descriptor(face!, 'src')).toBe(`local('${fallback.local}')`);
        expect(descriptor(face!, 'size-adjust')).toBe(m?.sizeAdjust);
        expect(descriptor(face!, 'ascent-override')).toBe(m?.ascentOverride);
        expect(descriptor(face!, 'descent-override')).toBe(m?.descentOverride);
        expect(descriptor(face!, 'line-gap-override')).toBe(m?.lineGapOverride);
      }
    }
  });
});
