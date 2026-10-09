/* eslint-disable @typescript-eslint/no-non-null-assertion -- indexed regex matches are asserted by length first */
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { getViteConfig } from 'astro/config';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { createServer, type ViteDevServer } from 'vite';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

// Navigation components (AC-01, AC-07; screens.md SCR-05 head and language switch, C-7).
// Rendered on their own with the Astro container, as content.test.ts does.

const dir = fileURLToPath(new URL('./', import.meta.url));
let server: ViteDevServer;
let container: AstroContainer;

beforeAll(async () => {
  const config = await getViteConfig({})({ mode: 'test', command: 'serve' });
  server = await createServer({ ...config, server: { middlewareMode: true }, appType: 'custom' });
  container = await AstroContainer.create();
}, 120_000);
afterAll(() => server?.close());

async function render(name: string, props: Record<string, unknown> = {}): Promise<string> {
  const mod = await server.ssrLoadModule(`/src/components/ui/${name}.astro`);
  return container.renderToString(mod.default, { props });
}

const body = (html: string) => html.replace(/<style[\s\S]*?<\/style>/g, '');
const anchors = (html: string) => [...body(html).matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)];
const plain = (s: string) =>
  s
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
const source = (name: string) =>
  existsSync(`${dir}${name}.astro`) ? readFileSync(`${dir}${name}.astro`, 'utf8') : '';

describe('LangSwitch (AC-07)', () => {
  const props = (current: 'en' | 'no', size?: string) => ({
    current,
    group: 'CV language',
    ...(size ? { size } : {}),
    enHref: '/cv/en',
    noHref: '/cv/no',
  });

  it.each(['large', 'default'])(
    'renders exactly two links in a named group, size %s',
    async (size) => {
      const html = await render('LangSwitch', props('en', size));
      expect(anchors(html)).toHaveLength(2);
      expect(body(html)).toMatch(
        /role="group"[^>]*aria-label="CV language"|aria-label="CV language"[^>]*role="group"/,
      );
      expect(plain(anchors(html)[0]![2]!)).toBe('EN');
      expect(plain(anchors(html)[1]![2]!)).toBe('NO');
    },
  );

  it.each([
    ['en', 0],
    ['no', 1],
  ] as const)('marks only the current language (%s) with aria-current="true"', async (cur, idx) => {
    const a = anchors(await render('LangSwitch', props(cur)));
    expect(a[idx]![1]).toContain('aria-current="true"');
    expect(a[1 - idx]![1]).not.toContain('aria-current');
  });

  it('marks "NO" as Norwegian and "EN" not', async () => {
    const a = anchors(await render('LangSwitch', props('en')));
    expect(a[1]![1]).toContain('lang="no"');
    expect(a[0]![1]).not.toContain('lang=');
  });

  it('links to the given addresses', async () => {
    const a = anchors(await render('LangSwitch', props('en')));
    expect(a[0]![1]).toContain('href="/cv/en"');
    expect(a[1]![1]).toContain('href="/cv/no"');
  });

  it('keeps state in attributes and draws a 44 x 44 target from the tap token (C-7)', () => {
    const src = source('LangSwitch');
    expect(src).toMatch(/--fjord-tap-min/);
    expect(src).not.toMatch(/\b44px\b/);
  });
});

describe('Breadcrumbs (AC-01)', () => {
  const two = [{ label: 'alpon.dev', href: '/' }, { label: 'CV' }];
  const three = [
    { label: 'alpon.dev', href: '/' },
    { label: 'Projects', href: '/projects' },
    { label: 'CV' },
  ];

  it.each([
    ['two', two],
    ['three', three],
  ])('renders a named nav with %s items, links before the current one', async (_n, items) => {
    const html = body(await render('Breadcrumbs', { items, label: 'Breadcrumb' }));
    expect(html).toMatch(/<nav\b[^>]*aria-label="Breadcrumb"/);
    expect(anchors(html)).toHaveLength(items.length - 1);
    expect(html.match(/<li\b/g)).toHaveLength(items.length);
  });

  it('marks the last item aria-current="page" and it is not a link', async () => {
    const html = body(await render('Breadcrumbs', { items: three, label: 'Breadcrumb' }));
    expect(html.match(/aria-current="page"/g)).toHaveLength(1);
    expect(html).toMatch(/<[^>]*aria-current="page"[^>]*>\s*CV\s*</);
    expect(html).not.toMatch(/<a\b[^>]*aria-current/);
  });

  it('keeps a 44 x 44 target on the link from the tap token', () => {
    const src = source('Breadcrumbs');
    expect(src).toMatch(/--fjord-tap-min/);
    expect(src).not.toMatch(/\b44px\b/);
  });
});
