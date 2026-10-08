import { getViteConfig } from 'astro/config';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { createServer, type ViteDevServer } from 'vite';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { contact } from '../../data/contact';
import { recommendations, recommendationsAutoplay, type Recommendation } from '../../data/home';

// AC-09, AC-10, AC-42, AC-43 (T27, T31; screens.md SCR-01 recommendations, present and absent).
// Each card holds the quote word for word, the name and the role and, for a Recommendation from
// LinkedIn, an "On LinkedIn" link to the recommendations on Alexander's profile. The source fields
// (profile address, date, relationship) are never rendered. The markup carries the hooks of
// "Show more" and of the carousel; what the scripts do with them is in tests/e2e/carousel.spec.ts.

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

const rec = (
  name: string,
  consent = true,
  source: Recommendation['source'] = 'linkedin',
): Recommendation => ({
  name,
  role: `Role of ${name}, Company`,
  quote: `First paragraph of ${name} — with a dash, "quotes" & an it's.\n\nSecond paragraph: Oleksandr and Alexander stay as written.`,
  consent,
  source,
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

  it('links "On LinkedIn" to the recommendations address of contact.ts, in the same tab', async () => {
    const found = cards(await render({ items: [rec('Ada'), rec('Bo')], index: '03' }));
    for (const card of found) {
      const links = [...card.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/g)].map((m) => m[0]);
      expect(links).toHaveLength(1);
      expect(contact.links.recommendations).toBe(
        'https://www.linkedin.com/in/ponomalex/details/recommendations/',
      );
      expect(links[0]).toContain(`href="${contact.links.recommendations}"`);
      expect(text(links[0] ?? '')).toBe('On LinkedIn');
      expect(links[0]).not.toMatch(/\starget=/);
    }
  });

  it('shows no link on a Recommendation that was given directly', async () => {
    const found = cards(
      await render({ items: [rec('Ada'), rec('Bo', true, 'direct')], index: '03' }),
    );
    expect(found[0]).toMatch(/<a\b/);
    expect(found[1]).not.toMatch(/<a\b/);
    expect(text(found[1] ?? '')).not.toContain('LinkedIn');
    expect(text(found[1] ?? '')).toContain('Role of Bo, Company');
  });

  it('gives each quote a hidden "Show more" button that controls it (AC-09)', async () => {
    const found = cards(await render({ items: [rec('Ada'), rec('Bo')], index: '03' }));
    const ids = found.map((card) => card.match(/<blockquote\b[^>]*\sid="([^"]+)"/)?.[1]);
    expect(new Set(ids).size).toBe(2);
    found.forEach((card, i) => {
      const button = card.match(/<button\b[^>]*>[\s\S]*?<\/button>/)?.[0] ?? '';
      expect(card.match(/<button\b/g)).toHaveLength(1);
      expect(button).toMatch(/\stype="button"/);
      expect(button).toMatch(/\sdata-quote-toggle[\s>=]/);
      expect(button).toMatch(/\shidden[\s>=]/);
      expect(button).toContain('aria-expanded="false"');
      expect(button).toContain(`aria-controls="${ids[i]}"`);
      expect(text(button)).toBe('Show more');
      expect(card).toContain(`data-quote="${ids[i]}"`);
      // Whole by default: closing a quote is the script's work.
      expect(card).not.toMatch(/data-collapsed/);
    });
  });

  it('lets the row scroll only where it holds more cards than columns (AC-42)', async () => {
    const scrollOf = async (names: string[]) =>
      (await render({ items: names.map((n) => rec(n)), index: '03' })).match(
        /data-carousel-track[^>]*?\sdata-scroll="([^"]*)"/,
      )?.[1];
    expect(await scrollOf(['Ada'])).toBeUndefined();
    expect(await scrollOf(['Ada', 'Bo'])).toBe('sm');
    expect(await scrollOf(['Ada', 'Bo', 'Cy'])).toBe('sm md');
    expect(await scrollOf(['Ada', 'Bo', 'Cy', 'Di'])).toBe('sm md');
  });

  it('holds the two arrows, named and hidden until the carousel is on, and a status line', async () => {
    const html = await render({ items: [rec('Ada'), rec('Bo'), rec('Cy')], index: '03' });
    const nav = html.match(/<div\b[^>]*data-carousel-nav[^>]*>[\s\S]*?<\/div>/)?.[0] ?? '';
    expect(nav).toMatch(/^<div\b[^>]*\shidden[\s>=]/);
    const labels = [...nav.matchAll(/<button\b[^>]*aria-label="([^"]+)"/g)].map((m) => m[1]);
    expect(labels).toEqual(['Previous recommendation', 'Next recommendation']);
    expect(nav.match(/<svg\b/g)).toHaveLength(2);
    expect(html).toMatch(/<p\b[^>]*data-carousel-status[^>]*aria-live="polite"[^>]*>\s*<\/p>/);
    expect(html).toMatch(/<div\b[^>]*\sdata-carousel[\s>=]/);
  });

  it('turns by itself only when asked to; the home data leaves it off (AC-43)', async () => {
    const items = [rec('Ada'), rec('Bo')];
    expect(recommendationsAutoplay).toBe(false);
    expect(await render({ items, index: '03' })).not.toMatch(/data-autoplay/);
    expect(await render({ items, index: '03', autoplay: false })).not.toMatch(/data-autoplay/);
    expect(await render({ items, index: '03', autoplay: true })).toMatch(
      /<div\b[^>]*data-carousel[^>]*\sdata-autoplay[\s>=]/,
    );
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
    // Static: no carousel and no script hooks.
    expect(html).not.toMatch(/data-carousel|data-scroll|data-quote|<button\b/);
  });

  it('shows a closed quote as a static Styleguide sample when asked to', async () => {
    const html = await render({
      items: [rec('Ada'), { ...rec('Bo'), demo: 'collapsed' }],
      sample: true,
    });
    const found = cards(html);
    expect(found[0]).not.toMatch(/data-collapsed|<button\b/);
    expect(found[1]).toMatch(/<figure\b[^>]*\sdata-collapsed[\s>=]/);
    expect(text(found[1]?.match(/<button\b[^>]*>[\s\S]*?<\/button>/)?.[0] ?? '')).toBe('Show more');
    expect(quoteOf(found[1] ?? '')).toBe(`“${rec('Bo').quote}”`);
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
