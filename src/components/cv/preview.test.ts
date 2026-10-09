import { getViteConfig } from 'astro/config';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { createServer, type ViteDevServer } from 'vite';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { cvDate, cvPdf } from '../../data/cv/index';
import type { CvLang } from '../../data/cv/types';

// AC-05, AC-09, AC-10 (T11; screens.md SCR-05 / SCR-06 preview and meta line; C-3, C-8).
// Native <details>, two lazy page images inside links, no embedded PDF, and the meta line.

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

async function render(file: string, lang: CvLang): Promise<string> {
  const mod = await server.ssrLoadModule(`/src/components/cv/${file}.astro`);
  return container.renderToString(mod.default, { props: { lang } });
}

const names = {
  en: [
    'CV page 1 of 2, English, PDF, opens in a new tab',
    'CV page 2 of 2, English, PDF, opens in a new tab',
  ],
  no: [
    'CV, side 1 av 2, norsk, PDF, åpnes i ny fane',
    'CV, side 2 av 2, norsk, PDF, åpnes i ny fane',
  ],
} as const;
const summaryText = { en: 'View original PDF', no: 'Se original-PDF' } as const;
const metaText = {
  en: ['Last updated', 'PDF · 2 pages · A4'],
  no: ['Sist oppdatert', 'PDF · 2 sider · A4'],
} as const;

const attr = (tag: string, name: string) =>
  new RegExp(String.raw`\s${name}="([^"]*)"`).exec(tag)?.[1];

describe.each(['en', 'no'] as const)('OriginalPdfPreview (%s)', (lang) => {
  it('is one native details, closed on arrival, with the summary text of the CV language', async () => {
    const html = await render('OriginalPdfPreview', lang);
    expect(html.match(/<details\b/g)).toHaveLength(1);
    const open = /<details\b[^>]*>/.exec(html)?.[0] ?? '';
    expect(open).not.toMatch(/\sopen\b/);
    const summary = /<summary\b[^>]*>([\s\S]*?)<\/summary>/.exec(html);
    expect(summary).not.toBeNull();
    expect(text(summary?.[1] ?? '')).toContain(summaryText[lang]);
  });

  it('has two links to the CV PDF of the language, in a new tab, with the AC-09 / C-3 names', async () => {
    const html = await render('OriginalPdfPreview', lang);
    const links = [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)];
    expect(links).toHaveLength(2);
    links.forEach((m, i) => {
      const tag = m[1] ?? '';
      expect(attr(tag, 'href')).toBe(cvPdf[lang].href);
      expect(attr(tag, 'target')).toBe('_blank');
      expect(attr(tag, 'rel')).toBe('noopener noreferrer');
      expect(m[2]).toContain(`alt="${names[lang][i]}"`);
    });
  });

  it('gives every page image loading=lazy, width, height, its source and the name as alt', async () => {
    const html = await render('OriginalPdfPreview', lang);
    const imgs = [...html.matchAll(/<img\b([^>]*)>/g)].map((m) => m[1] ?? '');
    expect(imgs).toHaveLength(2);
    imgs.forEach((tag, i) => {
      const image = cvPdf[lang].images[i];
      expect(attr(tag, 'loading')).toBe('lazy');
      expect(attr(tag, 'src')).toBe(image?.src);
      expect(attr(tag, 'width')).toBe(String(image?.width));
      expect(attr(tag, 'height')).toBe(String(image?.height));
      expect(attr(tag, 'alt')).toBe(names[lang][i]);
    });
  });

  it('embeds no PDF', async () => {
    const html = await render('OriginalPdfPreview', lang);
    expect(html).not.toMatch(/<(embed|object|iframe)\b/i);
  });

  it('shows the meta line under the images', async () => {
    const html = await render('OriginalPdfPreview', lang);
    expect(html).toContain(`datetime="${cvDate}"`);
  });
});

describe.each(['en', 'no'] as const)('CvMeta (%s)', (lang) => {
  it('shows the CV date in a time element and the format line in the CV language', async () => {
    const html = await render('CvMeta', lang);
    const time = /<time\b([^>]*)>([\s\S]*?)<\/time>/.exec(html);
    expect(time).not.toBeNull();
    expect(attr(time?.[1] ?? '', 'datetime')).toBe(cvDate);
    expect(text(time?.[2] ?? '')).not.toBe('');
    const t = text(html);
    for (const part of metaText[lang]) expect(t).toContain(part);
  });
});
