import { readFileSync } from 'node:fs';
import { getViteConfig } from 'astro/config';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { createServer, type ViteDevServer } from 'vite';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { homeProjects, projectSchema, selectProjects, type Project } from '../../data/projects';
import { sampleProjects } from '../../data/samples';

// AC-11, AC-12 (T28; sad §8 Dormant Selected projects; screens.md SCR-04 Selected projects).
// ProjectCard and SelectedProjects take projects as a prop; the home page shows the section only
// when the switch of step 7 is on and a Published project exists.

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
    .replace(/<svg[\s\S]*?<\/svg>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();

const project = (slug: string, over: Partial<Project> = {}): Project => ({
  slug,
  title: `Title of ${slug}`,
  summary: `Summary of ${slug}.`,
  status: 'live',
  year: 2026,
  result: { value: `${slug.length} ms`, label: `result label of ${slug}` },
  tags: ['TypeScript', 'Astro'],
  live: `https://${slug}.example.com/`,
  code: `https://example.com/code/${slug}`,
  featured: true,
  published: true,
  ...over,
});

async function render(file: string, props: Record<string, unknown>): Promise<string> {
  const mod = await server.ssrLoadModule(`/src/components/home/${file}.astro`);
  return container.renderToString(mod.default, { props });
}
const card = (p: Project, variant?: string) =>
  render('ProjectCard', { project: p, ...(variant && { variant }) });
const cards = (html: string) =>
  [...html.matchAll(/<article\b[^>]*>[\s\S]*?<\/article>/g)].map((m) => m[0]);
const links = (html: string) =>
  [...html.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/g)].map((m) => ({
    href: m[0].match(/href="([^"]*)"/)?.[1] ?? '',
    text: text(m[0]),
    tag: m[0],
  }));

describe('project entry shape (AC-12)', () => {
  const entry = {
    title: 'A project',
    summary: 'What it is.',
    status: 'live',
    year: 2026,
    result: { value: '42 ms', label: 'p95 response' },
    tags: ['TypeScript'],
  };

  it('accepts an entry with the fields AC-12 names, the links being optional', () => {
    const parsed = projectSchema.parse(entry);
    expect(parsed.live).toBeUndefined();
    expect(parsed.code).toBeUndefined();
    expect(parsed.featured).toBe(false);
    expect(parsed.published).toBe(false);
    const full = projectSchema.parse({
      ...entry,
      live: 'https://one.alpon.dev/',
      code: 'https://github.com/ponomaleks/one',
      featured: true,
      published: true,
    });
    expect(full.live).toBe('https://one.alpon.dev/');
    expect(full.code).toBe('https://github.com/ponomaleks/one');
  });

  it.each(['title', 'summary', 'status', 'year', 'result', 'tags'])(
    'rejects an entry without %s',
    (field) => {
      const rest = Object.fromEntries(Object.entries(entry).filter(([key]) => key !== field));
      expect(projectSchema.safeParse(rest).success).toBe(false);
    },
  );

  it('rejects a result without its label, an unknown status and a link that is no address', () => {
    expect(projectSchema.safeParse({ ...entry, result: { value: '1' } }).success).toBe(false);
    expect(projectSchema.safeParse({ ...entry, status: 'done' }).success).toBe(false);
    expect(projectSchema.safeParse({ ...entry, live: 'one.alpon.dev' }).success).toBe(false);
    expect(projectSchema.safeParse({ ...entry, tags: [] }).success).toBe(false);
  });

  it('is the schema of the projects collection, loaded from src/content/projects/*.md', () => {
    const config = readFileSync(new URL('../../content.config.ts', import.meta.url), 'utf8');
    expect(config).toMatch(/schema:\s*projectSchema/);
    expect(config).toMatch(/glob\(\{[^}]*pattern:\s*'\*\.md'[^}]*\}\)/);
    expect(config).toContain("base: './src/content/projects'");
    expect(config).toMatch(/export const collections = \{\s*projects\s*\}/);
  });
});

describe('selectProjects and homeProjects (AC-11, AC-12)', () => {
  it('keeps featured projects only, in order, three at most', () => {
    const list = [
      project('a'),
      project('b', { featured: false }),
      project('c'),
      project('d'),
      project('e'),
    ];
    expect(selectProjects(list).map((p) => p.slug)).toEqual(['a', 'c', 'd']);
    expect(selectProjects([])).toEqual([]);
  });

  it('gives the home page nothing while the switch is off, with or without a Published project', () => {
    expect(homeProjects(false, [project('a'), project('b')])).toEqual([]);
    expect(homeProjects(false, [])).toEqual([]);
  });

  it('gives the home page the Published featured projects once the switch is on', () => {
    const list = [project('a', { published: false }), project('b'), project('c')];
    expect(homeProjects(true, list).map((p) => p.slug)).toEqual(['b', 'c']);
    expect(homeProjects(true, [project('a', { published: false })])).toEqual([]);
  });
});

