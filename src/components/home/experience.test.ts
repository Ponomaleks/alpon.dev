import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { getViteConfig } from 'astro/config';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { createServer, type ViteDevServer } from 'vite';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { contact } from '../../data/contact';
import { experience } from '../../data/home';

// AC-08 (T13; screens.md SCR-01 experience; sad §8 Experience entries). Four native <details>
// entries from home.ts, the first open, each summary always showing role, organisation and
// period; summary text, points and tags live in the body. Opening and closing is measured in T20.

const dir = fileURLToPath(new URL('./', import.meta.url));
let server: ViteDevServer;
let container: AstroContainer;

beforeAll(async () => {
  const config = await getViteConfig({})({ mode: 'test', command: 'serve' });
  server = await createServer({
    ...config,
    // No file watcher (tests never change files; Astro's own sync server does the same), and a
    // dependency cache of its own, so a unit run does not replace the one of `astro dev` (B-46, B-68).
    cacheDir: 'node_modules/.vite-unit',
    server: { middlewareMode: true, watch: null },
    appType: 'custom',
  });
  container = await AstroContainer.create();
}, 120_000);
afterAll(() => server?.close());

const markup = (html: string) => html.replace(/<style[\s\S]*?<\/style>/g, '');
const text = (html: string) =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCodePoint(Number(n)))
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ');

async function render(): Promise<string> {
  const mod = await server.ssrLoadModule('/src/components/home/ExperienceList.astro');
  return markup(await container.renderToString(mod.default));
}

function entries(html: string) {
  return (html.match(/<details\b[\s\S]*?<\/details>/g) ?? []).map((d) => {
    const summary = d.match(/<summary\b[\s\S]*?<\/summary>/)?.[0] ?? '';
    return {
      all: d,
      open: d.match(/<details\b[^>]*>/)?.[0] ?? '',
      summary,
      body: d.replace(summary, ''),
    };
  });
}

describe('ExperienceList', () => {
  it('renders four native details entries, only the first with open', async () => {
    const html = await render();
    expect(experience).toHaveLength(4);
    const list = entries(html);
    expect(list).toHaveLength(4);
    expect(list.map((e) => /\sopen(?=[\s=>])/.test(e.open))).toEqual([true, false, false, false]);
  });

  it('shows role, organisation and period in every summary', async () => {
    const list = entries(await render());
    experience.forEach((x, i) => {
      const s = text(list[i]?.summary ?? '');
      expect(s).toContain(x.role);
      expect(s).toContain(x.org);
      expect(s).toContain(x.period);
    });
  });

  it('keeps the en dash of the design copy in date ranges', async () => {
    const html = await render();
    expect(html).toContain('Nov 2022 – Jan 2026');
    expect(html).toContain('Dec 2010 – Nov 2021');
  });

  it('puts the summary, points and tags inside the body, not the summary', async () => {
    const list = entries(await render());
    experience.forEach((x, i) => {
      const body = text(list[i]?.body ?? '');
      const head = text(list[i]?.summary ?? '');
      expect(body).toContain(x.summary);
      expect(head).not.toContain(x.summary);
      for (const p of x.points) expect(body).toContain(p);
      for (const t of x.stack) expect(body).toContain(t);
    });
  });

  it('renders no empty list for an entry without points or tags', async () => {
    const html = await render();
    expect(html).not.toMatch(/<ul\b[^>]*>\s*<\/ul>/);
    const list = entries(html);
    experience.forEach((x, i) => {
      const lists = list[i]?.body.match(/<ul\b/g) ?? [];
      expect(lists).toHaveLength((x.points.length ? 1 : 0) + (x.stack.length ? 1 : 0));
    });
    expect(experience.some((x) => x.points.length === 0)).toBe(true);
    expect(experience.some((x) => x.stack.length === 0)).toBe(true);
  });

  it('has a "Full CV" link to contact.links.cv', async () => {
    const html = await render();
    expect(contact.links.cv).toBe('/cv/en');
    const link =
      html.match(new RegExp(`<a\\b[^>]*href="${contact.links.cv}"[^>]*>[\\s\\S]*?</a>`))?.[0] ?? '';
    expect(text(link)).toContain('Full CV');
  });

  // Page design (Home.jsx): <TextLink variant="standalone">Full CV</TextLink>, a link with an arrow.
  it('draws "Full CV" as a standalone link with its arrow', async () => {
    const html = await render();
    const link =
      html.match(new RegExp(`<a\\b[^>]*href="${contact.links.cv}"[^>]*>[\\s\\S]*?</a>`))?.[0] ?? '';
    expect(link).toMatch(/class="[^"]*\bfj-link--standalone\b/);
    expect(link).toMatch(/<svg\b[^>]*aria-hidden="true"/);
    expect(link).not.toMatch(/\b(target|rel)=/);
  });

  it('puts the period before the role and the organisation in every summary', async () => {
    const list = entries(await render());
    experience.forEach((x, i) => {
      const s = text(list[i]?.summary ?? '');
      expect(s.indexOf(x.period)).toBeGreaterThanOrEqual(0);
      expect(s.indexOf(x.period)).toBeLessThan(s.indexOf(x.role));
      expect(s.indexOf(x.role)).toBeLessThan(s.indexOf(x.org));
    });
  });

  it('marks the chevron through the [open] selector, without a script', async () => {
    const html = await render();
    expect(html).toMatch(/chevron-down/);
    expect(html).not.toMatch(/<script\b/);
    expect(readFileSync(`${dir}ExperienceList.astro`, 'utf8')).toMatch(/\[open\]/);
  });

  it('makes the summary target at least 44 px high in the styles', () => {
    const source = readFileSync(`${dir}ExperienceList.astro`, 'utf8');
    const rule = [...source.matchAll(/([^{}]*summary[^{}]*)\{([^}]*)\}/g)].find(([, , body]) =>
      /min-height\s*:/.test(body ?? ''),
    );
    expect(rule?.[2]).toMatch(/min-height:\s*(var\(--fjord-tap-min\)|44px)/);
  });
});
