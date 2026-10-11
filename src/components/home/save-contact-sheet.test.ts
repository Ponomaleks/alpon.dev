import { readFileSync } from 'node:fs';
import { getViteConfig } from 'astro/config';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { createServer, type ViteDevServer } from 'vite';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

// save-contact-hint AC-03, AC-06, AC-07, AC-08, AC-10 (T4). Contract: SaveContactSheet renders a
// native <dialog id="save-contact-sheet"> named by its level 2 title; `sample` renders the same
// content as a static block for the Styleguide, with no <dialog> and no id.

let server: ViteDevServer;
let container: AstroContainer;

beforeAll(async () => {
  const config = await getViteConfig({})({ mode: 'test', command: 'serve' });
  server = await createServer({
    ...config,
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

async function render(props: Record<string, unknown> = {}): Promise<string> {
  const mod = await server.ssrLoadModule('/src/components/home/SaveContactSheet.astro');
  return container.renderToString(mod.default, { props });
}

const source = readFileSync('src/components/home/SaveContactSheet.astro', 'utf8');

describe('SaveContactSheet', () => {
  it('is a dialog named by its level 2 title (AC-08)', async () => {
    const html = await render();
    const root = html.match(/<dialog\b[^>]*>/)?.[0] ?? '';
    expect(root).toContain('id="save-contact-sheet"');
    expect(root).toContain('aria-labelledby="save-contact-sheet-title"');
    expect(root).not.toMatch(/\sopen\b/);
    expect(html).toMatch(
      /<h2\b[^>]*id="save-contact-sheet-title"[^>]*>\s*Add the contact card\s*<\/h2>/,
    );
    expect(html.match(/<h[1-6]\b/g)).toHaveLength(1);
  });

  it('holds the copy of AC-03 in order, the same for every device', async () => {
    const t = text(await render());
    const parts = [
      'Add the contact card',
      'Alexander Ponomarenko.vcf',
      'It goes to your Downloads.',
      '01',
      'If your browser asks, tap Download.',
      '02',
      'Open Downloads in your Files app.',
      '03',
      'Tap the file and save it as a contact.',
      'Got it',
      'Or scan the QR code on a computer.',
    ];
    expect(t).toBe(parts.join(' '));
  });

  it('lists the three steps as an ordered list with decorative numbers', async () => {
    const html = await render();
    const list = html.match(/<ol\b[\s\S]*?<\/ol>/)?.[0] ?? '';
    expect(list.match(/<li\b/g)).toHaveLength(3);
    expect(list.match(/<span\b[^>]*aria-hidden="true"[^>]*>\s*0[123]\s*<\/span>/g)).toHaveLength(3);
  });

  it('names the file as the browser saves it, under the title beside the icon (D-04)', async () => {
    const html = await render();
    // public/_headers gives the saved file its name; the sheet must show that name.
    const headers = readFileSync('public/_headers', 'utf8');
    const saved = headers.match(
      /^\/alexander-ponomarenko\.vcf\r?\n(?:[ \t]+.*\r?\n)*?[ \t]+Content-Disposition:.*filename="([^"]+)"/m,
    )?.[1];
    expect(saved).toBe('Alexander Ponomarenko.vcf');
    const head =
      html.match(/<div\b[^>]*class="save-sheet__head"[\s\S]*?<\/div>\s*<\/div>/)?.[0] ?? '';
    expect(text(head)).toBe('Add the contact card ' + saved);
    expect(head).toMatch(/<svg\b/);
    expect(head).toMatch(
      new RegExp('<p\\b[^>]*class="save-sheet__file"[^>]*>\\s*' + saved + '\\s*</p>'),
    );
  });

  it('has no drag handle (D-06)', async () => {
    expect(await render()).not.toMatch(/handle/);
  });

  it('has one button, "Got it": primary, large, full width (AC-06, D-05)', async () => {
    const html = await render();
    const buttons = html.match(/<button\b[^>]*>[\s\S]*?<\/button>/g) ?? [];
    expect(buttons).toHaveLength(1);
    const [got = ''] = buttons;
    expect(text(got)).toBe('Got it');
    expect(got).toContain('type="button"');
    for (const c of ['fj-btn--primary', 'fj-btn--lg', 'fj-btn--block']) expect(got).toContain(c);
    expect(html).not.toMatch(/<a\b/);
  });

  it('draws the user-plus icon in the header, decorative (D-07)', async () => {
    const html = await render();
    const icon = readFileSync('src/components/ui/Icon.astro', 'utf8');
    const d = icon.match(/'user-plus':\s*'([^']+)'/)?.[1] ?? 'no user-plus icon';
    expect(html).toContain(`d="${d}"`);
    expect(html).toMatch(/<svg\b[^>]*aria-hidden="true"/);
  });

  it('sample: a static block with no dialog, no id and a level 3 title (AC-10)', async () => {
    const html = await render({ sample: true });
    expect(html).not.toMatch(/<dialog\b/);
    expect(html).not.toMatch(/\sid="/);
    expect(html).not.toContain('aria-labelledby');
    expect(html).toMatch(/<div\b[^>]*class="save-sheet save-sheet--sample"/);
    expect(html).toMatch(/<h3\b[^>]*>\s*Add the contact card\s*<\/h3>/);
    expect(text(html)).toContain('Got it');
  });
});

describe('SaveContactSheet styles (AC-06, AC-07)', () => {
  const css = source.slice(source.indexOf('<style'));

  it('uses tokens only: no hex colour and no pixel literal outside the 768 query', () => {
    const rules = css.replace(/\/\*[\s\S]*?\*\//g, '').replace('@media (min-width: 768px)', '');
    expect(rules).not.toMatch(/#[0-9a-f]{3,8}\b/i);
    expect(rules).not.toMatch(/\b\d+px\b/);
  });

  it('dims the page with the scrim token', () => {
    expect(css).toMatch(/::backdrop\s*\{[^}]*var\(--fjord-color-scrim\)/);
  });

  it('takes the wide form from 768', () => {
    expect(css).toContain('@media (min-width: 768px)');
    expect(css).not.toContain('600px');
  });

  it('moves only when the Visitor has not asked for reduced motion', () => {
    const start = css.indexOf('@media (prefers-reduced-motion: no-preference)');
    expect(start).toBeGreaterThan(-1);
    expect(css.slice(0, start)).not.toMatch(/\banimation(-name)?\s*:/);
    expect(css.slice(start)).toMatch(/animation:[^;]*var\(--fjord-duration-200\)/);
  });
});
