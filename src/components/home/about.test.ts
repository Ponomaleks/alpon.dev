import { getViteConfig } from 'astro/config';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { createServer, type ViteDevServer } from 'vite';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { intro, quickFacts } from '../../data/home';

// AC-07 (T12; screens.md SCR-01 about). Heading, introduction and a description list of four
// quick facts from home.ts. Plain text only: no logos, bars, percentages or level codes.

let server: ViteDevServer;
let container: AstroContainer;

beforeAll(async () => {
  const config = await getViteConfig({})({ mode: 'test', command: 'serve' });
  server = await createServer({ ...config, server: { middlewareMode: true }, appType: 'custom' });
  container = await AstroContainer.create();
}, 120_000);
afterAll(() => server?.close());

const text = (s: string) =>
  s
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

async function renderAbout(index = '07'): Promise<string> {
  const mod = await server.ssrLoadModule('/src/components/home/About.astro');
  return container.renderToString(mod.default, { props: { index } });
}

describe('About', () => {
  it('prints the heading and the introduction', async () => {
    const html = await renderAbout();
    expect(html).toMatch(/<h2\b[^>]*>\s*Frontend-focused, full stack\.\s*<\/h2>/);
    expect(text(html)).toContain(text(intro));
  });

  it('takes the section number from a prop', async () => {
    expect(text(await renderAbout('07'))).toContain('07');
    expect(text(await renderAbout('42'))).toContain('42');
  });

  it('lists the four quick facts in a description list with the keys in order', async () => {
    const html = await renderAbout();
    expect(html.match(/<dl\b/g)).toHaveLength(1);
    const keys = [...html.matchAll(/<dt\b[^>]*>([\s\S]*?)<\/dt>/g)].map((m) => text(m[1] ?? ''));
    expect(keys).toEqual(['Based in', 'Focus', 'Stack', 'Languages']);
    expect(quickFacts.map((f) => f.k)).toEqual(keys);
    const values = [...html.matchAll(/<dd\b[^>]*>([\s\S]*?)<\/dd>/g)].map((m) => text(m[1] ?? ''));
    expect(values).toEqual(quickFacts.map((f) => text(f.v)));
  });

  it('gives the residence with the work region and the work permit', async () => {
    const html = text(await renderAbout());
    expect(html).toContain('Nittedal, Oslo area');
    expect(html).toMatch(/work permit/i);
  });

  it('shows the three languages as plain labels without level codes', async () => {
    const html = text(await renderAbout());
    expect(html).toContain('English, upper-intermediate');
    expect(html).toContain('Norwegian, intermediate');
    expect(html).toContain('Ukrainian, native');
    expect(html).not.toMatch(/\b[ABC][12]\b/);
  });

  it('has no image, logo, meter or progress element', async () => {
    const html = await renderAbout();
    expect(html).not.toMatch(/<(img|svg|picture|meter|progress|canvas)\b/i);
    expect(html).not.toMatch(/role="(meter|progressbar|img)"/);
    expect(html).not.toMatch(/\d\s*%/);
  });
});
