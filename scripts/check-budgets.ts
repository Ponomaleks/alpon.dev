// Build-output budgets (fjord-foundation spec §6, sad QG-2), run after `npm run build`:
//   - the render-blocking theme bootstrap ≤ 1 KB unminified;
//   - initial JS per page ≤ 50 KB gzip (inline scripts + same-origin <script src> + modulepreload);
//   - exactly 2 font preloads per page, ≤ 60 KB combined;
//   - every shipped font file ≤ 30 KB.
// Fails naming the file or page and the measured size; prints every measured size for the CI log.
//
// Run from the repo root: node scripts/check-budgets.ts

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { gzipSync } from 'node:zlib';

const KB = 1024;
export const BUDGETS = {
  bootstrapBytes: 1 * KB,
  initialJsGzip: 50 * KB,
  preloadCount: 2,
  preloadBytes: 60 * KB,
  fontBytes: 30 * KB,
};

export interface BudgetInput {
  /** Path of src/scripts/theme-bootstrap.js. */
  bootstrap: string;
  /** The build output directory. */
  dist: string;
}

const kb = (size: number) => `${(size / KB).toFixed(1)} KB`;

function files(dir: string, extension: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true, recursive: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(extension))
    .map((entry) => join(entry.parentPath, entry.name));
}

const attr = (tag: string, name: string) =>
  tag
    .match(new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'))
    ?.slice(1)
    .find(Boolean);

/** A same-origin URL path → its file in dist, or null for other origins. */
function local(dist: string, href: string | undefined): string | null {
  if (!href || /^[a-z]+:|^\/\//i.test(href)) return null;
  const path = join(dist, decodeURIComponent(href.split(/[?#]/)[0] ?? ''));
  return existsSync(path) ? path : null;
}

export function checkBudgets({ bootstrap, dist }: BudgetInput): {
  failures: string[];
  report: string[];
} {
  const failures: string[] = [];
  const report: string[] = [];
  const name = (path: string) => relative(dist, path).split(sep).join('/');

  const bootstrapSize = statSync(bootstrap).size;
  report.push(`theme-bootstrap.js: ${bootstrapSize} B (≤ ${BUDGETS.bootstrapBytes} B)`);
  if (bootstrapSize > BUDGETS.bootstrapBytes)
    failures.push(
      `theme-bootstrap.js is ${bootstrapSize} B, over the ${BUDGETS.bootstrapBytes} B budget`,
    );

  for (const page of files(dist, '.html')) {
    const html = readFileSync(page, 'utf8');
    const tags = [...html.matchAll(/<(script|link)\b[^>]*>/gi)].map((m) => m[0]);

    // Initial JS: inline script bodies plus every same-origin script and modulepreload.
    const inline = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
      .filter(([, attrs = '']) => !/\ssrc\s*=/i.test(attrs))
      .reduce((sum, [, , body = '']) => sum + gzipSync(body).length, 0);
    const external = new Set(
      tags
        .filter((tag) => /^<script/i.test(tag) || /rel\s*=\s*["']?modulepreload/i.test(tag))
        .map((tag) => local(dist, attr(tag, 'src') ?? attr(tag, 'href')))
        .filter((path): path is string => path !== null),
    );
    const js =
      inline + [...external].reduce((sum, path) => sum + gzipSync(readFileSync(path)).length, 0);

    const preloads = tags.filter(
      (tag) => /rel\s*=\s*["']?preload/i.test(tag) && /as\s*=\s*["']?font/i.test(tag),
    );
    const preloadSize = preloads.reduce((sum, tag) => {
      const path = local(dist, attr(tag, 'href'));
      return sum + (path ? statSync(path).size : 0);
    }, 0);

    report.push(
      `${name(page)}: initial JS ${kb(js)} gzip, preloads ${preloads.length} font(s) ${kb(preloadSize)}`,
    );
    if (js > BUDGETS.initialJsGzip)
      failures.push(`${name(page)}: initial JS is ${kb(js)} gzip, over the 50 KB budget`);
    if (preloads.length !== BUDGETS.preloadCount)
      failures.push(`${name(page)}: preloads ${preloads.length} font(s), expected exactly 2`);
    else if (preloadSize > BUDGETS.preloadBytes)
      failures.push(
        `${name(page)}: preloaded fonts are ${kb(preloadSize)} combined, over the 60 KB budget`,
      );
  }

  for (const font of files(join(dist, 'fonts'), '.woff2')) {
    const size = statSync(font).size;
    report.push(`${name(font)}: ${kb(size)}`);
    if (size > BUDGETS.fontBytes)
      failures.push(`${name(font)} is ${kb(size)}, over the 30 KB budget`);
  }

  return { failures, report };
}

if (import.meta.main) {
  const { failures, report } = checkBudgets({
    bootstrap: 'src/scripts/theme-bootstrap.js',
    dist: 'dist',
  });
  console.log(report.join('\n'));
  if (failures.length > 0) {
    console.error(`budget check failed:\n  ${failures.join('\n  ')}`);
    process.exit(1);
  }
  console.log('budgets: all within limits');
}