describe('ProjectCard (AC-12)', () => {
  it('shows status, year, title, summary, one result with its label and the tags', async () => {
    const p = project('one', { status: 'progress', year: 2025, tags: ['Python', 'FastAPI'] });
    const html = await card(p);
    expect(html).toMatch(/<article\b/);
    expect(html).toMatch(/data-kind="status"[^>]*data-status="progress"/);
    const t = text(html);
    expect(t).toContain('In progress');
    expect(t).toContain('2025');
    expect(html).toMatch(/<h3\b[^>]*>[\s\S]*Title of one[\s\S]*<\/h3>/);
    expect(t).toContain('Summary of one.');
    expect(html.match(/<strong\b/g)).toHaveLength(1);
    expect(html).toMatch(/<strong\b[^>]*>\s*3 ms\s*<\/strong>/);
    expect(t).toContain('result label of one');
    const tags = [...html.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/g)].map((m) => text(m[1] ?? ''));
    expect(tags).toEqual(['Python', 'FastAPI']);
  });

  it('prints the label of each status', async () => {
    expect(text(await card(project('a', { status: 'live' })))).toContain('Live');
    expect(text(await card(project('a', { status: 'archived' })))).toContain('Archived');
  });

  it('links "Live" and "Code" to the addresses of the project, each in a new tab (D-09)', async () => {
    const found = links(await card(project('one')));
    expect(found.map((l) => l.text)).toEqual([
      'Live (opens in a new tab)',
      'Code (opens in a new tab)',
    ]);
    expect(found[0]?.href).toBe('https://one.example.com/');
    expect(found[1]?.href).toBe('https://example.com/code/one');
    for (const l of found) {
      expect(l.tag).toMatch(/\starget="_blank"/);
      expect(l.tag).toContain('rel="noopener noreferrer"');
    }
  });

  it('shows only the links that exist', async () => {
    const noLive = links(await card(project('one', { live: undefined })));
    expect(noLive.map((l) => l.text)).toEqual(['Code (opens in a new tab)']);
    const noCode = links(await card(project('one', { code: undefined })));
    expect(noCode.map((l) => l.text)).toEqual(['Live (opens in a new tab)']);
    // Archived, so that "Live" cannot come from the status label.
    const none = await card(
      project('one', { status: 'archived', live: undefined, code: undefined }),
    );
    expect(links(none)).toEqual([]);
    expect(none).not.toContain('pcard__links');
    expect(text(none)).not.toMatch(/\b(Live|Code)\b/);
  });

  it('is compact by default and large as the featured variant', async () => {
    expect(await card(project('one'))).toMatch(/<article\b[^>]*data-variant="compact"/);
    expect(await card(project('one'), 'featured')).toMatch(
      /<article\b[^>]*data-variant="featured"/,
    );
  });

  it('keeps the media decorative: no image, hidden from assistive technology', async () => {
    const html = await card(project('one'));
    expect(html).not.toMatch(/<img\b/);
    expect(html).toMatch(/class="[^"]*pcard__media[^"]*"[^>]*aria-hidden="true"/);
  });
});

describe('SelectedProjects (AC-12)', () => {
  const section = (items: Project[], props: Record<string, unknown> = {}) =>
    render('SelectedProjects', { items, index: '02', ...props });

  it('heads the section "Selected projects" with its number, lead and "All projects"', async () => {
    const html = await section([project('a')], { index: '07' });
    expect(html).toMatch(/<section\b[^>]*aria-labelledby="projects-title"/);
    expect(html).toMatch(/<h2\b[^>]*id="projects-title"[^>]*>\s*Selected projects\s*<\/h2>/);
    expect(text(html)).toContain('07 / Projects');
    expect(text(html)).toContain('Small products I built and run.');
    const all = links(html).filter((l) => l.text === 'All projects');
    expect(all).toHaveLength(1);
    expect(all[0]?.href).toBe('/projects');
  });

  it('shows up to three featured projects, the first one large', async () => {
    const list = ['a', 'b', 'c', 'd', 'e'].map((s) => project(s));
    const found = cards(await section(list));
    expect(found).toHaveLength(3);
    expect(found.map((c) => c.match(/data-variant="([a-z]+)"/)?.[1])).toEqual([
      'featured',
      'compact',
      'compact',
    ]);
    expect(text(found[0] ?? '')).toContain('Title of a');
    expect(text(found[2] ?? '')).toContain('Title of c');
  });

  it('leaves out a project that is not featured', async () => {
    const found = cards(await section([project('a', { featured: false }), project('b')]));
    expect(found).toHaveLength(1);
    expect(found[0]).toMatch(/data-variant="featured"/);
    expect(text(found[0] ?? '')).toContain('Title of b');
  });
});

describe('sample projects for the Styleguide (AC-12)', () => {
  it('holds three featured samples that pass the schema, one without a live link', () => {
    expect(sampleProjects).toHaveLength(3);
    expect(selectProjects(sampleProjects)).toEqual(sampleProjects);
    for (const { slug, ...data } of sampleProjects) {
      expect(slug).toMatch(/^[a-z0-9-]+$/);
      expect(projectSchema.safeParse(data).success).toBe(true);
    }
    expect(sampleProjects.filter((p) => !p.live)).toHaveLength(1);
  });

  it('marks every result value as a sample, in square brackets, and is not Published', () => {
    for (const p of sampleProjects) {
      expect(p.result.value).toMatch(/^\[.+\]$/);
      expect(p.published).toBe(false);
    }
  });
});
