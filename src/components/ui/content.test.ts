import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { getViteConfig } from 'astro/config';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { createServer, type ViteDevServer } from 'vite';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

// Content components (AC-25, AC-21; screens.md SCR-04 rows Badge, Tag, Stat, SectionHeader).
// Each component is rendered on its own with the Astro container, through a Vite server that
// carries the Astro plugin (the .astro files are not plain modules).

const dir = fileURLToPath(new URL('./', import.meta.url));
let server: ViteDevServer;
let container: AstroContainer;

beforeAll(async () => {
  const config = await getViteConfig({})({ mode: 'test', command: 'serve' });
  server = await createServer({ ...config, server: { middlewareMode: true }, appType: 'custom' });
  container = await AstroContainer.create();
}, 120_000);
afterAll(() => server?.close());

async function render(
  name: string,
  props: Record<string, unknown> = {},
  slot?: string,
): Promise<string> {
  const mod = await server.ssrLoadModule(`/src/components/ui/${name}.astro`);
  return container.renderToString(mod.default, {
    props,
    ...(slot === undefined ? {} : { slots: { default: slot } }),
  });
}

const text = (html: string) =>
  html
    .replace(/<style[\s\S]*?<\/style>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

describe('Badge (availability and status variants of one component)', () => {
  it.each([
    ['open', 'Open to work'],
    ['talking', 'In talks'],
    ['employed', 'Employed'],
  ])('availability "%s" always prints a label text, not a dot alone', async (status, label) => {
    const html = await render('Badge', { kind: 'availability', status, label });
    expect(html).toContain(`data-status="${status}"`);
    expect(text(html)).toBe(label);
  });

  it.each([
    ['live', 'Live'],
    ['progress', 'In progress'],
    ['archived', 'Archived'],
  ])('status "%s" prints its label text', async (status, label) => {
    const html = await render('Badge', { kind: 'status', status }, label);
    expect(html).toContain(`data-status="${status}"`);
    expect(text(html)).toBe(label);
  });

  it('prints the availability detail next to the label', async () => {
    const html = await render('Badge', {
      kind: 'availability',
      status: 'open',
      label: 'Open to work',
      detail: 'Oslo area',
    });
    expect(text(html)).toContain('Open to work');
    expect(text(html)).toContain('Oslo area');
  });
});

describe('Tag', () => {
  it('renders a single tag with its text', async () => {
    const html = await render('Tag', {}, 'TypeScript');
    expect(text(html)).toBe('TypeScript');
  });

  it('renders a list of tags as list items that can wrap', async () => {
    const html = await render('Tag', { items: ['Astro', 'TypeScript', 'Playwright', 'CSS'] });
    expect(html).toMatch(/<ul\b/);
    expect(html.match(/<li\b/g)).toHaveLength(4);
    expect(text(html)).toBe('Astro TypeScript Playwright CSS');
  });
});

describe('Stat (AC-25: final number in the page, no count-up)', () => {
  it('prints the final value and label as text, with no script', async () => {
    const html = await render('Stat', { value: '28,000', suffix: '+', label: 'attendees' });
    expect(text(html)).toContain('28,000+');
    expect(text(html)).toContain('attendees');
    expect(html).not.toMatch(/<script\b/i);
  });

  it('prints the unit and context when given', async () => {
    const html = await render('Stat', {
      value: 4,
      unit: 'yrs',
      label: 'Experience',
      context: 'EPAM Systems',
    });
    expect(text(html)).toContain('4');
    expect(text(html)).toContain('yrs');
    expect(text(html)).toContain('EPAM Systems');
  });

  it('renders a row of stats, each with its final number', async () => {
    const html = await render('Stat', {
      items: [
        { value: '4', unit: 'yrs', label: 'Experience' },
        { value: '3', label: 'Live projects' },
      ],
    });
    expect(text(html)).toContain('4');
    expect(text(html)).toContain('Live projects');
    expect(html).not.toMatch(/<script\b/i);
  });

  it('the component file has no script and no count-up code', () => {
    const src = readFileSync(`${dir}Stat.astro`, 'utf8');
    expect(src).not.toMatch(/<script\b/i);
    expect(src).not.toMatch(/count-?up|requestAnimationFrame|IntersectionObserver/i);
  });
});

describe('Stat row layout (design .fj-stats)', () => {
  const src = () => readFileSync(`${dir}Stat.astro`, 'utf8');

  it('is the design grid: two columns, then --fj-n columns (4 by default) from 1024', () => {
    expect(src()).toMatch(/\.stats\s*\{[^}]*display:\s*grid/);
    expect(src()).toMatch(/grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
    expect(src()).toMatch(
      /min-width:\s*1024px[\s\S]*grid-template-columns:\s*repeat\(var\(--fj-n,\s*4\),\s*minmax\(0,\s*1fr\)\)/,
    );
    expect(src()).not.toMatch(/flex-basis|flex-wrap/);
  });

  it('takes the column count from the number of items through a data attribute, not a style attribute', async () => {
    const html = await render('Stat', {
      items: [
        { value: '1', label: 'One' },
        { value: '2', label: 'Two' },
        { value: '3', label: 'Three' },
      ],
    });
    expect(html).toMatch(/<ul\b[^>]*data-count="3"/);
    expect(html.replace(/<style[\s\S]*?<\/style>/g, '')).not.toMatch(/\sstyle=/);
    expect(src()).toMatch(/\[data-count='3'\]\s*\{\s*--fj-n:\s*3/);
  });
});

describe('SectionHeader', () => {
  it.each(['h1', 'h2', 'h3'])('renders the heading level it is given (%s)', async (as) => {
    const html = await render('SectionHeader', { as, title: 'Projects' });
    expect(html).toMatch(new RegExp(`<${as}\\b[^>]*>\\s*Projects\\s*</${as}>`));
    expect(html.match(/<h[1-6]\b/g)).toHaveLength(1);
  });

  it('renders without eyebrow and lead', async () => {
    const html = await render('SectionHeader', { as: 'h2', title: 'Projects' });
    expect(text(html)).toBe('Projects');
  });

  it('renders the eyebrow and lead when given', async () => {
    const html = await render('SectionHeader', {
      as: 'h2',
      title: 'Projects',
      index: '01',
      eyebrow: 'Projects',
      lead: 'Live work, each with a case study.',
    });
    expect(text(html)).toContain('01');
    expect(html).toMatch(/class="[^"]*eyebrow/);
    expect(text(html)).toContain('Live work, each with a case study.');
  });

  it.each(['sm', 'md', 'lg'])('renders size "%s"', async (size) => {
    const html = await render('SectionHeader', { as: 'h2', title: 'Projects', size });
    expect(html).toContain(`data-size="${size}"`);
  });
});
