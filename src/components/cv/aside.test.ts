import { getViteConfig } from 'astro/config';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { createServer, type ViteDevServer } from 'vite';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { contact } from '../../data/contact';
import { cvPdf } from '../../data/cv/index';
import { cvSectionIds } from '../../data/cv/sections';

// AC-02, AC-04 (T12; screens.md SCR-05 / SCR-06 "side column", C-1, C-3). Contract: CvAside takes
// `lang` ('en' | 'no') and `sections` (the sections present, in order, as { id, heading }); the
// number of a link is its position. Copy is `[data-copy-email]` behind `data-needs-script`.

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
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();

const headingsEn = [
  'Profile',
  'Skills',
  'Languages',
  'Work experience',
  'Personal projects',
  'Education',
  'Courses',
  'Community & volunteering',
];
const sections = cvSectionIds.map((id, i) => ({ id, heading: headingsEn[i] as string }));

async function render(lang: 'en' | 'no', list = sections): Promise<string> {
  const mod = await server.ssrLoadModule('/src/components/cv/CvAside.astro');
  return container.renderToString(mod.default, { props: { lang, sections: list } });
}

const anchors = (html: string) =>
  [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)].map((m) => ({
    attrs: m[1] ?? '',
    label: text(m[2] ?? ''),
  }));
const href = (attrs: string) => attrs.match(/href="([^"]*)"/)?.[1];

describe('CvAside contents list', () => {
  it('is a named nav with one numbered link per section, href the shared id (AC-04)', async () => {
    const html = await render('en');
    expect(html).toMatch(/<nav\b[^>]*aria-label="[^"]+"/);
    const links = anchors(html).filter((a) => href(a.attrs)?.startsWith('#'));
    expect(links.map((a) => href(a.attrs))).toEqual(cvSectionIds.map((id) => `#${id}`));
    links.forEach((a, i) => {
      expect(a.label).toContain(String(i + 1).padStart(2, '0'));
      expect(a.label).toContain(headingsEn[i]);
    });
  });

  it('leaves no gap when a section is missing (AC-04)', async () => {
    const html = await render(
      'en',
      sections.filter((s) => s.id !== 'courses'),
    );
    const links = anchors(html).filter((a) => href(a.attrs)?.startsWith('#'));
    expect(links).toHaveLength(7);
    expect(links[6]?.label).toContain('07');
    expect(html).not.toContain('href="#courses"');
  });

  it('prints the eyebrows "On this page" and "Contact" (SCR-05)', async () => {
    const t = text(await render('en'));
    expect(t).toContain('On this page');
    expect(t).toContain('Contact');
  });
});

describe('CvAside contact list', () => {
  it('equals contact.ts (AC-04)', async () => {
    const html = await render('en');
    const links = anchors(html);
    const hrefs = links.map((a) => href(a.attrs));
    expect(hrefs).toContain(`mailto:${contact.email}`);
    expect(hrefs).toContain(`tel:${contact.phone.replace(/[^\d+]/g, '')}`);
    expect(hrefs).toContain(contact.linkedin);
    expect(hrefs).toContain(contact.github);
    const t = text(html);
    expect(t).toContain(contact.email);
    expect(t).toContain(contact.phone);
    expect(t).toContain(contact.residence.name);
  });

  it('opens LinkedIn and GitHub in a new tab (AC-04)', async () => {
    const links = anchors(await render('en'));
    for (const url of [contact.linkedin, contact.github]) {
      const a = links.find((l) => href(l.attrs) === url);
      expect(a?.attrs).toMatch(/target="_blank"/);
    }
  });

  it('marks "Nittedal, Norge" as Norwegian (AC-04)', async () => {
    const html = await render('en');
    expect(html).toMatch(/<[a-z]+\b[^>]*lang="no"[^>]*>\s*Nittedal, Norge\s*</);
  });

  it('has the English row labels (SCR-05)', async () => {
    const t = text(await render('en'));
    for (const l of ['Email', 'Phone', 'LinkedIn', 'GitHub', 'Based in']) expect(t).toContain(l);
  });

  it('offers no contact card and no QR (AC-04)', async () => {
    for (const lang of ['en', 'no'] as const) {
      const html = await render(lang);
      expect(html).not.toMatch(/\.vcf/);
      expect(html).not.toMatch(/<svg[^>]*qr|qr-vcard|QrTile/i);
    }
  });

  it('puts Copy behind data-needs-script (AC-04, AC-23)', async () => {
    const html = await render('en');
    const btn = html.match(/<button\b[^>]*data-copy-email[^>]*>/)?.[0];
    expect(btn).toBeDefined();
    expect(html).toMatch(/data-needs-script[^>]*>[\s\S]*?data-copy-email/);
    expect(text(html)).toContain('Copy');
  });
});

describe('CvAside on the Norwegian page (AC-02, C-3)', () => {
  it('uses the Norwegian row labels and "Kopier"', async () => {
    const html = await render('no');
    const t = text(html);
    for (const l of ['E-post', 'Telefon', 'LinkedIn', 'GitHub', 'Bosted']) expect(t).toContain(l);
    expect(t).toContain('Kontakt');
    expect(t).toContain('På denne siden');
    expect(t).toContain('Kopier');
    expect(html).toContain('Kopiert');
    expect(html).toMatch(/data-copy-lang="no"/);
  });
});

describe('CvAside download (AC-04, AC-05)', () => {
  it('is a secondary "Download PDF" with the file name of AC-05', async () => {
    const html = await render('en');
    const a = anchors(html).find((l) => l.label.includes('Download PDF'));
    expect(a).toBeDefined();
    expect(a?.attrs).toMatch(/\bdownload="Alexander_Ponomarenko_CV_EN\.pdf"/);
    expect(href(a?.attrs ?? '')).toBe(cvPdf.en.href);
    expect(a?.attrs).toMatch(/secondary/);
    expect(a?.attrs).not.toMatch(/primary/);
  });

  it('says "Last ned PDF" on the Norwegian page with the Norwegian file', async () => {
    const html = await render('no');
    const a = anchors(html).find((l) => l.label.includes('Last ned PDF'));
    expect(a?.attrs).toMatch(/\bdownload="Alexander_Ponomarenko_CV_NO\.pdf"/);
    expect(href(a?.attrs ?? '')).toBe(cvPdf.no.href);
  });

  it('says the new-tab hint of LinkedIn and GitHub in the language of the page (owner-inputs C-39)', async () => {
    const hints = (html: string) =>
      [...html.matchAll(/<span\b[^>]*class="fj-link__hint"[^>]*>\s*([^<]*?)\s*<\/span>/g)].map(
        (m) => m[1],
      );
    expect(hints(await render('no'))).toEqual(['(åpnes i ny fane)', '(åpnes i ny fane)']);
    expect(hints(await render('en'))).toEqual(['(opens in a new tab)', '(opens in a new tab)']);
  });
});
