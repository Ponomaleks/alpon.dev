import { spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { contact } from '../../data/contact';
import { cvPdf } from '../../data/cv/index';

// AC-13, AC-14, AC-20 (T9): SkipLink, CtaBand and Footer. A real production build of a
// throwaway fixture page (outside the repo); the test reads the built HTML. Focus and
// layout checks are T20's browser tests.

const repo = fileURLToPath(new URL('../../../', import.meta.url));
const layoutDir = join(repo, 'src/components/layout');
const layout = (name: string) => join(layoutDir, name).replaceAll('\\', '/');
const shellActionsPath = join(repo, 'src/data/shell-actions.ts').replaceAll('\\', '/');
let out = '';
let page = '';
let css = '';

const fixture = `---
import SkipLink from '${layout('SkipLink.astro')}';
import CtaBand from '${layout('CtaBand.astro')}';
import * as shellActions from '${shellActionsPath}';
import Footer from '${layout('Footer.astro')}';
import BackToTop from '${layout('BackToTop.astro')}';
---
<html lang="en"><head><title>static</title></head><body>
<div data-case="skip"><SkipLink /></div>
<div data-case="band-en"><CtaBand /></div>
<div data-case="band-no"><CtaBand cvLang="no" /></div>
<div data-case="band-home-en"><CtaBand actions={shellActions.homeBandActions?.('en')} /></div>
<div data-case="band-home-no"><CtaBand cvLang="no" actions={shellActions.homeBandActions?.('no')} /></div>
<div data-case="footer"><Footer /></div>
<div data-case="top"><BackToTop /></div>
<div data-case="top-no"><BackToTop lang="en" /></div>
</body></html>
`;

beforeAll(() => {
  out = mkdtempSync(join(tmpdir(), 'fjord-static-'));
  const src = join(out, 'fixture');
  mkdirSync(src);
  writeFileSync(join(src, 'StaticPage.astro'), fixture);
  const config = join(src, 'astro.static.config.mjs');
  writeFileSync(
    config,
    `import base from ${JSON.stringify(pathToFileURL(join(repo, 'astro.config.mjs')).href)};
export default {
  ...base,
  root: ${JSON.stringify(repo)},
  outDir: ${JSON.stringify(join(out, 'dist'))},
  integrations: [
    ...(base.integrations ?? []),
    {
      name: 'static-fixture',
      hooks: {
        'astro:config:setup': ({ injectRoute }) =>
          injectRoute({
            pattern: '/static-fixture',
            entrypoint: ${JSON.stringify(pathToFileURL(join(src, 'StaticPage.astro')).href)},
          }),
      },
    },
  ],
};
`,
  );
  const astro = join(repo, 'node_modules/astro/bin/astro.mjs');
  const build = spawnSync(process.execPath, [astro, 'build', '--config', relative(repo, config)], {
    cwd: repo,
    encoding: 'utf8',
    env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' },
  });
  if (build.status !== 0)
    throw new Error(`astro build failed:
${build.stdout}
${build.stderr}`);
  page = readFileSync(join(out, 'dist', 'static-fixture.html'), 'utf8');
  const assets = join(out, 'dist', '_astro');
  const sheets = existsSync(assets)
    ? readdirSync(assets)
        .filter((f) => f.endsWith('.css'))
        .map((f) => readFileSync(join(assets, f), 'utf8'))
    : [];
  const inline = [...page.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1] ?? '');
  css = [...sheets, ...inline].join('\n');
}, 180_000);

afterAll(() => {
  if (out) rmSync(out, { recursive: true, force: true });
});

/** The markup of one fixture case. */
function made(name: string): string {
  const m = page.match(
    new RegExp(`<div data-case="${name}">([\\s\\S]*?)</div>\\s*(?=<div data-case|</body>)`),
  );
  if (!m) throw new Error(`fixture case ${name} is missing from the built page`);
  return m[1] ?? '';
}
const anchors = (html: string) => [...html.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/g)].map((m) => m[0]);
const classesOf = (tag: string) => (tag.match(/\bclass="([^"]*)"/)?.[1] ?? '').split(/\s+/);
const text = (html: string) =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#(?:x2019|8217);/gi, '’')
    .replace(/\s+/g, ' ');
const anchorTo = (html: string, href: string) =>
  anchors(html).find((a) => a.includes(`href="${href}"`));
/** The bodies of every built rule whose selector starts with the class, in source order. */
const bodiesOf = (cls: string) =>
  [...css.matchAll(new RegExp(`\\.${cls}(?![-\\w])[^{},]*\\{([^}]*)\\}`, 'g'))].map(
    (m) => m[1] ?? '',
  );

