import { getViteConfig } from 'astro/config';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { createServer, type ViteDevServer } from 'vite';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { contact } from '../../data/contact';

// AC-11, AC-27 (T30; screens SCR-04 section Print contact line; spec D-04). PrintContactLine is
// one line with the email, phone, LinkedIn and GitHub from contact.ts. It is the printed form of
// the contact facts: the page's print styles show it, the screen styles do not.

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
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();

async function render(): Promise<string> {
  const mod = await server.ssrLoadModule('/src/components/cv/PrintContactLine.astro');
  return container.renderToString(mod.default, {});
}

const bare = (url: string) => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');

describe('PrintContactLine', () => {
  it('is one element with the class cv-print-line', async () => {
    const html = await render();
    expect(html.match(/class="[^"]*\bcv-print-line\b/g)).toHaveLength(1);
  });

  it('holds the four facts from contact.ts as text', async () => {
    const t = text(await render());
    expect(t).toContain(contact.email);
    expect(t).toContain(contact.phone);
    expect(t).toContain(bare(contact.linkedin));
    expect(t).toContain(bare(contact.github));
  });

  it('links the four facts to the addresses from contact.ts', async () => {
    const hrefs = [...(await render()).matchAll(/<a\b[^>]*\bhref="([^"]*)"/g)].map((m) => m[1]);
    expect(hrefs).toContain(`mailto:${contact.email}`);
    expect(hrefs).toContain(`tel:${contact.phone.replace(/[^\d+]/g, '')}`);
    expect(hrefs).toContain(contact.linkedin);
    expect(hrefs).toContain(contact.github);
  });
});
