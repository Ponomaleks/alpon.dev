import { getViteConfig } from 'astro/config';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { createServer, type ViteDevServer } from 'vite';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { contact } from '../../data/contact';
import { features } from '../../data/site';

// AC-01, AC-03, AC-04 (T10; screens.md SCR-01 hero). The hero content in the built HTML: one h1
// with the name, both roles, the lead, the Norwegian marks, the Work region coordinates, one
// primary "View CV", and the Now line with and without a project. `nowProject` is the optional
// prop that overrides the project from home.ts; an empty string means no project.

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

async function renderHero(props?: { nowProject?: string }): Promise<string> {
  const mod = await server.ssrLoadModule('/src/components/home/Hero.astro');
  return container.renderToString(mod.default, props ? { props } : undefined);
}

describe('Hero content (AC-01)', () => {
  it('has one h1 with the name', async () => {
    const html = await renderHero();
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html).toMatch(/<h1\b[^>]*>\s*Alexander Ponomarenko\s*<\/h1>/);
    expect(contact.name).toBe('Alexander Ponomarenko');
  });

  it('prints both roles and the lead', async () => {
    const t = text(await renderHero());
    expect(t).toContain('Software Engineer');
    expect(t).toContain('Full Stack Developer');
    expect(t).toContain('Good products are built together.');
  });

  it('shows the availability badge with the Oslo area', async () => {
    const t = text(await renderHero());
    expect(t).toContain('Open to work');
    expect(t).toContain('Oslo area');
  });

  it('marks "Hei.", the work region and "Nå:" as Norwegian', async () => {
    const html = await renderHero();
    expect(html).toMatch(/<[a-z]+\b[^>]*\blang="no"[^>]*>\s*Hei\.\s*<\//);
    const region = contact.workRegion.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    expect(html).toMatch(new RegExp(`<[a-z]+\\b[^>]*\\blang="no"[^>]*>\\s*${region}\\s*<\\/`));
    expect(html).toMatch(/<[a-z]+\b[^>]*\blang="no"[^>]*>\s*Nå:\s*<\//);
  });

  it('prints the Work region coordinates from contact.ts, not the residence', async () => {
    const t = text(await renderHero());
    const { lat, lon } = contact.workRegionGeo;
    expect(t).toContain(`${lat.toFixed(2)}° N`);
    expect(t).toContain(`${lon.toFixed(2)}° E`);
    expect(t).not.toContain(contact.residence.lat.toFixed(2));
    expect(t).not.toContain('Nittedal');
  });

  it('has exactly one primary button, "View CV", linking to contact.links.cv', async () => {
    expect(contact.links.cv).toBe('/cv/en');
    expect(contact.links.cvPages).toEqual({ en: '/cv/en', no: '/cv/no' });
    const html = await renderHero();
    const primaries = html.match(
      /<(?:a|button)\b[^>]*class="[^"]*\bfj-btn--primary\b[^"]*"[^>]*>/g,
    );
    expect(primaries).toHaveLength(1);
    expect(primaries?.[0]).toContain(`href="${contact.links.cv}"`);
    const anchor = html.match(/<a\b[^>]*\bfj-btn--primary\b[^>]*>([\s\S]*?)<\/a>/);
    expect(text(anchor?.[1] ?? '')).toBe('View CV');
  });

  it('holds the portrait, the Motion control and the parallax contours layer', async () => {
    const html = await renderHero();
    expect(html).toMatch(/<[^>]*\bdata-hero\b[^>]*>/);
    expect(html).toContain('data-motion-control');
    expect(html).toContain('data-contours-parallax');
    expect(html).toContain('/img/portrait-v1-680.webp');
  });

  it('builds the contours layer without a style attribute', async () => {
    const html = await renderHero();
    const layer = html.match(/<[^>]*\bdata-contours-parallax\b[^>]*>/)?.[0] ?? '';
    expect(layer).not.toMatch(/\bstyle=/);
  });
});

describe('Hero actions (AC-04)', () => {
  it('does not offer "See projects" while features.projects is false', async () => {
    expect(features.projects).toBe(false);
    const html = await renderHero();
    expect(text(html)).not.toContain('See projects');
    expect(html).not.toContain('/projects');
  });
});

describe('Hero Now line (AC-03)', () => {
  it('shows the project first, then the MSc part, when a project is supplied', async () => {
    const t = text(await renderHero({ nowProject: 'alpon.dev' }));
    expect(t).toContain('Nå: alpon.dev · MSc Computer Science at Woolf University');
  });

  it('shows only the MSc part without a project', async () => {
    const t = text(await renderHero({ nowProject: '' }));
    expect(t).toContain('Nå: MSc Computer Science at Woolf University');
    expect(t).not.toContain('alpon.dev');
  });

  // Page design (.x-hero__now): the dot, "Nå:" and the text are three items of a wrapping row, so
  // on a phone "Nå:" keeps the first line with the dot and the text starts on the next one.
  it('lays the dot, "Nå:" and the text out as three items of the line', async () => {
    const html = await renderHero({ nowProject: 'alpon.dev' });
    const now =
      html.match(/<p\b[^>]*class="[^"]*\bhero__now\b[^"]*"[^>]*>([\s\S]*?)<\/p>/)?.[1] ?? '';
    const items = [...now.matchAll(/<span\b([^>]*)>([\s\S]*?)<\/span>/g)].map(
      ([, attrs, body]) => ({
        attrs,
        body: text(body ?? ''),
      }),
    );
    expect(items).toHaveLength(3);
    expect(items[0]?.attrs).toMatch(/class="[^"]*\bhero__dot\b/);
    expect(items[0]?.attrs).toMatch(/aria-hidden="true"/);
    expect(items[0]?.body).toBe('');
    expect(items[1]?.attrs).toMatch(/lang="no"/);
    expect(items[1]?.body).toBe('Nå:');
    expect(items[2]?.attrs).toMatch(/class="[^"]*\bhero__now-text\b/);
    expect(items[2]?.body).toBe('alpon.dev · MSc Computer Science at Woolf University');
  });

  it('prints no square brackets in either state', async () => {
    for (const props of [{ nowProject: 'alpon.dev' }, { nowProject: '' }, undefined]) {
      const t = text(await renderHero(props));
      expect(t).not.toMatch(/[[\]]/);
    }
  });
});
