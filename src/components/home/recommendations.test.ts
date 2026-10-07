import { getViteConfig } from 'astro/config';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { createServer, type ViteDevServer } from 'vite';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { contact } from '../../data/contact';
import { recommendations, type Recommendation } from '../../data/home';

// AC-09, AC-10 (T27; screens.md SCR-01 recommendations, present and absent). Each card shows the
// quote word for word, the name and the role, and an "On LinkedIn" link to Alexander's profile.
// The source fields of a Recommendation (profile address, date, relationship) are never rendered.

let server: ViteDevServer;
let container: AstroContainer;

beforeAll(async () => {
  const config = await getViteConfig({})({ mode: 'test', command: 'serve' });
  server = await createServer({ ...config, server: { middlewareMode: true }, appType: 'custom' });
  container = await AstroContainer.create();
}, 120_000);
afterAll(() => server?.close());

const decode = (s: string) =>
  s
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n: string) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
const text = (s: string) =>
  decode(
    s
      .replace(/<svg[\s\S]*?<\/svg>/g, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim(),
  );

const rec = (name: string, consent = true): Recommendation => ({
  name,
  role: `Role of ${name}, Company`,
  quote: `First paragraph of ${name} — with a dash, "quotes" & an it's.\n\nSecond paragraph: Oleksandr and Alexander stay as written.`,
  consent,
  profile: `https://example.com/in/${name.toLowerCase()}-source/`,
  date: 'January 31, 2026',
  relationship: `${name} worked next to Alexander`,
});

async function render(props: Record<string, unknown> = {}): Promise<string> {
  const mod = await server.ssrLoadModule('/src/components/home/Recommendations.astro');
  return container.renderToString(mod.default, { props });
}

const cards = (html: string) =>
  [...html.matchAll(/<figure\b[^>]*>[\s\S]*?<\/figure>/g)].map((m) => m[0]);
/** The quote as the card prints it: its paragraphs, joined the way the data joins them. */
const quoteOf = (card: string) =>
  [
    ...(card.match(/<blockquote\b[^>]*>([\s\S]*?)<\/blockquote>/)?.[1] ?? '').matchAll(
      /<p\b[^>]*>([\s\S]*?)<\/p>/g,
    ),
  ]
    .map((m) => decode((m[1] ?? '').trim()))
    .join('\n\n');

describe('Recommendations', () => {
  it('heads the section "From people I’ve worked with" with the number from a prop', async () => {
    const html = await render({ items: [rec('Ada')], index: '07' });
    expect(html).toMatch(/<section\b[^>]*aria-labelledby="recommendations-title"/);
    expect(html).toMatch(
      /<h2\b[^>]*id="recommendations-title"[^>]*>\s*From people I’ve worked with\s*<\/h2>/,
    );
    expect(text(html)).toContain('07 / Recommendations');
    expect(text(await render({ items: [rec('Ada')], index: '42' }))).toContain('42');
  });

  it('prints each quote word for word between quotation marks, paragraph by paragraph', async () => {
    const items = [rec('Ada'), rec('Bo')];
    const found = cards(await render({ items, index: '03' }));
    expect(found).toHaveLength(2);
    found.forEach((card, i) => {
      expect(card.match(/<blockquote\b/g)).toHaveLength(1);
      expect(card.match(/<p\b/g)).toHaveLength(2);
      expect(quoteOf(card)).toBe(`“${items[i]?.quote}”`);
    });
  });

  it('shows the name and the role of each person', async () => {
    const found = cards(await render({ items: [rec('Ada'), rec('Bo')], index: '03' }));
    expect(found[0]).toMatch(/<strong\b[^>]*>\s*Ada\s*<\/strong>/);
    expect(text(found[0] ?? '')).toContain('Role of Ada, Company');
    expect(found[1]).toMatch(/<strong\b[^>]*>\s*Bo\s*<\/strong>/);
    expect(text(found[1] ?? '')).toContain('Role of Bo, Company');
  });

  it('links "On LinkedIn" to the profile of contact.ts, in the same tab', async () => {
    const found = cards(await render({ items: [rec('Ada'), rec('Bo')], index: '03' }));
    for (const card of found) {
      const links = [...card.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/g)].map((m) => m[0]);
      expect(links).toHaveLength(1);
      expect(links[0]).toContain(`href="${contact.linkedin}"`);
      expect(text(links[0] ?? '')).toBe('On LinkedIn');
      expect(links[0]).not.toMatch(/\starget=/);
    }
  });

  it('never renders the profile address, the date or the relationship of a Recommendation', async () => {
    const html = decode(await render({ items: [rec('Ada'), rec('Bo')], index: '03' }));
    for (const r of [rec('Ada'), rec('Bo')]) {
      expect(html).not.toContain(r.profile);
      expect(html).not.toContain('example.com');
      expect(html).not.toContain(r.date);
      expect(html).not.toContain(r.relationship);
    }
  });

  it('leaves out a quote without consent and does not change the others', async () => {
    const items = [rec('Ada'), rec('Silent', false), rec('Bo')];
    const html = await render({ items, index: '03' });
    const found = cards(html);
    expect(found).toHaveLength(2);
    expect(text(html)).not.toContain('Silent');
    expect(quoteOf(found[0] ?? '')).toBe(`“${items[0]?.quote}”`);
    expect(quoteOf(found[1] ?? '')).toBe(`“${items[2]?.quote}”`);
  });

  it('renders the cards alone as a Styleguide sample, without a heading', async () => {
    const html = await render({ items: [rec('Ada'), rec('Bo')], sample: true });
    expect(cards(html)).toHaveLength(2);
    expect(html).not.toMatch(/<h2\b|<section\b/);
  });

  it('shows the repo data by default: both people, name and role only', async () => {
    const html = await render({ index: '03' });
    const found = cards(html);
    expect(found).toHaveLength(recommendations.length);
    expect(found).toHaveLength(2);
    recommendations.forEach((r, i) => {
      expect(quoteOf(found[i] ?? '')).toBe(`“${r.quote}”`);
      expect(text(found[i] ?? '')).toContain(r.name);
      expect(text(found[i] ?? '')).toContain(r.role);
      expect(decode(html)).not.toContain(r.profile);
      expect(decode(html)).not.toContain(r.date);
      expect(decode(html)).not.toContain(r.relationship);
    });
  });
});
