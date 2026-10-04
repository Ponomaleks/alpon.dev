import { getViteConfig } from 'astro/config';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { createServer, type ViteDevServer } from 'vite';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

// Brand components (AC-17, AC-19; screens.md SCR-04 rows Contours, Terrain map, Wordmark).
// Each component is rendered on its own with the Astro container, through a Vite server that
// carries the Astro plugin (the .astro files are not plain modules).

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
    expect(html).toMatch(/data-grid="4x4"|data-part="grid"/);
    // 4 x 4 cells are drawn by 3 vertical and 3 horizontal inner lines (25 / 50 / 75 %)
    const gridLines = html.match(/<line\b[^>]*data-grid-line="[vh]"[^>]*>/g) ?? [];
    expect(gridLines.filter((l) => l.includes('data-grid-line="v"'))).toHaveLength(3);
    expect(gridLines.filter((l) => l.includes('data-grid-line="h"'))).toHaveLength(3);
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
