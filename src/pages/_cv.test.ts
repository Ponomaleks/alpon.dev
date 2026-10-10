import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildSite, repo, type SiteBuild } from '../../scripts/test-utils/build-site.ts';
import { contact } from '../data/contact';
import { cvPdf } from '../data/cv/index';
import { cvEn } from '../data/cv/en';
import { cvNo } from '../data/cv/no';
import { cvSectionIds } from '../data/cv/sections';

// The three built CV files (T17: AC-01, AC-02, AC-04, AC-17, AC-20; sad §4 item 2, §5).
// /cv, /cv/en and /cv/no render one CvPage; the short address names the English page canonical.

let site: SiteBuild;
beforeAll(() => {
  site = buildSite();
  if (site.status !== 0) throw new Error(site.log);
}, 180_000);
afterAll(() => site?.cleanup());

const files = [
  { file: 'cv.html', cv: cvEn, lang: 'en', canonical: '/cv/en' },
  { file: 'cv/en.html', cv: cvEn, lang: 'en', canonical: '/cv/en' },
  { file: 'cv/no.html', cv: cvNo, lang: 'no', canonical: '/cv/no' },
] as const;

const origin = 'https://alpon.dev';
const read = (file: string) => readFileSync(join(site.out, file), 'utf8');
const decode = (s: string) =>
  s
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;|&#38;/g, '&');
const text = (s: string) =>
  decode(
    s
      .replace(/<svg[\s\S]*?<\/svg>/g, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim(),
  );
const main = (html: string) => html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1] ?? '';
const attr = (tag: string, name: string) =>
  new RegExp(String.raw`\s${name}="([^"]*)"`).exec(tag)?.[1];
const metaContent = (html: string, key: string, value: string) => {
  const tag = [...html.matchAll(/<meta\b[^>]*>/g)]
    .map((m) => m[0])
    .find((t) => attr(t, key) === value);
  return tag === undefined ? undefined : decode(attr(tag, 'content') ?? '');
};

