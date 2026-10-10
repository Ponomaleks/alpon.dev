import { getViteConfig } from 'astro/config';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { createServer, type ViteDevServer } from 'vite';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { cvSectionIds } from '../../data/cv/sections';

// AC-01, AC-03 (T9; screens.md SCR-05 / SCR-06 sections, skills, languages, education, courses).
// CvSection, SkillGroup, LanguageList and DatedRows: text only, no logos, bars, percentages
// or level codes.

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
    .replace(/\s+/g, ' ')
    .trim();

async function render(
  file: string,
  props: Record<string, unknown>,
  slots?: Record<string, string>,
): Promise<string> {
  const mod = await server.ssrLoadModule(`/src/components/cv/${file}.astro`);
  return container.renderToString(mod.default, { props, slots });
}

describe('CvSection', () => {
  it('puts the shared id on the section and names it from its h2', async () => {
    const html = await render(
      'CvSection',
      { id: cvSectionIds[1], index: '02', heading: 'Skills' },
      { default: '<p>Body text</p>' },
    );
    expect(html).toMatch(/<section\b[^>]*\bid="skills"/);
    expect(html).toMatch(/<h2\b[^>]*>\s*Skills\s*<\/h2>/);
    // The page design draws the CV section headings in the small size (`size="sm"` in Cv.jsx).
    expect(html).toMatch(/<header\b[^>]*\bdata-size="sm"/);
    expect(html).toContain('02');
    expect(html).toContain('Body text');
    const labelled = html.match(/aria-labelledby="([^"]+)"/)?.[1];
    expect(labelled).toBeTruthy();
    expect(html).toContain(`id="${labelled}"`);
  });

  it('takes the number from a prop', async () => {
    const html = await render('CvSection', { id: 'community', index: '08', heading: 'Community' });
    expect(text(html)).toContain('08');
    expect(html).toMatch(/\bid="community"/);
  });
});

describe('SkillGroup', () => {
  const group = { label: 'Frontend', items: ['TypeScript', 'React', 'Astro'] };

  it('prints the label as an h3 and the skills as one line of text', async () => {
    const html = await render('SkillGroup', { group });
    expect(html).toMatch(/<h3\b[^>]*>\s*Frontend\s*<\/h3>/);
    expect(text(html)).toContain('TypeScript');
    expect(text(html)).toContain('React');
    expect(text(html)).toContain('Astro');
  });

  it('has no image, bar or percentage', async () => {
    const html = await render('SkillGroup', { group });
    expect(html).not.toMatch(/<(img|svg|picture|progress|meter)\b/);
    expect(html).not.toContain('%');
    expect(html).not.toMatch(/role="(progressbar|meter)"/);
  });
});

describe('LanguageList', () => {
  const languages = [
    { language: 'English', level: 'Upper-intermediate' },
    { language: 'Norwegian', level: 'Intermediate' },
    { language: 'Ukrainian', level: 'Native' },
  ];

  it('prints a language and its plain level per row', async () => {
    const html = await render('LanguageList', { languages });
    expect(html.match(/<li\b/g)).toHaveLength(3);
    const t = text(html);
    for (const l of languages) {
      expect(t).toContain(l.language);
      expect(t).toContain(l.level);
    }
  });

  it('has no CEFR level code', async () => {
    const html = await render('LanguageList', { languages });
    expect(text(html)).not.toMatch(/\b[ABC][12]\b/);
  });
});

describe('DatedRows', () => {
  const rows = [
    {
      period: '2019\nOslo',
      title: 'Bachelor in Computer Science',
      organisation: 'Some University',
      note: 'Thesis on testing',
    },
    {
      period: '2021',
      title: 'Norskkurs nivå 2',
      organisation: 'Folkeuniversitetet',
      lang: 'no',
    },
  ];

  it('prints period, title, organisation and the optional note per row', async () => {
    const html = await render('DatedRows', { rows });
    expect(html.match(/<li\b/g)).toHaveLength(2);
    const t = text(html);
    for (const s of ['2019', 'Oslo', 'Bachelor in Computer Science', 'Some University']) {
      expect(t).toContain(s);
    }
    expect(t).toContain('Thesis on testing');
    expect(t).toContain('Folkeuniversitetet');
  });

  it('shows the period on two lines when it has a second line', async () => {
    const html = await render('DatedRows', { rows });
    expect(html).toMatch(
      /2019\s*<br\s*\/?>\s*Oslo|<span\b[^>]*>\s*2019\s*<\/span>\s*<span\b[^>]*>\s*Oslo/,
    );
  });

  it('marks a Norwegian name as Norwegian', async () => {
    const html = await render('DatedRows', { rows });
    expect(html).toMatch(/lang="no"[^>]*>\s*Norskkurs nivå 2/);
    expect(html).not.toMatch(/lang="no"[^>]*>\s*Bachelor in Computer Science/);
  });
});