describe('SkipLink (AC-13)', () => {
  it('is an <a href="#main"> reading "Skip to content"', () => {
    const [link, ...rest] = anchors(made('skip'));
    expect(rest).toEqual([]);
    expect(link).toMatch(/^<a\b[^>]*\bhref="#main"/);
    expect(text(link ?? '')).toContain('Skip to content');
  });
});

describe('CtaBand (AC-20)', () => {
  it('shows the heading as h2 and the hiring line', () => {
    const html = made('band-en');
    const h2 = html.match(/<h2\b[^>]*>([\s\S]*?)<\/h2>/)?.[1] ?? '';
    expect(text(h2)).toContain('Let’s build something good together.');
    expect(text(html)).toContain(
      'If your team is hiring in the Oslo area, I’d like to hear about it.',
    );
  });

  // release-1 AC-06, D-10: the rings are an image file, asked for when the band comes near.
  it('shows the contours from the lazy image, mirrored, with no contour paths in the HTML', () => {
    const html = made('band-en');
    const wrap = html.match(/<div\b[^>]*class="[^"]*\bcontours\b[^"]*"[^>]*>/)?.[0] ?? '';
    expect(wrap).toMatch(/data-variant="ridge"/);
    expect(wrap).toMatch(/contours--spruce/);
    expect(wrap).toMatch(/contours--bottom-right/);
    expect(wrap).toMatch(/aria-hidden="true"/);
    const layer = html.match(/<div\b[^>]*class="[^"]*\bcontours__layer\b[^"]*"[^>]*>\s*(<[^>]+>)/);
    const img = layer?.[1] ?? '';
    expect(img).toMatch(/^<img\b/);
    expect(img).toMatch(/\ssrc="\/img\/contours-ridge-spruce\.svg"/);
    expect(img).toMatch(/\sloading="lazy"/);
    expect(img).toMatch(/\salt=""/);
    // One file serves both places: the band mirrors it to its bottom right corner.
    expect(classesOf(img)).toContain('contours__image--flip-x');
    expect(classesOf(img)).not.toContain('contours__image--flip-y');
    expect(html.match(/contours-ridge-spruce\.svg/g)).toHaveLength(1);
    expect(html).not.toContain('contours__group');
    expect(html).not.toMatch(/<svg\b[^>]*viewBox="0 0 85 55"/);
  });

  it('has exactly one primary button: "Get in touch" to the contact target', () => {
    const html = made('band-en');
    const primaries = anchors(html).filter((a) => classesOf(a).includes('fj-btn--primary'));
    expect(primaries).toHaveLength(1);
    expect(primaries[0]).toContain(`href="${contact.links.contact}"`);
    expect(text(primaries[0] ?? '')).toContain('Get in touch');
  });

  it('"Download CV" is secondary and downloads the English PDF by default', () => {
    const cv = anchorTo(made('band-en'), contact.links.cvEn) ?? '';
    expect(cv).toMatch(/\sdownload\b/);
    expect(classesOf(cv)).toContain('fj-btn--secondary');
    expect(text(cv)).toContain('Download CV');
    expect(made('band-en')).not.toContain(contact.links.cvNo);
  });

  it('"Download CV" saves the PDF of cvLang under its download name (AC-20)', () => {
    for (const [name, lang] of [
      ['band-en', 'en'],
      ['band-no', 'no'],
    ] as const) {
      const cv = anchorTo(made(name), cvPdf[lang].href) ?? '';
      expect(cv).toContain(`download="${cvPdf[lang].downloadName}"`);
    }
  });

  it('with cvLang="no" "Download CV" downloads the Norwegian PDF', () => {
    const cv = anchorTo(made('band-no'), contact.links.cvNo) ?? '';
    expect(cv).toMatch(/\sdownload\b/);
    expect(text(cv)).toContain('Download CV');
    expect(made('band-no')).not.toContain(contact.links.cvEn);
  });
});

