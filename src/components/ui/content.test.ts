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

describe('Badge ring and Toast rise (design form)', () => {
  const src = (file: string) => readFileSync(`${dir}${file}`, 'utf8');

  it('draws the "open" ring as the design does: a faint bordered ::after around the dot', () => {
    const ring =
      src('Badge.astro').match(/\[data-status='open'\] \.badge__dot::after\s*\{([^}]*)\}/)?.[1] ??
      '';
    expect(ring).toMatch(/inset:\s*calc\(-1 \* var\(--fjord-space-1\)\)/);
    expect(ring).toMatch(/border:\s*var\(--fjord-border-width\) solid currentColor/);
    expect(ring).toMatch(/opacity:\s*var\(--fjord-opacity-faint\)/);
    expect(src('Badge.astro')).not.toMatch(/outline/);
  });

  it('the Toast text has the design line height (snug), from its token', () => {
    const toast = src('Toast.astro').match(/\.toast,[^{]*\{([^}]*)\}/)?.[1] ?? '';
    expect(toast).toMatch(/line-height:\s*var\(--fjord-leading-snug\)/);
  });

  it('the Toast rises with transform by a token distance, and only fades under reduced motion', () => {
    const toast = src('Toast.astro');
    const rise = toast.match(/@keyframes toast-in\s*\{([\s\S]*?\})\s*\}/)?.[1] ?? '';
    expect(rise).toMatch(/transform:\s*translateY\(var\(--fjord-space-2\)\)/);
    expect(rise).not.toMatch(/margin/);
    const fade = toast.match(/@keyframes toast-fade\s*\{([\s\S]*?\})\s*\}/)?.[1] ?? '';
    expect(fade).toMatch(/opacity:\s*0/);
    expect(fade).not.toMatch(/transform|translate|margin/);
    expect(toast).toMatch(
      /prefers-reduced-motion: no-preference\)\s*\{[^@]*animation:\s*toast-in var\(--fjord-duration-320\) var\(--fjord-ease-out\)/,
    );
    expect(toast).toMatch(
      /prefers-reduced-motion: reduce\)\s*\{[^@]*animation:\s*toast-fade var\(--fjord-duration-120\) var\(--fjord-ease-linear\)/,
    );
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

describe('Stat (AC-25: final number in the page; the count-up is the page script, AC-06)', () => {
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

  it('a row takes an optional accessible name from the page; without it there is none', async () => {
    const items = [
      { value: '1', label: 'One' },
      { value: '2', label: 'Two' },
    ];
    const named = await render('Stat', { items, rowLabel: 'Key numbers' });
    expect(named).toMatch(/<ul\b[^>]*aria-label="Key numbers"/);
    expect(await render('Stat', { items })).not.toMatch(/aria-label/);
  });

  it('the component file has no script and no animation code (the count-up script is separate)', () => {
    const src = readFileSync(`${dir}Stat.astro`, 'utf8');
    expect(src).not.toMatch(/<script\b/i);
    expect(src).not.toMatch(/requestAnimationFrame|IntersectionObserver/i);
  });

  it('without countUp the markup has no counting copy and nothing hidden from assistive technology', async () => {
    const html = await render('Stat', { value: 40, prefix: '~', label: 'Students' });
    expect(html).not.toMatch(/data-count-to|aria-hidden/);
  });
});

describe('Stat countUp (AC-06, T11)', () => {
  const squash = (s: string) => s.replace(/[\s\u00a0\u202f]/g, '');
  const items = [
    { value: 3, suffix: '+', unit: 'yrs', label: 'Software Engineer' },
    { value: 2000, prefix: '~', label: 'Participants' },
  ];

  it('keeps the final number as the text assistive technology reads', async () => {
    const html = await render('Stat', { items, countUp: true });
    const readable = html.replace(/<(\w+)\b[^>]*aria-hidden="true"[^>]*>[\s\S]*?<\/\1>/g, '');
    expect(squash(text(readable))).toContain('3+');
    expect(squash(text(readable))).toContain('~2000');
  });

  it('adds one counting copy per value, aria-hidden, carrying value, prefix and suffix', async () => {
    const html = await render('Stat', { items, countUp: true });
    const copies = html.match(/<[^>]*data-count-to="[^"]*"[^>]*>/g) ?? [];
    expect(copies).toHaveLength(2);
    copies.forEach((tag) => expect(tag).toContain('aria-hidden="true"'));
    expect(copies[0]).toContain('data-count-to="3"');
    expect(copies[0]).toContain('data-suffix="+"');
    expect(copies[1]).toContain('data-count-to="2000"');
    expect(copies[1]).toContain('data-prefix="~"');
  });

  it('prints the final number in the counting copy too, so nothing jumps and no script is needed', async () => {
    const html = await render('Stat', { items, countUp: true });
    const copy = html.match(/<([a-z]+)\b[^>]*data-count-to="2000"[^>]*>([\s\S]*?)<\/\1>/);
    expect(squash(text(copy?.[2] ?? ''))).toBe('~2000');
  });

  it('never hides the counting copy with an inline style or the hidden attribute', async () => {
    const html = await render('Stat', { items, countUp: true });
    expect(html).toMatch(/data-count-to/);
    expect(html).not.toMatch(/\shidden[\s>=]|style="[^"]*(display|visibility)/);
  });

  it('uses tabular numerals', () => {
    expect(readFileSync(`${dir}Stat.astro`, 'utf8')).toMatch(/tabular-nums/);
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

describe('measures (design ch widths, written with the measure tokens)', () => {
  const rule = (file: string, cls: string) =>
    readFileSync(`${dir}${file}`, 'utf8').match(new RegExp(`\\.${cls}\\s*\\{([^}]*)\\}`))?.[1] ??
    '';

  it('limits the Stat label to 24ch: half of the narrow measure', () => {
    expect(rule('Stat.astro', 'stat__label')).toMatch(
      /max-width:\s*calc\(var\(--fjord-measure-narrow\) \/ 2\)/,
    );
  });

  it('limits the SectionHeader lead to 60ch: five quarters of the narrow measure', () => {
    expect(rule('SectionHeader.astro', 'sechead__lead')).toMatch(
      /max-width:\s*calc\(var\(--fjord-measure-narrow\) \* 5 \/ 4\)/,
    );
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
