import { randomBytes } from 'node:crypto';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { checkBudgets } from './check-budgets.ts';

// Spec §6 budgets (AC-06, sad QG-2): bootstrap ≤ 1 KB unminified, initial JS ≤ 50 KB gzip per
// page, exactly 2 font preloads ≤ 60 KB combined, every shipped font ≤ 30 KB.

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

const healthy = (): Record<string, string | Buffer> => ({
  'theme-bootstrap.js': 'var t=1',
  'dist/index.html': page(),
  'dist/fonts/a-400.woff2': bytes(25 * KB),
  'dist/fonts/a-600.woff2': bytes(26 * KB),
  'dist/fonts/a-700.woff2': bytes(27 * KB),
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

  it('fails two preloads over 60 KB combined, naming the page and the sizes', () => {
    const { failures } = checkBudgets(
      fixture({
        ...healthy(),
        'dist/fonts/a-400.woff2': bytes(29 * KB),
        'dist/fonts/a-600.woff2': bytes(32 * KB),
      }),
    );
    expect(failures).toContainEqual(
      expect.stringMatching(/index\.html.*preloaded fonts.*61\.0 KB.*60 KB/),
    );
  });

  it('fails any shipped font over 30 KB, naming the file and size', () => {
    const { failures } = checkBudgets(
      fixture({ ...healthy(), 'dist/fonts/a-700.woff2': bytes(31 * KB) }),
    );
    expect(failures).toContainEqual(expect.stringMatching(/a-700\.woff2.*31\.0 KB.*30 KB/));
  });
});