// AC-40 (T8): the band's actions come from a page option; the home page's pair repeats no
// contact action. The pairs are the ready ones of shell-actions.ts (ADR-0002); "Download CV"
// follows cvLang in both.
describe('CtaBand actions (AC-40, ADR-0002)', () => {
  const homeVcf = '/alexander-ponomarenko.vcf';

  it.each([
    ['band-home-en', contact.links.cvEn, contact.links.cvNo],
    ['band-home-no', contact.links.cvNo, contact.links.cvEn],
  ])(
    'the home pair in %s is "Add to contacts" and "Download CV", both secondary',
    (name, cvHref, otherCv) => {
      const html = made(name);
      const [save, cv, ...rest] = anchors(html);
      expect(rest).toEqual([]);
      expect(save).toContain(`href="${homeVcf}"`);
      expect(text(save ?? '')).toContain('Add to contacts');
      expect(save).toContain(
        '<span class="fj-btn__label">Add to contacts<span class="fj-btn__meta" aria-hidden="true">.vcf</span></span>',
      );
      expect(save).toContain('(vCard file)');
      expect(save).toMatch(/\sdownload\b/);
      expect(cv).toContain(`href="${cvHref}"`);
      expect(text(cv ?? '')).toContain('Download CV');
      expect(cv).toMatch(/\sdownload\b/);
      for (const a of [save ?? '', cv ?? '']) {
        expect(classesOf(a)).toContain('fj-btn--secondary');
        expect(classesOf(a)).not.toContain('fj-btn--primary');
      }
      expect(text(html)).not.toContain('Get in touch');
      expect(html).not.toContain(otherCv);
      expect(html).not.toContain('fj-btn--primary');
    },
  );

  it('the default pair keeps "Get in touch" primary before "Download CV", for both languages', () => {
    for (const [name, cvHref] of [
      ['band-en', contact.links.cvEn],
      ['band-no', contact.links.cvNo],
    ] as const) {
      const [first, second, ...rest] = anchors(made(name));
      expect(rest).toEqual([]);
      expect(first).toContain(`href="${contact.links.contact}"`);
      expect(classesOf(first ?? '')).toContain('fj-btn--primary');
      expect(second).toContain(`href="${cvHref}"`);
      expect(classesOf(second ?? '')).toContain('fj-btn--secondary');
    }
    expect(made('band-en')).not.toContain(homeVcf);
  });
});

