import { randomBytes } from 'node:crypto';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { checkBudgets } from './check-budgets.ts';

// Spec §6 budgets (AC-06, sad QG-2): bootstrap ≤ 1 KB unminified, initial JS ≤ 50 KB gzip per
// page, exactly 2 font preloads ≤ 80 KB combined, every shipped font ≤ 50 KB (home sad §8 Fonts:
// a variable file holds every weight of its family).

const KB = 1024;
const dirs: string[] = [];
afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

/** A fixture site: dist/ with pages, scripts and fonts, plus the bootstrap source. */
function fixture(files: Record<string, string | Buffer>) {
  const root = mkdtempSync(join(tmpdir(), 'fjord-budgets-'));
  dirs.push(root);
  for (const [path, content] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), content);
  }
  return {
    bootstrap: join(root, 'theme-bootstrap.js'),
    dist: join(root, 'dist'),
  };
}

const PRELOADS =
  '<link rel="preload" href="/fonts/a-400.woff2" as="font" type="font/woff2" crossorigin>' +
  '<link rel="preload" href="/fonts/a-600.woff2" as="font" type="font/woff2" crossorigin>';
const page = (head = PRELOADS, body = '') =>
  `<!doctype html><html><head>${head}</head><body>${body}</body></html>`;

/** Incompressible bytes, so gzip size ≈ raw size. */
const bytes = (size: number) => randomBytes(size);

/** The four portrait files of the home hero (AC-02), each ≤ 40 KB. */
const PORTRAITS = [
  'img/portrait-v1-340.avif',
  'img/portrait-v1-340.webp',
  'img/portrait-v1-680.avif',
  'img/portrait-v1-680.webp',
];
const portraits = (): Record<string, Buffer> =>
  Object.fromEntries(PORTRAITS.map((file) => [`dist/${file}`, bytes(20 * KB)]));

const healthy = (): Record<string, string | Buffer> => ({
  'theme-bootstrap.js': 'var t=1',
  'dist/index.html': page(),
  'dist/fonts/a-400.woff2': bytes(25 * KB),
  'dist/fonts/a-600.woff2': bytes(26 * KB),
  'dist/fonts/a-700.woff2': bytes(27 * KB),
  ...portraits(),
});

