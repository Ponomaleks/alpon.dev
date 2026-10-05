import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { getViteConfig } from 'astro/config';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { createServer, type ViteDevServer } from 'vite';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

// Brand components (AC-17, AC-19; screens.md SCR-04 rows Contours, Terrain map, Wordmark).
// Each component is rendered on its own with the Astro container, through a Vite server that
// carries the Astro plugin (the .astro files are not plain modules).

const dir = fileURLToPath(new URL('./', import.meta.url));
let server: ViteDevServer;
let container: AstroContainer;

beforeAll(async () => {
  const config = await getViteConfig({})({ mode: 'test', command: 'serve' });
  server = await createServer({ ...config, server: { middlewareMode: true }, appType: 'custom' });
  container = await AstroContainer.create();
}, 120_000);
afterAll(() => server?.close());

async function render(name: string, props: Record<string, unknown> = {}): Promise<string> {
  const mod = await server.ssrLoadModule(`/src/components/brand/${name}.astro`);
  return container.renderToString(mod.default, { props });
}

const text = (html: string) =>
  html
    .replace(/<style[\s\S]*?<\/style>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/** The markup with the component's own scoped <style> block removed (CSS lives outside the SVG). */
const markup = (html: string) => html.replace(/<style[\s\S]*?<\/style>/g, '');

function expectDecorativeSvg(html: string) {
  const svgs = markup(html).match(/<svg\b[^>]*>/g) ?? [];
  expect(svgs.length).toBeGreaterThan(0);
  for (const tag of svgs) {
    expect(tag).toContain('aria-hidden="true"');
    expect(tag).toContain('focusable="false"');
  }
  expect(markup(html)).not.toMatch(/\sstyle=/);
  const svgBlocks = html.match(/<svg[\s\S]*?<\/svg>/g) ?? [];
  for (const block of svgBlocks) expect(block).not.toContain('<style');
  // stroke colours come from classes, not from literal colours on the elements
  expect(markup(html)).not.toMatch(/\s(stroke|fill)="(?!none|currentColor)[^"]*"/);
  expect(markup(html)).toMatch(/class="[^"]*"/);
}

describe.each(['ridge', 'corner'])('Contours variant "%s"', (variant) => {
  it('is an aria-hidden inline SVG with class-based colours and no style attribute', async () => {
    const html = await render('Contours', { variant });
    expect(markup(html)).toContain('<svg');
    expectDecorativeSvg(html);
  });
});

describe('TerrainMap panel', () => {
  it('is hidden from assistive technology as a whole, inline SVG, class-based colours', async () => {
    const html = await render('TerrainMap');
    expect(html.trimStart()).toMatch(/^<[a-z]+\b[^>]*aria-hidden="true"/);
    expectDecorativeSvg(html);
  });

  it('has the 4 x 4 grid, a dashed route, the pin, its label and the coordinates', async () => {
    const html = markup(await render('TerrainMap'));
    // 4 x 4 cells, drawn as in the design: one empty span with two gradient layers at 25 % steps
    expect(html).toMatch(/<span\b[^>]*data-part="grid"[^>]*data-grid="4x4"[^>]*><\/span>/);
    expect(html).not.toMatch(/<line\b/);
    const source = readFileSync(`${dir}TerrainMap.astro`, 'utf8');
    const grid = source.match(/\.terrain__grid\s*\{([^}]*)\}/)?.[1] ?? '';
    expect(grid.match(/linear-gradient\(/g)).toHaveLength(2);
    expect(grid).toMatch(/linear-gradient\(\s*90deg,/);
    expect(grid).toMatch(/background-size:\s*25% 25%/);
    // the route starts at 30 % of the panel, as in the design, with no offset workaround
    const trail = source.match(/\.terrain__trail\s*\{([^}]*)\}/)?.[1] ?? '';
    expect(trail).toMatch(/left:\s*30%/);
    expect(trail).not.toMatch(/translate|right:/);
    // the frame holds a generated contour map (one long path), as in the design
    expect(html).toMatch(/data-part="relief"[^>]*\sd="M[^"]{5000,}"/);
    expect(html).toMatch(/data-part="route"[^>]*stroke-dasharray="4 5"/);
    expect(html).toMatch(/data-part="route"/);
    expect(html).toMatch(/data-part="pin"/);
    expect(html).toContain('You are here');
    expect(text(html)).toContain('59.91° N · 10.75° E');
  });
});

describe('Wordmark', () => {
  it.each([
    ['default', {}],
    ['on spruce', { onSpruce: true }],
  ])('links to / with an accessible name in the %s variant', async (_n, props) => {
    const html = markup(await render('Wordmark', props));
    expect(html).toMatch(/<a\b[^>]*href="\/"/);
    expect(html.replace(/<[^>]+>/g, '')).toContain('alpon.dev');
  });

  it('keeps "alpon.dev" as one word with ".dev" in its own accent element', async () => {
    const html = markup(await render('Wordmark'));
    // tags removed without inserting spaces: the text reads "alpon.dev"
    expect(html.replace(/<[^>]+>/g, '').replace(/\s+/g, '')).toBe('alpon.dev');
    expect(html).toMatch(/alpon<span\b[^>]*>\.dev<\/span>/);
  });

  it('on spruce differs from the default', async () => {
    const a = await render('Wordmark');
    const b = await render('Wordmark', { onSpruce: true });
    expect(a).not.toBe(b);
  });
});
