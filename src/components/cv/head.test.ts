import { getViteConfig } from 'astro/config';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { createServer, type ViteDevServer } from 'vite';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { contact } from '../../data/contact';
import { cvDate, cvPdf } from '../../data/cv/index';
import type { CvLang } from '../../data/cv/types';

// AC-01, AC-02, AC-05, AC-06 (T16; screens.md SCR-05 / SCR-06 `head`, `meta line`, `download`).
// CvHead: breadcrumbs, the name as the only h1, role and location lines, the large language switch,
// "Download PDF" as the one primary button, the secondary contact button, and the meta line.

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

const text = (s: string) =>
  s
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#38;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();

// The role and location lines are CV content; the page passes them in (sad §5).
const lines = {
  en: {
    role: 'Frontend Developer · Backend Experience',
    location: '1482 Nittedal, Norway · Norwegian work permit',
  },
  no: {
    role: 'Frontend-utvikler · backend-erfaring',
    location: '1482 Nittedal, Norge · Arbeidstillatelse i Norge',
  },
} as const;

async function render(lang: CvLang): Promise<string> {
  const mod = await server.ssrLoadModule('/src/components/cv/CvHead.astro');
  return container.renderToString(mod.default, { props: { lang, ...lines[lang] } });
}

const attr = (tag: string, name: string) =>
  new RegExp(String.raw`\s${name}="([^"]*)"`).exec(tag)?.[1];
const hasAttr = (tag: string, name: string) =>
  new RegExp(String.raw`\s${name}(\s|=|>|$)`).test(tag);

function anchors(html: string) {
  return [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)].map((m) => ({
    attrs: m[1] ?? '',
    label: text(m[2] ?? ''),
  }));
}

const download = { en: 'Download PDF', no: 'Last ned PDF' } as const;
const touch = { en: 'Get in touch', no: 'Ta kontakt' } as const;

describe.each(['en', 'no'] as const)('CvHead (%s)', (lang) => {
  it('has the name as the only h1', async () => {
    const html = await render(lang);
    const h1s = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)];
    expect(h1s).toHaveLength(1);
    expect(text(h1s[0]?.[1] ?? '')).toBe('Alexander Ponomarenko');
  });

  it('has breadcrumbs "alpon.dev / CV" with the site name as a link home', async () => {
    const html = await render(lang);
    const nav = /<nav\b[^>]*>([\s\S]*?)<\/nav>/.exec(html);
    expect(nav).not.toBeNull();
    const items = [...(nav?.[1] ?? '').matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/g)].map((m) =>
      text(m[1] ?? ''),
    );
    expect(items).toEqual(['alpon.dev', 'CV']);
    const home = anchors(nav?.[1] ?? '');
    expect(home).toHaveLength(1);
    expect(home[0]?.label).toBe('alpon.dev');
    expect(attr(home[0]?.attrs ?? '', 'href')).toBe('/');
    expect(nav?.[1]).toMatch(/<span\b[^>]*aria-current="page"[^>]*>\s*CV\s*<\/span>/);
  });

  it('shows the role line and the location line from the CV data', async () => {
    const html = await render(lang);
    const t = text(html);
    expect(t).toContain(lines[lang].role);
    expect(t).toContain(lines[lang].location);
  });

  it('has the large language switch marking the CV language of the page', async () => {
    const html = await render(lang);
    expect(html.match(/data-lang-switch/g)).toHaveLength(1);
    expect(html).toMatch(/data-size="large"/);
    const links = anchors(html).filter((a) => hasAttr(a.attrs, 'data-switch-to'));
    expect(links.map((a) => attr(a.attrs, 'data-switch-to'))).toEqual(['en', 'no']);
    const current = links.filter((a) => attr(a.attrs, 'aria-current') === 'true');
    expect(current).toHaveLength(1);
    expect(attr(current[0]?.attrs ?? '', 'data-switch-to')).toBe(lang);
    expect(attr(links[0]?.attrs ?? '', 'href')).toBe(contact.links.cvPages.en);
    expect(attr(links[1]?.attrs ?? '', 'href')).toBe(contact.links.cvPages.no);
  });

  it('has exactly one primary button, "Download PDF", saving the file of the CV language', async () => {
    const html = await render(lang);
    const primary = anchors(html).filter((a) => /fj-btn--primary/.test(a.attrs));
    expect(primary).toHaveLength(1);
    const a = primary[0];
    expect(a?.label).toBe(download[lang]);
    expect(attr(a?.attrs ?? '', 'href')).toBe(cvPdf[lang].href);
    expect(attr(a?.attrs ?? '', 'download')).toBe(cvPdf[lang].downloadName);
    expect(html.match(/fj-btn--primary/g)).toHaveLength(1);
  });

  it('has the secondary contact button in the CV language, to the contact place', async () => {
    const html = await render(lang);
    const secondary = anchors(html).filter((a) => /fj-btn--secondary/.test(a.attrs));
    expect(secondary).toHaveLength(1);
    expect(secondary[0]?.label).toBe(touch[lang]);
    expect(attr(secondary[0]?.attrs ?? '', 'href')).toBe(contact.links.contact);
  });

  it('has "Print" as a ghost button behind data-needs-script (AC-11, AC-23)', async () => {
    const html = await render(lang);
    const label = { en: 'Print', no: 'Skriv ut' }[lang];
    const ghost = [...html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)].filter((m) =>
      /fj-btn--ghost/.test(m[1] ?? ''),
    );
    expect(ghost).toHaveLength(1);
    expect(text(ghost[0]?.[2] ?? '')).toBe(label);
    expect(ghost[0]?.[1]).not.toMatch(/fj-btn--primary/);
    expect(html).toMatch(/data-needs-script[^>]*>\s*<button\b[^>]*fj-btn--ghost/);
  });

  it('still has one primary button with Print added (AC-06)', async () => {
    const html = await render(lang);
    expect(html.match(/fj-btn--primary/g)).toHaveLength(1);
  });

  it('has the meta line with the CV date', async () => {
    const html = await render(lang);
    expect(html).toMatch(/class="cv-meta"/);
    const time = /<time\b([^>]*)>([\s\S]*?)<\/time>/.exec(html);
    expect(attr(time?.[1] ?? '', 'datetime')).toBe(cvDate);
    expect(text(time?.[2] ?? '')).toBe(cvDate);
  });
});
