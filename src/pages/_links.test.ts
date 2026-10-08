import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildSite, type SiteBuild } from '../../scripts/test-utils/build-site.ts';

// The link rule on the built output (home spec D-09, Owner decision 2026-10-08): every link to
// another site opens in a new tab and says so; mail, phone, download and internal links stay in
// the tab. Checked on every anchor of every built page, so a new link cannot miss the rule.

let site: SiteBuild;
beforeAll(() => {
  site = buildSite();
  if (site.status !== 0) throw new Error(site.log);
}, 180_000);
afterAll(() => site?.cleanup());

function pages(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return pages(path);
    return entry.name.endsWith('.html') ? [path] : [];
  });
}

interface Anchor {
  page: string;
  href: string;
  tag: string;
  inner: string;
}

function anchors(): Anchor[] {
  return pages(site.out).flatMap((file) => {
    const page = relative(site.out, file).replaceAll(sep, '/');
    const html = readFileSync(file, 'utf8');
    return [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)].map((m) => ({
      page,
      href: (m[1] ?? '').match(/\shref="([^"]*)"/)?.[1] ?? '',
      tag: m[1] ?? '',
      inner: m[2] ?? '',
    }));
  });
}

const isExternal = (href: string) =>
  /^https?:\/\//.test(href) && !href.startsWith('https://alpon.dev');
const where = (a: Anchor) => `${a.page}: ${a.href}`;

describe('links to other sites (D-09)', () => {
  it('exist on the built pages: the profiles, the recommendations, the sample projects', () => {
    const hrefs = new Set(
      anchors()
        .filter((a) => isExternal(a.href))
        .map((a) => a.href),
    );
    expect(hrefs).toContain('https://www.linkedin.com/in/ponomalex/');
    expect(hrefs).toContain('https://github.com/ponomaleks');
    expect(hrefs).toContain('https://www.linkedin.com/in/ponomalex/details/recommendations/');
  });

  it('open in a new tab, each with rel="noopener noreferrer"', () => {
    for (const a of anchors().filter((x) => isExternal(x.href))) {
      expect(a.tag, where(a)).toMatch(/\starget="_blank"/);
      const rel = (a.tag.match(/\srel="([^"]*)"/)?.[1] ?? '').split(/\s+/);
      expect(rel, where(a)).toEqual(expect.arrayContaining(['noopener', 'noreferrer']));
    }
  });

  it('say "(opens in a new tab)" in their name, in an element hidden from sight only', () => {
    for (const a of anchors().filter((x) => isExternal(x.href))) {
      expect(a.inner, where(a)).toMatch(
        /<span\b[^>]*class="[^"]*\b(?:fj-link__hint|fj-footer__hint)\b[^"]*"[^>]*>\s*\(opens in a new tab\)\s*<\/span>/,
      );
      expect(a.inner, where(a)).not.toMatch(/<span\b[^>]*(?:aria-hidden|hidden)[^>]*>\s*\(opens/);
    }
  });
});

describe('every other link (D-09)', () => {
  it('stays in the tab: mail, phone, downloads and links inside the site', () => {
    const inside = anchors().filter((a) => !isExternal(a.href));
    expect(inside.some((a) => a.href.startsWith('mailto:'))).toBe(true);
    expect(inside.some((a) => a.href.startsWith('tel:'))).toBe(true);
    expect(inside.some((a) => a.href.endsWith('.vcf'))).toBe(true);
    for (const a of inside) {
      expect(a.tag, where(a)).not.toMatch(/\starget=/);
      expect(a.inner, where(a)).not.toContain('opens in a new tab');
    }
  });
});
