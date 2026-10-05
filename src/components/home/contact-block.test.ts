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
  server = await createServer({ ...config, server: { middlewareMode: true }, appType: 'custom' });
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
    const order = ['Email', 'Phone', 'LinkedIn', 'GitHub', 'Based in'].map((k) =>
      t.indexOf(k, t.indexOf('Email is fastest')),
    );
    expect(order.every((i) => i >= 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
    expect(t).toContain(contact.email);
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

  it('links LinkedIn and GitHub with their short addresses and without target (AC-13)', async () => {
    const links = anchors(await renderBlock());
    const profiles = [
      [contact.linkedin, 'linkedin.com/in/ponomalex'],
      [contact.github, 'github.com/ponomaleks'],
    ] as const;
    for (const [url, short] of profiles) {
      const a = links.find((l) => l.label === short);
      expect(a, short).toBeDefined();
      expect(href(a?.attrs ?? '')).toBe(url);
      expect(a?.attrs).not.toMatch(/\btarget=/);
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

  it('keeps the address a selectable mail link without the script (AC-15)', async () => {
    const links = anchors(await renderBlock());
    expect(links.some((a) => href(a.attrs) === `mailto:${contact.email}`)).toBe(true);
  });

  it('offers "Save contact (.vcf)" as a download of the contact card (AC-16)', async () => {
    const links = anchors(await renderBlock());
    const save = links.find((a) => a.label.includes('Save contact (.vcf)'));
    expect(save).toBeDefined();
    expect(href(save?.attrs ?? '')).toBe('/alexander-ponomarenko.vcf');
    expect(save?.attrs).toMatch(/\bdownload\b/);
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
});
