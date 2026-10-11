import { readFileSync } from 'node:fs';
import { getViteConfig } from 'astro/config';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { createServer, type ViteDevServer } from 'vite';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { contact } from '../../data/contact';

// AC-13, AC-14, AC-15, AC-16, AC-17 (T14; screens.md SCR-01 contact, qr). Contract:
// ContactBlock takes an `index` prop (section number) like About; the section wrapper is T15's.
// The Copy button is `[data-copy-email]` behind `data-needs-script`. QrTile is its own component.

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
    .replace(/\s+/g, ' ')
    .trim();

async function render(path: string, props: Record<string, unknown> = {}): Promise<string> {
  const mod = await server.ssrLoadModule(path);
  return container.renderToString(mod.default, { props });
}
const renderBlock = () => render('/src/components/home/ContactBlock.astro', { index: '05' });
const renderQr = () => render('/src/components/brand/QrTile.astro');

const anchors = (html: string) =>
  [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)].map((m) => ({
    attrs: m[1] ?? '',
    label: text(m[2] ?? ''),
  }));
const href = (attrs: string) => attrs.match(/href="([^"]*)"/)?.[1];

describe('ContactBlock', () => {
  it('prints the heading and the lead (AC-13)', async () => {
    const html = await renderBlock();
    expect(html).toMatch(/<h2\b[^>]*>\s*Get in touch\s*<\/h2>/);
    expect(text(html)).toContain('Email is fastest. Phone and LinkedIn work too.');
  });

  it('has the five rows in order (AC-13)', async () => {
    const html = await renderBlock();
    const t = text(html);
    const order = ['Email', 'Phone', 'LinkedIn', 'GitHub', 'Region'].map((k) =>
      t.indexOf(k, t.indexOf('Email is fastest')),
    );
    expect(order.every((i) => i >= 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
    expect(t).toContain(contact.email);
  });

  // Owner decision (2026-10-07): the work-region row is labelled "Region", so it does not read
  // like the footer's "Based in" (the residence).
  it('labels the rows Email, Phone, LinkedIn, GitHub and Region', async () => {
    const html = await renderBlock();
    const labels = [...html.matchAll(/<dt\b[^>]*>([\s\S]*?)<\/dt>/g)].map((m) => text(m[1] ?? ''));
    expect(labels).toEqual(['Email', 'Phone', 'LinkedIn', 'GitHub', 'Region']);
    expect(text(html)).not.toContain('Based in');
  });

  // Design (ContactList, .fj-contacts__v): the row values are plain text-coloured mono values,
  // not underlined text links; (CopyButton, .fj-copy): Copy is the small bordered mono control.
  it('draws the row links as contact values and Copy as the copy control', async () => {
    const html = await renderBlock();
    const rows = html.match(/<dl\b[\s\S]*?<\/dl>/)?.[0] ?? '';
    const links = [...rows.matchAll(/<a\b([^>]*)>/g)].map((m) => m[1] ?? '');
    expect(links).toHaveLength(4);
    // Mail and phone are plain contact values; the two profiles leave the site and are quiet
    // external links inside a contact value (D-09).
    const [mail = '', phone = '', ...profiles] = links;
    for (const attrs of [mail, phone]) {
      expect(attrs).toMatch(/class="[^"]*\bcontact__value\b/);
      expect(attrs).not.toMatch(/\bfj-link\b/);
    }
    expect(profiles).toHaveLength(2);
    for (const attrs of profiles) {
      expect(attrs).toMatch(/class="[^"]*\bfj-link--external\b[^"]*\bfj-link--quiet\b/);
    }
    expect(
      rows.match(/<span\b[^>]*class="[^"]*\bcontact__value\b[^"]*"[^>]*>\s*<a\b/g),
    ).toHaveLength(2);
    const copy = rows.match(/<button\b[^>]*data-copy-email[^>]*>/)?.[0] ?? '';
    expect(copy).toMatch(/class="[^"]*\bfj-copy\b/);
    expect(copy).not.toMatch(/\bfj-btn\b/);
    expect(copy).toContain('type="button"');
  });

  it('draws "Add to contacts" with the add-to-contacts icon (design: user-plus)', async () => {
    const html = await renderBlock();
    const save = html.match(/<a\b[^>]*href="\/alexander-ponomarenko\.vcf"[^>]*>[\s\S]*?<\/a>/)?.[0];
    const icon = readFileSync('src/components/ui/Icon.astro', 'utf8');
    const path = (name: string) =>
      icon.match(new RegExp(`'?${name}'?:\\s*'([^']+)'`))?.[1] ?? `no ${name} icon`;
    expect(save).toContain(`d="${path('user-plus')}"`);
    expect(save).not.toContain(`d="${path('download')}"`);
  });

  it('links the email as mailto and the phone as tel (AC-13)', async () => {
    const links = anchors(await renderBlock());
    const mail = links.find((a) => a.label === contact.email);
    expect(mail && href(mail.attrs)).toBe(`mailto:${contact.email}`);
    const tel = links.find((a) => a.label === contact.phone);
    const telHref = tel && href(tel.attrs);
    expect(telHref).toMatch(/^tel:\+?[\d-]+$/);
    expect(telHref?.replace(/\D/g, '')).toBe(contact.phone.replace(/\D/g, ''));
  });

  it('links LinkedIn and GitHub with their short addresses, in a new tab (AC-13, D-09)', async () => {
    const html = await renderBlock();
    const profiles = [
      [contact.linkedin, 'linkedin.com/in/ponomalex'],
      [contact.github, 'github.com/ponomaleks'],
    ] as const;
    for (const [url, short] of profiles) {
      const a =
        [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)].find((m) =>
          (m[1] ?? '').includes(`href="${url}"`),
        ) ?? [];
      const [, attrs = '', inner = ''] = a;
      expect(attrs, short).toMatch(/\starget="_blank"/);
      expect(attrs).toContain('rel="noopener noreferrer"');
      expect(attrs).toMatch(/class="[^"]*\bfj-link--external\b/);
      expect(inner).toContain(short);
      expect(inner).toMatch(/<svg\b[^>]*aria-hidden="true"/);
      expect(inner).toMatch(/<span\b[^>]*class="fj-link__hint"[^>]*>\s*\(opens in a new tab\)/);
    }
  });

  it('keeps the mail and the phone link in the tab, without icon or hint (D-09)', async () => {
    const html = await renderBlock();
    const inTab = [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)].filter((m) =>
      /href="(?:mailto:|tel:|\/)/.test(m[1] ?? ''),
    );
    expect(inTab.length).toBeGreaterThanOrEqual(3);
    for (const [, attrs = '', inner = ''] of inTab) {
      expect(attrs).not.toMatch(/\starget=/);
      expect(inner).not.toContain('opens in a new tab');
    }
  });

  it('marks "Oslo, Norge" as Norwegian (AC-13)', async () => {
    const html = await renderBlock();
    expect(contact.workRegion).toBe('Oslo, Norge');
    expect(html).toMatch(/<[a-z]+\b[^>]*\blang="no"[^>]*>\s*Oslo, Norge\s*<\/[a-z]+>/);
    expect(html).not.toContain('Nittedal');
  });

  it('offers Copy at the end of the email row, behind data-needs-script (AC-14, AC-15)', async () => {
    const html = await renderBlock();
    const buttons = [...html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)];
    const copy = buttons.find((m) => /data-copy-email/.test(m[1] ?? ''));
    expect(copy).toBeDefined();
    expect(text(copy?.[2] ?? '')).toContain('Copy');
    expect(copy?.[1]).toContain(`data-copy-email="${contact.email}"`);
    const before = html.slice(0, copy?.index ?? 0);
    const gated = /<[a-z]+\b[^>]*data-needs-script[^>]*>[^<]*(<(?!\/)[^>]*>[^<]*)*$/.test(before);
    expect(/data-needs-script/.test(copy?.[1] ?? '') || gated).toBe(true);
    expect(html.indexOf(contact.email)).toBeLessThan(html.indexOf('data-copy-email'));
  });

  // Owner's design review (reverses D-18): the Copy control has the design's own done state.
  // Both faces come from the server; the script only sets `data-done`. The name stays "Copy":
  // the done face is hidden from assistive technology, so only the Toast announces the copy.
  it('carries both faces of Copy: "Copy" as the name and a hidden "Copied" without an icon', async () => {
    const html = await renderBlock();
    const copy = html.match(/<button\b[^>]*data-copy-email[^>]*>[\s\S]*?<\/button>/)?.[0] ?? '';
    expect(copy).not.toMatch(/<button\b[^>]*\bdata-done\b/);
    expect(copy).not.toMatch(/<button\b[^>]*\baria-label\b/);
    const done = copy.match(/<span\b[^>]*class="fj-copy__face fj-copy__face--done"[^>]*>[\s\S]*$/);
    expect(done?.[0]).toMatch(/^<span\b[^>]*aria-hidden="true"/);
    // Interface text is English and the done face has no icon, so the control keeps the design's
    // width (Owner, 2026-10-07).
    expect(text(done?.[0] ?? '')).toBe('Copied');
    expect(done?.[0]).not.toContain('lang=');
    expect(done?.[0]).not.toContain('<svg');
    const icon = readFileSync('src/components/ui/Icon.astro', 'utf8');
    const path = (name: string) => icon.match(new RegExp(`\\b${name}:\\s*'([^']+)'`))?.[1];
    const rest = copy.slice(0, done?.index);
    expect(text(rest)).toBe('Copy');
    expect(rest).toContain(`d="${path('copy')}"`);
    expect(rest).not.toMatch(/<span\b[^>]*aria-hidden/);
  });

  it('keeps the address a selectable mail link without the script (AC-15)', async () => {
    const links = anchors(await renderBlock());
    expect(links.some((a) => href(a.attrs) === `mailto:${contact.email}`)).toBe(true);
  });

  it('offers "Add to contacts" as a download of the contact card (AC-16)', async () => {
    const links = anchors(await renderBlock());
    const save = links.find((a) => a.label.includes('Add to contacts'));
    expect(save).toBeDefined();
    // save-contact-hint AC-01: the file type is meta text; assistive technology gets the long form.
    expect(save?.label).toBe('Add to contacts .vcf (vCard file)');
    expect(await renderBlock()).toMatch(
      // Label and meta share one line box, so the two sizes sit on one baseline.
      /<span class="fj-btn__label"[^>]*>\s*Add to contacts\s*<span class="fj-btn__meta" aria-hidden="true"[^>]*>\.vcf<\/span>\s*<\/span>\s*<span class="fj-btn__sr"[^>]*>\s*\(vCard file\)<\/span>/,
    );
    expect(href(save?.attrs ?? '')).toBe('/alexander-ponomarenko.vcf');
    expect(save?.attrs).toMatch(/\bdownload\b/);
  });

  it('puts the inline note with the download icon right after the action (save-contact-hint AC-02)', async () => {
    const html = await renderBlock();
    const icon = readFileSync('src/components/ui/Icon.astro', 'utf8');
    const d = icon.match(/download:\s*'([^']+)'/)?.[1] ?? 'no download icon';
    const note = html.match(/<p\b[^>]*class="save-note"[^>]*>[\s\S]*?<\/p>/)?.[0] ?? '';
    expect(text(note)).toBe('Downloads a contact card. Open it from Downloads to add.');
    expect(note).toContain('d="' + d + '"');
    expect(note).toMatch(/<svg\b[^>]*aria-hidden="true"/);
    expect(html.indexOf('save-note')).toBeGreaterThan(html.indexOf('Add to contacts'));
    expect(html.indexOf('save-note')).toBeLessThan(html.indexOf('Skann meg'));
  });

  it('has no primary button (D-09)', async () => {
    const html = await renderBlock();
    expect(html).not.toMatch(/\b(btn|button)--primary\b|data-variant="primary"|fjord-btn--primary/);
  });

  it('prints the mail-link sentence with "A short email" as the link (AC-13)', async () => {
    const html = await renderBlock();
    expect(text(html)).toContain(
      'Hiring? A short email about the role is the quickest way to reach me.',
    );
    const link = anchors(html).find((a) => a.label === 'A short email');
    expect(link && href(link.attrs)).toBe(`mailto:${contact.email}`);
  });
});

