import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { entireMetricsCollection } from '@capsizecss/metrics/entireMetricsCollection';
import { fromFile } from '@capsizecss/unpack/fs';
import { create, type Font } from 'fontkitten';
import { describe, expect, it } from 'vitest';
import { BRAND_FAMILIES, FALLBACKS, formatPercent } from './fallback-metrics.ts';

// AC-05 / AC-15: the self-hosted brand faces with the Norwegian letters, and metric-matched
// fallback faces derived from the brand font metrics (fjord-foundation sad §8 Fonts). Since home
// sad §1 (Decision override) the seven weights come from two variable files, weight axis 400–700.

const repo = (path: string) => fileURLToPath(new URL(`../../${path}`, import.meta.url));
const KB = 1024;
const REQUIRED = 'æøåÆØÅ–—';

const FILES = ['schibsted-grotesk-wght', 'jetbrains-mono-wght'];

function open(path: string): Font {
  const font = create(readFileSync(path));
  if (!('hasGlyphForCodePoint' in font)) throw new Error(`${path} is a font collection`);
  return font;
}

describe('brand font files', () => {
  it('public/fonts holds the two variable files and no other woff2', () => {
    const shipped = readdirSync(repo('public/fonts')).filter((file) => file.endsWith('.woff2'));
    expect(shipped.sort()).toEqual(FILES.map((name) => `${name}.woff2`).sort());
  });

  for (const name of FILES) {
    const path = repo(`public/fonts/${name}.woff2`);

    it(`${name}.woff2 is a woff2 file of at most 50 KB`, () => {
      expect(statSync(path).size).toBeLessThanOrEqual(50 * KB);
      expect(open(path).type).toBe('WOFF2');
    });

    it(`${name}.woff2 maps ${REQUIRED}`, () => {
      const font = open(path);
      const missing = [...REQUIRED].filter((c) => !font.hasGlyphForCodePoint(c.codePointAt(0)!));
      expect(missing).toEqual([]);
    });

    it(`${name}.woff2 has one axis, weight 400 to 700, with Regular as its default`, () => {
      const axes = open(path).variationAxes;
      expect(Object.keys(axes)).toEqual(['wght']);
      expect(axes.wght).toMatchObject({ min: 400, default: 400, max: 700 });
    });
  }
});

describe('variable sources (tools/fonts/src)', () => {
  for (const family of BRAND_FAMILIES) {
    it(`${family.name}: the source is the brand font, same version and licence`, () => {
      const source = open(repo(family.sourceTtf));
      const brand = open(repo(family.regularTtf));
      expect(source.version).toBe(brand.version);
      expect(readFileSync(repo(family.sourceLicence), 'utf8')).toBe(
        readFileSync(repo(family.brandLicence), 'utf8'),
      );
    });

    it(`${family.name}: its default instance has the metrics of the static Regular`, async () => {
      // The fallback faces and the measures were computed from the static Regular TTF of
      // design/brand/fonts; the variable file is what ships, so the two must agree.
      const [source, brand] = await Promise.all(
        [family.sourceTtf, family.regularTtf].map((ttf) => fromFile(repo(ttf))),
      );
      for (const key of ['unitsPerEm', 'ascent', 'descent', 'lineGap', 'xWidthAvg'] as const)
        expect(source?.[key], key).toBe(brand?.[key]);
      const advance = (path: string) => {
        const font = open(repo(path));
        return font.glyphForCodePoint('0'.codePointAt(0)!).advanceWidth / font.unitsPerEm;
      };
      expect(advance(family.sourceTtf)).toBe(advance(family.regularTtf));
    });
  }
});

type Metrics = Record<string, Record<string, Record<string, string>>>;
const loadMetrics = (): Metrics =>
  JSON.parse(readFileSync(repo('tools/fonts/fallback-metrics.json'), 'utf8')) as Metrics;

describe('fallback metrics (tools/fonts/fallback-metrics.json)', () => {
  for (const family of BRAND_FAMILIES) {
    for (const fallback of FALLBACKS) {
      it(`${family.name} over ${fallback.local} matches the hhea metrics of the shipped source`, async () => {
        const ttf = open(repo(family.sourceTtf));
        const { xWidthAvg } = await fromFile(repo(family.sourceTtf));
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

  it('declares each brand family once, as a weight range from its variable file, with font-display: swap', () => {
    const brand = loadFaces()
      .filter((face) => descriptor(face, 'src')?.includes('/fonts/'))
      .map((face) => ({
        family: descriptor(face, 'font-family'),
        weight: descriptor(face, 'font-weight'),
        style: descriptor(face, 'font-style'),
        src: descriptor(face, 'src'),
        display: descriptor(face, 'font-display'),
      }));
    const expected = FILES.map((file) => ({
      family: file.startsWith('schibsted') ? "'Schibsted Grotesk'" : "'JetBrains Mono'",
      weight: '400 700',
      style: 'normal',
      src: `url('/fonts/${file}.woff2') format('woff2')`,
      display: 'swap',
    }));
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
