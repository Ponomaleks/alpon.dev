import { getViteConfig } from 'astro/config';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { createServer, type ViteDevServer } from 'vite';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { keyFacts } from '../../data/home';

// AC-05, AC-06 (T11; screens.md SCR-01 key facts). Four items from home.ts, each with value,
// label and context; the values count up, so the panel is the count-up root (`data-count-up`).

let server: ViteDevServer;
let container: AstroContainer;

beforeAll(async () => {
  const config = await getViteConfig({})({ mode: 'test', command: 'serve' });
  server = await createServer({ ...config, server: { middlewareMode: true }, appType: 'custom' });
  container = await AstroContainer.create();
}, 120_000);
afterAll(() => server?.close());

const squash = (s: string) => s.replace(/<[^>]+>/g, '').replace(/[\s\u00a0\u202f]/g, '');

async function renderPanel(): Promise<string> {
  const mod = await server.ssrLoadModule('/src/components/home/KeyFacts.astro');
  return container.renderToString(mod.default);
}

describe('KeyFacts', () => {
  it('prints four items with their value, label and context from home.ts', async () => {
    const html = await renderPanel();
    expect(keyFacts).toHaveLength(4);
    expect(html.match(/<li\b/g)).toHaveLength(4);
    for (const f of keyFacts) {
      expect(html).toContain(f.label);
      expect(html).toContain(f.context);
      expect(squash(html)).toContain(`${f.prefix ?? ''}${f.value}${f.suffix ?? ''}`);
    }
  });

  it('is the count-up root, with four counting copies hidden from assistive technology', async () => {
    const html = await renderPanel();
    expect(html.match(/data-count-up\b/g)).toHaveLength(1);
    const copies = html.match(/<[^>]*data-count-to="[^"]*"[^>]*>/g) ?? [];
    expect(copies).toHaveLength(4);
    copies.forEach((tag) => expect(tag).toContain('aria-hidden="true"'));
    expect(copies.map((t) => t.match(/data-count-to="([^"]*)"/)?.[1])).toEqual(
      keyFacts.map((f) => String(f.value)),
    );
  });
});
