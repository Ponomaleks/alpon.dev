import { getViteConfig } from 'astro/config';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { createServer, type ViteDevServer } from 'vite';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

// AC-01, AC-03 (T10; screens.md SCR-05 `work experience`, `personal projects`; home D-09).
// CvJob is an always-open timeline entry: role h3, organisation, period, then client projects
// (h4 + Tags), internal projects (h4) or paragraphs. CvProjects lists personal projects with an
// external code link.

let server: ViteDevServer;
let container: AstroContainer;

beforeAll(async () => {
  const config = await getViteConfig({})({ mode: 'test', command: 'serve' });
  server = await createServer({ ...config, server: { middlewareMode: true }, appType: 'custom' });
  container = await AstroContainer.create();
}, 120_000);
afterAll(() => server?.close());

const markup = (html: string) => html.replace(/<style[\s\S]*?<\/style>/g, '');
const text = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

async function render(file: string, props: Record<string, unknown>): Promise<string> {
  const mod = await server.ssrLoadModule(`/src/components/cv/${file}.astro`);
  return markup(await container.renderToString(mod.default, { props }));
}

const rich = {
  role: 'Software Engineer',
  employer: 'EPAM Systems',
  employerNote: 'client: a global B2B software leader',
  period: 'Nov 2022 – Jan 2026',
  clientProjects: [
    {
      name: 'Event platform',
      description: 'Built the registration flow.',
      stack: ['React', 'TypeScript'],
    },
    { name: 'Content hub', description: 'Moved pages to a headless CMS.', stack: ['Node.js'] },
  ],
  internalLabel: 'Internal projects',
  appliedLabel: 'Applied technologies',
  internalProjects: [
    { name: 'Hiring tool', description: 'A small tool for the recruiters.' },
    { name: 'Test helper', description: 'Shared test utilities.' },
  ],
};

const plain = {
  role: 'Developer',
  employer: 'Acme AS',
  period: '2019 – 2021',
  paragraphs: ['First paragraph of work.', 'Second paragraph of work.'],
};

describe('CvJob', () => {
  it('renders role as h3 with organisation and period', async () => {
    const html = await render('CvJob', { job: rich });
    expect(html).toMatch(/<h3\b[^>]*>[\s\S]*Software Engineer[\s\S]*<\/h3>/);
    const t = text(html);
    expect(t).toContain('EPAM Systems');
    expect(t).toContain('client: a global B2B software leader');
    expect(html).toContain('Nov 2022 – Jan 2026');
  });

  it('renders client projects as h4 with their technologies as Tags, then internal projects', async () => {
    const html = await render('CvJob', { job: rich });
    const h4 = [...html.matchAll(/<h4\b[^>]*>([\s\S]*?)<\/h4>/g)].map((m) =>
      text(m[1] ?? '').trim(),
    );
    expect(h4).toEqual(['Event platform', 'Content hub', 'Hiring tool', 'Test helper']);
    const t = text(html);
    expect(t).toContain('Applied technologies');
    expect(t).toContain('Internal projects');
    for (const tech of ['React', 'TypeScript', 'Node.js']) expect(t).toContain(tech);
    expect(html).toMatch(/class="[^"]*fj-tag/);
    expect(html.indexOf('h3')).toBeLessThan(html.indexOf('<h4'));
  });

  it('renders a job with paragraphs only: h3, paragraphs, no h4', async () => {
    const html = await render('CvJob', { job: plain });
    expect(html).toMatch(/<h3\b/);
    expect(html).not.toMatch(/<h4\b/);
    expect(text(html)).toContain('First paragraph of work.');
    expect(text(html)).toContain('Second paragraph of work.');
    expect((html.match(/<p\b/g) ?? []).length).toBeGreaterThanOrEqual(2);
  });

  it('gives only the first job the filled marker', async () => {
    const first = await render('CvJob', { job: plain, first: true });
    const later = await render('CvJob', { job: plain });
    expect(first).toMatch(/cv-job__marker--filled|data-filled/);
    expect(later).not.toMatch(/cv-job__marker--filled|data-filled/);
  });

  it('has no style attribute anywhere', async () => {
    for (const html of [
      await render('CvJob', { job: rich, first: true }),
      await render('CvJob', { job: plain }),
      await render('CvProjects', {
        projects: [{ title: 'P', stack: 'Go', text: 'T', href: 'https://example.com/p' }],
      }),
    ]) {
      expect(html).not.toMatch(/\sstyle=/);
    }
  });
});

describe('CvProjects', () => {
  const projects = [
    {
      title: 'Bookshelf API',
      stack: 'Node.js · PostgreSQL',
      text: 'A small REST API.',
      href: 'https://github.com/example/bookshelf',
    },
    {
      title: 'Queue worker',
      stack: 'Go',
      text: 'A background worker.',
      href: 'https://github.com/example/queue',
    },
  ];

  it('renders the note, each project title as h3 with stack and text', async () => {
    const html = await render('CvProjects', {
      note: 'Backend practice alongside frontend work',
      projects,
    });
    const t = text(html);
    expect(t).toContain('Backend practice alongside frontend work');
    const h3 = [...html.matchAll(/<h3\b[^>]*>([\s\S]*?)<\/h3>/g)].map((m) => text(m[1] ?? ''));
    expect(h3).toHaveLength(2);
    expect(h3[0]).toContain('Bookshelf API');
    for (const p of projects) {
      expect(t).toContain(p.stack);
      expect(t).toContain(p.text);
    }
  });

  it('opens each code link in a new tab with rel and the hidden hint (home D-09)', async () => {
    const html = await render('CvProjects', { projects });
    const links = [...html.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/g)].map((m) => m[0]);
    expect(links).toHaveLength(2);
    for (const [i, a] of links.entries()) {
      expect(a).toContain(`href="${projects[i]?.href}"`);
      expect(a).toContain('target="_blank"');
      expect(a).toContain('rel="noopener noreferrer"');
      expect(a).toContain('(opens in a new tab)');
    }
  });
});
