import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildSite, repo, type SiteBuild } from '../../scripts/test-utils/build-site.ts';

// SCR-01 home page composed on the built output (T15: AC-01, AC-04, AC-11, AC-18, AC-32, AC-36,
// AC-40; sad §5, §8 Contact place).

let site: SiteBuild;
beforeAll(() => {
  site = buildSite();
  if (site.status !== 0) throw new Error(site.log);
}, 180_000);
afterAll(() => site?.cleanup());

const read = (file: string) => readFileSync(join(site.out, file), 'utf8');
const html = () => read('index.html');
const main = () => html().match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1] ?? '';
const textOf = (markup: string) =>
  markup
    .replace(/<svg[\s\S]*?<\/svg>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
const scriptSrcs = (source: string) =>
  [...source.matchAll(/<script\b[^>]*\ssrc="([^"]+)"/g)].map((m) => m[1] ?? '');

describe('built index.html, section order (AC-01)', () => {
  it('holds hero, key facts, About 01, Experience 02 and Contact 03 in this order', () => {
    const m = main();
    const at = [
      m.search(/<section\b[^>]*\bdata-hero\b/),
      m.search(/<section\b[^>]*aria-label="Key facts"/),
      m.search(/<section\b[^>]*id="about"/),
      m.search(/<section\b[^>]*aria-label="Experience"/),
      m.search(/<section\b[^>]*id="contact"/),
    ];
    expect(at.every((i) => i >= 0)).toBe(true);
    expect([...at].sort((a, b) => a - b)).toEqual(at);
    const eyebrows = [
      ...m.matchAll(/<b\b[^>]*>(\d{2})<\/b>\s*<i[^>]*>\/<\/i>\s*<span\b[^>]*>([^<]+)<\/span>/g),
    ].map((x) => `${x[1]} ${x[2]}`);
    expect(eyebrows).toEqual(['01 About', '02 Experience', '03 Contact']);
  });

  it('renders no Recommendations, no Selected projects and no "All projects"', () => {
    const t = textOf(main());
    expect(t).not.toMatch(/recommendations/i);
    expect(t).not.toMatch(/selected projects/i);
    expect(t).not.toMatch(/all projects/i);
    expect(main()).not.toMatch(/href="\/projects/);
  });

  it('has exactly one h1', () => {
    expect(html().match(/<h1\b/g)).toHaveLength(1);
  });
});

describe('built index.html, contact place (AC-18)', () => {
  it('is a section with id="contact" and tabindex="-1" that holds the contact block', () => {
    const tag = main().match(/<section\b[^>]*id="contact"[^>]*>/)?.[0] ?? '';
    expect(tag).toMatch(/tabindex="-1"/);
    expect(html().match(/id="contact"/g)).toHaveLength(1);
    const body = main().slice(main().indexOf(tag));
    expect(body).toContain('Get in touch');
    expect(body).toContain('class="contact');
  });

  it('keeps the header clear of the target with scroll-margin-top from a header-height token', () => {
    const tag = main().match(/<section\b[^>]*id="contact"[^>]*>/)?.[0] ?? '';
    const classes = (tag.match(/class="([^"]*)"/)?.[1] ?? '').split(/\s+/).filter(Boolean);
    const assets = join(site.out, '_astro');
    const css = readdirSync(assets)
      .filter((f) => f.endsWith('.css'))
      .map((f) => readFileSync(join(assets, f), 'utf8'))
      .join('\n');
    const names = ['#contact', '[id=contact]', '[id="contact"]', ...classes.map((c) => '.' + c)];
    const targets = (sel: string) =>
      sel.split(',').some((part) => {
        const last = part.trim().split(/s+/).pop() ?? '';
        return names.some((n) => last.startsWith(n) && !/^[-w]/.test(last.slice(n.length)));
      });
    const rules = [...css.matchAll(/([^{}]+){([^}]*)}/g)]
      .filter(([, sel]) => targets(sel ?? ''))
      .map(([, , body]) => body ?? '');
    expect(rules.join(';')).toMatch(
      /scroll-margin-top:\s*var\(--fjord-(?:scroll-offset|header-height)[\w-]*\)/,
    );
  });
});

describe('built index.html, page options (AC-11, AC-40)', () => {
  it('puts data-over-hero on the header', () => {
    expect(html()).toMatch(/<header\b[^>]*\sdata-over-hero\b/);
    expect(main()).toMatch(/\sdata-hero[\s>=]/);
  });

  it('gives the closing band the home pair: Save contact, then Download CV, both secondary', () => {
    const band =
      html().match(/<section\s[^>]*class="fj-band[^>]*>([\s\S]*?)<\/section>/)?.[1] ?? '';
    const anchors = [...band.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/g)].map((m) => m[0]);
    expect(anchors).toHaveLength(2);
    expect(anchors[0]).toContain('href="/alexander-ponomarenko.vcf"');
    expect(anchors[0]).toContain('Save contact');
    expect(anchors[1]).toContain('Download CV');
    expect(anchors[1]).toContain('-cv-en.pdf');
    for (const a of anchors) {
      expect(a).toContain('fj-btn--secondary');
      expect(a).not.toContain('fj-btn--primary');
      expect(a).toMatch(/\sdownload(?:=""|\s|>)/);
    }
    expect(band).not.toContain('Get in touch');
  });

  it('carries one ld+json Person block', () => {
    const blocks = [
      ...html().matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g),
    ];
    expect(blocks).toHaveLength(1);
    const data = JSON.parse(blocks[0]?.[1] ?? '{}') as Record<string, unknown>;
    expect(data['@type']).toBe('Person');
    expect(data.name).toBe('Alexander Ponomarenko');
  });
});

describe('built index.html, scripts (AC-32, AC-36)', () => {
  it('loads exactly one page-own script file, one that 404.html does not load', () => {
    const shell = new Set(scriptSrcs(read('404.html')));
    const own = scriptSrcs(html()).filter((s) => !shell.has(s));
    expect(own).toHaveLength(1);
    expect(own[0]).toMatch(/\.js$/);
  });

  it('has no inline script other than the theme bootstrap and the ld+json block, and no inline style', () => {
    const inline = [...html().matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)].filter(
      (m) => !/\ssrc=/.test(m[1] ?? '') && !/ld\+json/.test(m[1] ?? ''),
    );
    expect(inline.length).toBeLessThanOrEqual(1);
    expect(html()).not.toMatch(/<style\b|\sstyle=|\son[a-z]+=/i);
  });

  it('leaves the home sections without their own script tags: the entry wires them all', () => {
    for (const f of ['Hero', 'KeyFacts']) {
      const src = readFileSync(join(repo, `src/components/home/${f}.astro`), 'utf8');
      expect(src, f).not.toMatch(/<script\b/);
    }
    const index = readFileSync(join(repo, 'src/pages/index.astro'), 'utf8');
    expect(index).toMatch(/scripts\/home\/index/);
  });

  it('wires every home module from the one entry', () => {
    const entry = readFileSync(join(repo, 'src/scripts/home/index.ts'), 'utf8');
    for (const fn of [
      'initHeroHeader',
      'initMotion',
      'initParallax',
      'initCountUp',
      'initReveal',
      'initCopyEmail',
    ]) {
      expect(entry).toContain(fn);
    }
  });
});