// AC-41, D-13 (T8): the band's contours follow scrolling. Only the band's own rules are read: other
// components keep their own, and the hero loops are not the band's.
describe('CtaBand style (AC-41, D-13)', () => {
  type Block = { selector: string; body: string; context: string };
  /** Every style rule of the built CSS with the at-rule preludes around it, spaces removed. */
  const blocks = (): Block[] => {
    const found: Block[] = [];
    const stack: string[] = [];
    let start = 0;
    for (let i = 0; i < css.length; i++) {
      const ch = css[i];
      if (ch === '{') {
        stack.push(css.slice(start, i).trim());
        start = i + 1;
      } else if (ch === '}') {
        const open = stack.pop() ?? '';
        const body = css.slice(start, i);
        if (!open.startsWith('@') && !body.includes('{')) {
          found.push({
            selector: open,
            body,
            context: stack.join('|').replace(/\s+/g, ''),
          });
        }
        start = i + 1;
      } else if (ch === ';' && css.slice(start, i).trim().startsWith('@')) {
        start = i + 1;
      }
    }
    return found;
  };
  const bandBlocks = () => blocks().filter((b) => /\.fj-band(?![-\w])/.test(b.selector));
  const timed = (b: Block) => /(?<![-\w])animation(?:-name)?\s*:/.test(b.body);

  it('gives the band the design top margin from the section space token', () => {
    const own = bodiesOf('fj-band').join(';');
    expect(own).toMatch(/margin(?:-top|-block-start)?\s*:\s*var\(--fjord-space-section\)/);
  });

  it('declares the scroll-driven animation in the band, with a view timeline (view() or the band named one)', () => {
    const driven = bandBlocks().filter((b) => b.body.includes('animation-timeline'));
    expect(driven.length).toBeGreaterThan(0);
    const compact = (b: Block) => b.body.replace(/\s+/g, '');
    const named = bandBlocks().some((b) => /(?<![-\w])view-timeline:--[\w-]+/.test(compact(b)));
    for (const b of driven)
      expect(compact(b)).toMatch(
        named ? /animation-timeline:(view\(|--[\w-]+)/ : /animation-timeline:view\(/,
      );
    expect(bandBlocks().some((b) => timed(b))).toBe(true);
  });

  it('declares it only inside @supports (animation-timeline: view()) and prefers-reduced-motion: no-preference', () => {
    const own = bandBlocks().filter((b) => timed(b) || b.body.includes('animation-timeline'));
    expect(own.length).toBeGreaterThan(0);
    for (const b of own) {
      expect(b.context, b.selector).toContain('@supports');
      expect(b.context, b.selector).toMatch(/animation-timeline:view\(\)/);
      expect(b.context, b.selector).toContain('(prefers-reduced-motion:no-preference)');
    }
  });

  it('has no time-based animation, loop or transition in the band', () => {
    const all = bandBlocks()
      .map((b) => b.body)
      .join(';');
    expect(all).not.toMatch(/infinite/);
    expect(all).not.toMatch(/animation-duration\s*:\s*(?!auto)/);
    expect(all).not.toMatch(/animation\s*:[^;]*(?<![-\w.])\d*\.?\d+m?s\b/);
    expect(all).not.toMatch(/--fjord-duration/);
    expect(all).not.toMatch(/(?<![-\w])transition/);
  });

  it('has no script', () => {
    expect(readFileSync(join(layoutDir, 'CtaBand.astro'), 'utf8')).not.toMatch(/<script/i);
  });
});

describe('Footer (AC-14)', () => {
  const html = () => made('footer');

  it('shows the slogan', () => {
    expect(text(html())).toMatch(/Good products\s+are built together\./);
  });

  it('links email and phone from contact.ts', () => {
    expect(anchorTo(html(), `mailto:${contact.email}`)).toBeDefined();
    expect(anchorTo(html(), `tel:${contact.phone.replace(/\s+/g, '')}`)).toBeDefined();
    expect(text(html())).toContain(contact.email);
    expect(text(html())).toContain(contact.phone);
  });

  it('links LinkedIn and GitHub in a new tab with rel="noopener noreferrer" and a hidden hint, without an icon (home D-09)', () => {
    for (const url of [contact.linkedin, contact.github]) {
      const open = anchorTo(html(), url) ?? '';
      expect(open, url).not.toBe('');
      const rest = html().slice(html().indexOf(open));
      const full = rest.slice(0, rest.indexOf('</a>'));
      const rel = (open.match(/\brel="([^"]*)"/)?.[1] ?? '').split(/\s+/);
      expect(rel).toEqual(expect.arrayContaining(['noopener', 'noreferrer']));
      expect(open).toMatch(/\starget="_blank"/);
      expect(full).toMatch(
        /<span\b[^>]*class="fj-footer__hint"[^>]*>\s*\(opens in a new tab\)\s*<\/span>/,
      );
      expect(full).not.toMatch(/<svg\b/);
    }
  });

  it('keeps the mail and the phone link of the footer in the tab (home D-09)', () => {
    for (const href of [`mailto:${contact.email}`, `tel:${contact.phone.replace(/\s+/g, '')}`]) {
      const a = anchorTo(html(), href) ?? '';
      expect(a, href).not.toBe('');
      expect(a).not.toMatch(/\starget=/);
    }
  });

  it('shows "Based in", the residence as lang="no" and the coordinates at two decimals', () => {
    expect(text(html())).toContain('Based in');
    expect(html()).toMatch(
      new RegExp(`<[a-z]+\\b[^>]*\\blang="no"[^>]*>\\s*${contact.residence.name}\\s*</`),
    );
    const { lat, lon } = contact.residence;
    expect(text(html())).toContain(`${lat.toFixed(2)}° N, ${lon.toFixed(2)}° E`);
    expect(text(html())).not.toMatch(/\d+\.\d{3,}°/);
  });

  it('shows the copyright with the build-time year and the name', () => {
    expect(text(html())).toContain(`© ${new Date().getFullYear()} Alexander Ponomarenko`);
  });

  it('shows "Sist oppdatert" as lang="no" with a <time> of the last-updated date', () => {
    expect(html()).toMatch(/\blang="no"[^>]*>[^<]*Sist oppdatert/);
    expect(html()).toMatch(
      new RegExp(`<time\\b[^>]*\\bdatetime="${contact.lastUpdated}"[^>]*>[^<]*\\d`),
    );
  });
});

describe('SkipLink and footer links (design form)', () => {
  it('hides the skip link above the page with top, as the design does, and shows it on focus', () => {
    const [base = ''] = bodiesOf('skip-link');
    expect(base).toMatch(/top:\s*calc\([^;]*var\(--fjord-space-16\)[^;]*\)/);
    expect(bodiesOf('skip-link').join(';')).not.toMatch(/(?<![-\w])translate\s*:/);
    const shown = css.match(/\.skip-link[^{},]*:focus-visible\{([^}]*)\}/)?.[1] ?? '';
    expect(shown).toMatch(/top:\s*var\(--fjord-space-3\)/);
    expect(shown).toMatch(/outline:[^;]*var\(--fjord-color-focus-ring\)/);
  });

  it('offsets the footer link underline by 0.2em, as the design does', () => {
    const hover = css.match(/\.fj-footer__col[^{},]*a[^{},]*:hover\{([^}]*)\}/)?.[1] ?? '';
    expect(hover).toMatch(/text-underline-offset:\s*0?\.2em/);
  });
});