describe.each(files)('built $file', ({ file, cv, lang, canonical }) => {
  const html = () => read(file);

  it('has one h1, the name', () => {
    const h1s = [...main(html()).matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)];
    expect(h1s).toHaveLength(1);
    expect(text(h1s[0]?.[1] ?? '')).toBe('Alexander Ponomarenko');
  });

  it('has the h2 sections of the CV data in order, with the shared ids and no gap in the numbers', () => {
    const m = main(html());
    const sections = [
      ...m.matchAll(/<section\b([^>]*\bclass="cv-section"[^>]*)>([\s\S]*?)<\/section>/g),
    ];
    const ids = sections.map((s) => attr(s[1] ?? '', 'id'));
    expect(ids).toEqual(cv.sections.map((s) => s.id));
    const order = ids.map((id) => cvSectionIds.indexOf(id as (typeof cvSectionIds)[number]));
    expect([...order].sort((a, b) => a - b)).toEqual(order);
    expect(order.every((i) => i >= 0)).toBe(true);
    const h2s = sections.map((s) => /<h2\b[^>]*>([\s\S]*?)<\/h2>/.exec(s[2] ?? '')?.[1] ?? '');
    expect(h2s.map(text)).toEqual(cv.sections.map((s) => s.heading));
    const nums = sections.map((s) => /<b\b[^>]*>(\d{2})<\/b>/.exec(s[2] ?? '')?.[1]);
    expect(nums).toEqual(cv.sections.map((_, i) => String(i + 1).padStart(2, '0')));
  });

  it('sets <html lang>, title and description per CV language', () => {
    const h = html();
    expect(h).toMatch(new RegExp(String.raw`<html\b[^>]*\slang="${lang}"`));
    expect(decode(/<title>([\s\S]*?)<\/title>/.exec(h)?.[1] ?? '')).toBe(cv.title);
    expect(metaContent(h, 'name', 'description')).toBe(cv.description);
    expect(h).not.toMatch(/name="robots"/);
  });

  it('has og: data with the site preview image and its own canonical', () => {
    const h = html();
    expect(metaContent(h, 'property', 'og:title')).toBe(cv.title);
    expect(metaContent(h, 'property', 'og:description')).toBe(cv.description);
    expect(metaContent(h, 'property', 'og:image')).toBe(`${origin}/og.png`);
    expect(metaContent(h, 'property', 'og:url')).toBe(origin + canonical);
    const link = [...h.matchAll(/<link\b[^>]*>/g)]
      .map((m) => m[0])
      .find((t) => attr(t, 'rel') === 'canonical');
    expect(attr(link ?? '', 'href')).toBe(origin + canonical);
  });

  it('names the English and Norwegian pages and the English one as x-default', () => {
    const alts = [...html().matchAll(/<link\b[^>]*>/g)]
      .map((m) => m[0])
      .filter((t) => attr(t, 'rel') === 'alternate')
      .map((t) => [attr(t, 'hreflang'), attr(t, 'href')]);
    expect(alts).toHaveLength(3);
    expect(alts).toEqual(
      expect.arrayContaining([
        ['en', `${origin}/cv/en`],
        ['no', `${origin}/cv/no`],
        ['x-default', `${origin}/cv/en`],
      ]),
    );
  });

  it('marks the header "CV" as current and leads it to the page being read', () => {
    const header = /<header\b[^>]*>[\s\S]*?<\/header>/.exec(html())?.[0] ?? '';
    const cvLink = [...header.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)].find(
      (m) => text(m[2] ?? '') === 'CV',
    );
    expect(cvLink).toBeDefined();
    expect(attr(cvLink?.[1] ?? '', 'aria-current')).toBe('page');
    expect(attr(cvLink?.[1] ?? '', 'href')).toBe(contact.links.cvPages[lang]);
  });

  it('gives the bar the language switch and the download of the CV language', () => {
    const bar = /<details\b[^>]*data-shell-bar[^>]*>([\s\S]*?)<\/details>/.exec(html())?.[1] ?? '';
    expect(bar).toMatch(/data-lang-switch/);
    // Review R1-3: the bar is English on the Norwegian page; the group name there is Norwegian.
    const group = /<div\b([^>]*\bdata-lang-switch[^>]*)>/.exec(bar)?.[1] ?? '';
    expect(attr(group, 'aria-label')).toBe(lang === 'no' ? 'CV-språk' : 'CV language');
    expect(attr(group, 'lang')).toBe(lang === 'no' ? 'no' : undefined);
    const current = [...bar.matchAll(/<a\b([^>]*\bdata-switch-to="[^"]*"[^>]*)>/g)].filter(
      (m) => attr(m[1] ?? '', 'aria-current') === 'true',
    );
    expect(current.map((m) => attr(m[1] ?? '', 'data-switch-to'))).toEqual([lang]);
    const dl = [...bar.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)].find(
      (m) => attr(m[1] ?? '', 'href') === cvPdf[lang].href,
    );
    expect(dl).toBeDefined();
    expect(text(dl?.[2] ?? '')).toBe(lang === 'no' ? 'Last ned PDF' : 'Download PDF');
    expect(attr(dl?.[1] ?? '', 'download')).toBe(cvPdf[lang].downloadName);
    if (lang === 'no') expect(attr(dl?.[1] ?? '', 'lang')).toBe('no');
    else expect(attr(dl?.[1] ?? '', 'lang')).toBeUndefined();
  });

  it('has the side column in the HTML, with a link to every section', () => {
    const aside = /<aside\b[^>]*class="cv-aside"[^>]*>([\s\S]*?)<\/aside>/.exec(main(html()))?.[1];
    expect(aside).toBeDefined();
    const hrefs = [...(aside ?? '').matchAll(/<a\b[^>]*\shref="#([^"]+)"/g)].map((m) => m[1]);
    expect(hrefs).toEqual(cv.sections.map((s) => s.id));
    expect(aside).toContain(contact.email);
  });

  it('has no inline style and no inline event handler', () => {
    expect(html()).not.toMatch(/<style\b|\sstyle=|\son[a-z]+=/i);
  });
});

describe('the Norwegian page, shell and labels', () => {
  it('keeps the Shell English and the CV labels Norwegian', () => {
    const h = read('cv/no.html');
    expect(text(main(h))).toContain('På denne siden');
    expect(text(main(h))).toContain('Last ned PDF');
    expect(text(main(h))).toContain('Se original-PDF');
  });
});

describe('public/sitemap.xml', () => {
  const sitemap = () => readFileSync(join(repo, 'public/sitemap.xml'), 'utf8');
  const locs = () => [...sitemap().matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

  it('lists /cv/en and /cv/no and not /cv', () => {
    expect(locs()).toEqual(expect.arrayContaining([`${origin}/cv/en`, `${origin}/cv/no`]));
    expect(locs()).not.toContain(`${origin}/cv`);
  });
});
