import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { getViteConfig } from 'astro/config';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { createServer, type ViteDevServer } from 'vite';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

// AC-02, AC-30, AC-31 (screens.md SCR-01 portrait and motion states; sad §8 Portrait, Ambient
// motion, Motion control). Components are rendered with the Astro container; the CSS rules
// (paused by default, running only under data-motion) are read from the component source.

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
  const mod = await server.ssrLoadModule(`/src/components/home/${name}.astro`);
  return container.renderToString(mod.default, { props });
}
const markup = (html: string) => html.replace(/<style[\s\S]*?<\/style>/g, '');
const source = (name: string) => readFileSync(`${dir}${name}.astro`, 'utf8');

describe('Portrait (AC-02)', () => {
  it('is a picture with an AVIF and a WebP source, each with 340w and 680w candidates', async () => {
    const html = markup(await render('Portrait'));
    expect(html).toMatch(/<picture\b/);
    const avif = html.match(/<source\b[^>]*type="image\/avif"[^>]*>/)?.[0] ?? '';
    const webp = html.match(/<source\b[^>]*type="image\/webp"[^>]*>/)?.[0] ?? '';
    expect(avif).toMatch(/\/img\/portrait-v1-340\.avif 340w/);
    expect(avif).toMatch(/\/img\/portrait-v1-680\.avif 680w/);
    expect(webp).toMatch(/\/img\/portrait-v1-340\.webp 340w/);
    expect(webp).toMatch(/\/img\/portrait-v1-680\.webp 680w/);
    expect(avif).toMatch(/sizes="/);
    expect(webp).toMatch(/sizes="/);
  });

  it('has sizes for 200, 260 and 340 px', async () => {
    const html = markup(await render('Portrait'));
    const sizes = html.match(/\bsizes="([^"]*)"/)?.[1] ?? '';
    expect(sizes).toMatch(/200px/);
    expect(sizes).toMatch(/260px/);
    expect(sizes).toMatch(/340px/);
  });

  it('reserves its space with width and height and is not lazy-loaded', async () => {
    const html = markup(await render('Portrait'));
    const img = html.match(/<img\b[^>]*>/)?.[0] ?? '';
    expect(img).toMatch(/\swidth="\d+"/);
    expect(img).toMatch(/\sheight="\d+"/);
    expect(img).not.toMatch(/loading="lazy"/);
  });

  it('is announced as an image named with the name', async () => {
    const html = markup(await render('Portrait'));
    expect(html.match(/<img\b[^>]*>/)?.[0] ?? '').toMatch(/alt="Alexander Ponomarenko"/);
  });

  it('floats only under data-motion="running" (paused by default, from the float token)', () => {
    const src = source('Portrait');
    expect(src).toMatch(/animation:[^;]*var\(--fjord-duration-float\)/);
    expect(src).toMatch(/animation-play-state:\s*paused/);
    expect(src).toMatch(
      /\[data-motion=['"]running['"]\][^{]*\{[^}]*animation-play-state:\s*running/,
    );
  });
});

describe('MotionControl (AC-30, AC-31)', () => {
  it('is a button hooked for the script, named for its action, not pressed at first', async () => {
    const html = markup(await render('MotionControl'));
    const button = html.match(/<button\b[^>]*>/)?.[0] ?? '';
    expect(button).toMatch(/data-motion-control/);
    expect(button).toMatch(/aria-label="Pause animation"/);
    expect(button).toMatch(/aria-pressed="false"/);
  });

  it('carries both the play and the pause icon', async () => {
    const html = markup(await render('MotionControl'));
    expect(html.match(/<svg\b/g)?.length ?? 0).toBeGreaterThanOrEqual(2);
    expect(html).toMatch(/data-motion-icon="play"/);
    expect(html).toMatch(/data-motion-icon="pause"/);
  });

  it('is displayed only when data-motion exists on the hero, and keeps its place', () => {
    const src = source('MotionControl');
    expect(src).toMatch(/\[data-motion\]/);
    expect(src).toMatch(/visibility:\s*hidden/);
    expect(src).not.toMatch(/display:\s*none/);
  });
});