// Body text widths use the em measure tokens. The two semibold headings use the design's ch: the
// measure tokens are sized from the regular "0", which is narrower than the semibold one, and
// made the band title break into three lines where the design has two (Owner, design match).
describe('measures (design widths)', () => {
  it('limits the band title to the 16ch of the design and balances its lines', () => {
    expect(bodiesOf('fj-band__title')[0]).toMatch(/max-width:\s*16ch/);
    expect(bodiesOf('fj-band__title')[0]).toMatch(/text-wrap:\s*balance/);
  });

  it('limits the band body to the narrow measure and pulls it up as the design does', () => {
    const [body = ''] = bodiesOf('fj-band__body');
    expect(body).toMatch(/max-width:\s*var\(--fjord-measure-narrow\)/);
    expect(body).toMatch(/margin:\s*calc\([^;)]*var\(--fjord-space-2\)[^;]*\)\s*0\s*0/);
    expect(bodiesOf('fj-band__in')[0]).toMatch(/gap:\s*var\(--fjord-space-7\)/);
    expect(bodiesOf('fj-band__actions')[0]).not.toMatch(/margin/);
  });

  it('limits the footer slogan to the 18ch of the design', () => {
    expect(bodiesOf('fj-footer__slogan')[0]).toMatch(/max-width:\s*18ch/);
  });

  it('writes no body text width in ch', () => {
    expect(bodiesOf('fj-band__body').join(';')).not.toMatch(/\dch\b/);
  });
});

describe('Footer layout (design .fj-footer grid)', () => {
  it('is the 4 / 8 / 12-column grid of the design', () => {
    const [box = ''] = bodiesOf('fj-footer__in');
    expect(box).toMatch(/display:\s*grid/);
    expect(box).toMatch(
      /grid-template-columns:\s*repeat\(var\(--fjord-grid-columns\),\s*minmax\(0,\s*1fr\)\)/,
    );
  });

  it('spans the slogan and base line over the whole grid and each column over four tracks', () => {
    expect(bodiesOf('fj-footer__slogan')[0]).toMatch(/grid-column:\s*1\s*\/\s*-1/);
    expect(bodiesOf('fj-footer__base')[0]).toMatch(/grid-column:\s*1\s*\/\s*-1/);
    expect(bodiesOf('fj-footer__col')[0]).toMatch(/grid-column:\s*span 4/);
  });

  it('gives the slogan and each column three of twelve tracks from 1024', () => {
    expect(css).toMatch(
      /min-width:\s*1024px[^{]*\{[^@]*\.fj-footer__slogan[^{]*\{[^}]*grid-column:\s*span 3/,
    );
    expect(bodiesOf('fj-footer__col').join(';')).toMatch(/grid-column:\s*span 3/);
    expect(bodiesOf('fj-footer__col').join(';')).not.toMatch(/flex-basis|flex:\s*\d/);
  });
});

describe('sources hold no literal contact value', () => {
  const values = [
    contact.email,
    contact.phone,
    contact.linkedin,
    contact.github,
    contact.residence.name,
    contact.links.cvEn,
    contact.links.cvNo,
    contact.lastUpdated,
    String(contact.residence.lat),
    String(contact.residence.lon),
  ];
  for (const file of ['SkipLink.astro', 'CtaBand.astro', 'Footer.astro']) {
    it(`${file} reads contact.ts instead`, () => {
      const path = join(layoutDir, file);
      expect(existsSync(path), `${file} exists`).toBe(true);
      const source = readFileSync(path, 'utf8');
      for (const v of values) expect(source, v).not.toContain(v);
    });
  }
});

// AC-21 (T31): BackToTop is a plain link to the top that works with scripts off.
describe('BackToTop (AC-21)', () => {
  it('is one link named "Back to top" to #top', () => {
    const [link, ...rest] = anchors(made('top'));
    expect(rest).toEqual([]);
    expect(link).toMatch(/^<a\b[^>]*\bhref="#top"/);
    expect(text(link ?? '')).toContain('Back to top');
  });

  it('hides its arrow icon from assistive technology and carries no script', () => {
    const html = made('top');
    expect(html).toMatch(/<svg\b[^>]*aria-hidden="true"/);
    expect(html).not.toMatch(/<script\b/);
  });

  it('points at an id no element has, so the browser scrolls to the top and resets the focus start', () => {
    expect(page).not.toMatch(/\sid="top"/);
  });
});