describe('QrTile', () => {
  it('holds both static theme files, once each, and nothing else generated (AC-17)', async () => {
    const html = await renderQr();
    for (const theme of ['dag', 'natt']) {
      expect(html.match(new RegExp(`/qr/qr-vcard-${theme}\\.svg`, 'g'))).toHaveLength(1);
      expect(() => readFileSync(`public/qr/qr-vcard-${theme}.svg`)).not.toThrow();
    }
    expect(html).toMatch(/data-theme/);
  });

  it('gives the images a text alternative (AC-17)', async () => {
    const html = await renderQr();
    const imgs = html.match(/<img\b[^>]*>/g) ?? [];
    expect(imgs.length).toBeGreaterThanOrEqual(1);
    const alts = imgs.map((i) => i.match(/\balt="([^"]+)"/)?.[1]);
    expect(alts.some((a) => a && /contact/i.test(a))).toBe(true);
  });

  it('captions "Skann meg" as Norwegian and gives the camera hint (AC-17)', async () => {
    const html = await renderQr();
    expect(html).toMatch(/<[a-z]+\b[^>]*\blang="no"[^>]*>\s*Skann meg\s*<\/[a-z]+>/);
    expect(text(html)).toContain('Point your phone’s camera here to open my contact card.');
  });

  // Design (.fj-qr-figure, .x-qr): the caption is the figure's caption, under the tile; the hint
  // is a paragraph beside the figure, not part of it.
  it('captions the figure with "Skann meg" alone and puts the hint beside the figure', async () => {
    const html = await renderQr();
    const figure = html.match(/<figure\b[\s\S]*?<\/figure>/)?.[0] ?? '';
    const caption = figure.match(/<figcaption\b([^>]*)>([\s\S]*?)<\/figcaption>/);
    expect(caption?.[1]).toContain('lang="no"');
    expect(text(caption?.[2] ?? '')).toBe('Skann meg');
    expect(figure.indexOf('<img')).toBeLessThan(figure.indexOf('<figcaption'));
    expect(text(figure)).not.toContain('camera');
    const after = html.slice(html.indexOf('</figure>'));
    expect(after).toMatch(/<p\b[^>]*>\s*Point your phone’s camera here to open my contact card\./);
  });
});