describe('checkBudgets', () => {
  it('passes a site within every budget and reports the measured sizes', () => {
    const { failures, report } = checkBudgets(fixture(healthy()));
    expect(failures).toEqual([]);
    expect(report.join('\n')).toMatch(/theme-bootstrap\.js.*7 B/);
    expect(report.join('\n')).toMatch(/index\.html.*preloads 2/);
  });

  it('fails a bootstrap over 1 KB, naming the file and its size', () => {
    const { failures } = checkBudgets(
      fixture({ ...healthy(), 'theme-bootstrap.js': 'x'.repeat(1025) }),
    );
    expect(failures).toContainEqual(expect.stringMatching(/theme-bootstrap\.js.*1025 B.*1024 B/));
  });

  it('fails a page whose initial JS exceeds 50 KB gzip, naming the page and size', () => {
    const { failures } = checkBudgets(
      fixture({
        ...healthy(),
        'dist/index.html': page(
          `${PRELOADS}<script type="module" src="/_astro/a.js"></script>`,
          '<script type="module" src="/_astro/b.js"></script>',
        ),
        'dist/_astro/a.js': bytes(30 * KB),
        'dist/_astro/b.js': bytes(25 * KB),
      }),
    );
    expect(failures).toContainEqual(
      expect.stringMatching(/index\.html.*initial JS.*KB gzip.*50 KB/),
    );
  });

  it.each([
    ['one preload', '<link rel="preload" href="/fonts/a-400.woff2" as="font" crossorigin>'],
    [
      'three preloads',
      `${PRELOADS}<link rel="preload" href="/fonts/a-700.woff2" as="font" crossorigin>`,
    ],
  ])('fails a page with %s, naming the page', (_, head) => {
    const { failures } = checkBudgets(fixture({ ...healthy(), 'dist/404.html': page(head) }));
    expect(failures).toContainEqual(
      expect.stringMatching(/404\.html.*preloads \d font.*exactly 2/),
    );
  });

  it('fails two preloads over 80 KB combined, naming the page and the sizes', () => {
    const { failures } = checkBudgets(
      fixture({
        ...healthy(),
        'dist/fonts/a-400.woff2': bytes(40 * KB),
        'dist/fonts/a-600.woff2': bytes(41 * KB),
      }),
    );
    expect(failures).toContainEqual(
      expect.stringMatching(/index\.html.*preloaded fonts.*81\.0 KB.*80 KB/),
    );
  });

  it('fails any shipped font over 50 KB, naming the file and size', () => {
    const { failures } = checkBudgets(
      fixture({ ...healthy(), 'dist/fonts/a-700.woff2': bytes(51 * KB) }),
    );
    expect(failures).toContainEqual(expect.stringMatching(/a-700\.woff2.*51\.0 KB.*50 KB/));
  });

  // Home AC-02 / backlog B-09: a script file more than one page loads is a Shell script (5 KB gzip
  // together); a file only one page loads is that page's own (home 10 KB gzip).
  const script = (src: string) => `<script type="module" src="/_astro/${src}.js"></script>`;
  const twoPages = (shell: Record<string, number>, own: Record<string, number> = {}) => {
    const shellTags = Object.keys(shell).map(script).join('');
    const ownTags = Object.keys(own).map(script).join('');
    return fixture({
      ...healthy(),
      'dist/index.html': page(PRELOADS + shellTags, ownTags),
      'dist/404.html': page(PRELOADS + shellTags),
      ...Object.fromEntries(
        Object.entries({ ...shell, ...own }).map(([name, size]) => [
          `dist/_astro/${name}.js`,
          bytes(size * KB),
        ]),
      ),
    });
  };

  it('fails Shell scripts that two pages load and that exceed 5 KB gzip together, naming file and size', () => {
    const { failures } = checkBudgets(twoPages({ menu: 3, toggle: 3 }));
    expect(failures).toContainEqual(
      expect.stringMatching(/index\.html.*Shell scripts.*6\.\d KB gzip.*5 KB/),
    );
  });

  it('passes Shell scripts of 4 KB gzip together and reports Shell and page scripts apart', () => {
    const { failures, report } = checkBudgets(twoPages({ menu: 2, toggle: 2 }, { home: 9 }));
    expect(failures).toEqual([]);
    expect(report.join('\n')).toMatch(
      /index\.html.*Shell scripts 4\.\d KB gzip.*page scripts 9\.\d KB gzip/,
    );
  });

  it('counts a script only one page loads as that page’s own, not against the 5 KB Shell limit', () => {
    const { failures } = checkBudgets(twoPages({ menu: 2 }, { home: 8 }));
    expect(failures).toEqual([]);
  });

  it('fails a page whose own scripts exceed 10 KB gzip, naming the page and size', () => {
    const { failures } = checkBudgets(twoPages({ menu: 2 }, { home: 11 }));
    expect(failures).toContainEqual(
      expect.stringMatching(/index\.html.*page scripts.*11\.\d KB gzip.*10 KB/),
    );
    expect(failures.some((f) => /Shell scripts/.test(f))).toBe(false);
  });

  it('fails a page whose Shell and own scripts together exceed 50 KB gzip', () => {
    const { failures } = checkBudgets(
      twoPages({ menu: 3, a: 1 }, { b: 10, c: 10, d: 10, e: 10, f: 10 }),
    );
    expect(failures).toContainEqual(
      expect.stringMatching(/index\.html.*initial JS.*5\d\.\d KB gzip.*50 KB/),
    );
  });

  it.each(PORTRAITS)('fails a missing portrait file, naming it: %s', (file) => {
    const files = Object.entries(healthy()).filter(([path]) => path !== `dist/${file}`);
    const { failures } = checkBudgets(fixture(Object.fromEntries(files)));
    expect(failures).toContainEqual(
      expect.stringMatching(new RegExp(`${file.replace(/[.]/g, '\\.')}.*missing`)),
    );
  });

  it('fails a portrait file over 40 KB, naming the file and size', () => {
    const { failures } = checkBudgets(
      fixture({ ...healthy(), 'dist/img/portrait-v1-680.webp': bytes(41 * KB) }),
    );
    expect(failures).toContainEqual(
      expect.stringMatching(/portrait-v1-680\.webp.*41\.0 KB.*40 KB/),
    );
  });

  it('passes portrait files of exactly 40 KB and reports their sizes', () => {
    const { failures, report } = checkBudgets(
      fixture({ ...healthy(), 'dist/img/portrait-v1-680.avif': bytes(40 * KB) }),
    );
    expect(failures).toEqual([]);
    expect(report.join('\n')).toMatch(/portrait-v1-680\.avif.*40\.0 KB/);
  });

  it('fails 404.html over 20 KB gzip, naming the file and size', () => {
    const { failures } = checkBudgets(
      fixture({
        ...healthy(),
        'dist/404.html': page(PRELOADS, 'x'.repeat(21 * KB) + bytes(21 * KB).toString('base64')),
      }),
    );
    expect(failures).toContainEqual(expect.stringMatching(/404\.html.*gzip.*2\d\.\d KB.*20 KB/));
  });

  it('passes a 404.html under 20 KB gzip and reports it', () => {
    const { failures, report } = checkBudgets(fixture({ ...healthy(), 'dist/404.html': page() }));
    expect(failures).toEqual([]);
    expect(report.join('\n')).toMatch(/404\.html.*weight.*KB gzip/);
  });
});
