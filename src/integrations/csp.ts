// The CSP integration (fjord-foundation ADR-0002). After `astro build` it audits the inline code
// of every built page, then writes the theme bootstrap's sha256 into the single
// Content-Security-Policy line of dist/_headers. It fails the build, before anything can be
// deployed, when:
//   1. a page has an inline <script> other than exactly one copy of the bootstrap
//      (non-executable application/ld+json data blocks are allowed, type compared case-insensitively);
//   2. a page has an inline <style>, a style="…" attribute or an on*="…" handler attribute;
//   3. the hash placeholder is missing from the policy line, or left anywhere after substitution;
//   4. dist/_headers has more than one Content-Security-Policy line (or none).
// It also refuses a policy that grants 'unsafe-inline' or 'unsafe-eval'.

import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AstroIntegration } from 'astro';

export const HASH_PLACEHOLDER = '{{THEME_BOOTSTRAP_HASH}}';
const BOOTSTRAP_SOURCE = 'src/scripts/theme-bootstrap.js';
const CSP_LINE = /^\s*Content-Security-Policy:.*$/gim;

export interface BuiltPage {
  /** Path relative to the output directory, e.g. `cv/en.html`. */
  name: string;
  html: string;
}

export class CspError extends Error {
  constructor(problems: string[]) {
    super(`CSP audit failed (ADR-0002):\n  ${problems.join('\n  ')}`);
    this.name = 'CspError';
  }
}

const sha256 = (source: string) =>
  `'sha256-${createHash('sha256').update(source, 'utf8').digest('base64')}'`;

const SCRIPT = /<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi;
const typeOf = (attrs: string) =>
  attrs
    .match(/\btype\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i)
    ?.slice(1)
    .find((v) => v !== undefined);
const hasSrc = (attrs: string) => /\bsrc\s*=/i.test(attrs);

function auditPage({ name, html }: BuiltPage, bootstrapHash: string): string[] {
  const problems: string[] = [];
  let bootstrapCopies = 0;

  for (const [, attrs = '', body = ''] of html.matchAll(SCRIPT)) {
    if (hasSrc(attrs)) continue;
    if (typeOf(attrs)?.trim().toLowerCase() === 'application/ld+json') continue;
    if (sha256(body) === bootstrapHash && bootstrapCopies++ === 0) continue;
    const kind =
      sha256(body) === bootstrapHash
        ? 'a second copy of the bootstrap'
        : `"${body.trim().slice(0, 40)}"`;
    problems.push(
      `${name}: inline script (type ${typeOf(attrs) ?? 'none'}) that is not the bootstrap: ${kind}`,
    );
  }

  // Script bodies are text, not markup; drop them before scanning tags.
  const markup = html.replace(SCRIPT, (_, attrs: string) => `<script${attrs}></script>`);
  if (/<style\b/i.test(markup)) problems.push(`${name}: inline <style> element`);
  for (const [tag] of markup.matchAll(/<[a-z][^\s/>]*(?:\s[^>]*)?>/gi)) {
    const attributes = tag.replace(/"[^"]*"|'[^']*'/g, '""');
    if (/\sstyle\s*=/i.test(attributes))
      problems.push(`${name}: style attribute in ${tag.slice(0, 60)}`);
    const handler = attributes.match(/\s(on[a-z]+)\s*=/i)?.[1];
    if (handler) problems.push(`${name}: ${handler} handler attribute in ${tag.slice(0, 60)}`);
  }
  return problems;
}

/** Audits the built pages and returns `headers` with the bootstrap hash substituted. */
export function applyCsp(input: {
  pages: BuiltPage[];
  headers: string;
  bootstrap: string;
}): string {
  const bootstrapHash = sha256(input.bootstrap);
  const problems = input.pages.flatMap((page) => auditPage(page, bootstrapHash));

  const policies = input.headers.match(CSP_LINE) ?? [];
  if (policies.length !== 1)
    problems.push(
      policies.length === 0
        ? '_headers: no Content-Security-Policy line'
        : `_headers: more than one Content-Security-Policy line (${policies.length})`,
    );
  if (policies.length === 1 && !policies[0]?.includes(HASH_PLACEHOLDER))
    problems.push(`_headers: the policy line has no ${HASH_PLACEHOLDER} placeholder`);

  const headers = input.headers.replace(CSP_LINE, (line) =>
    line.replaceAll(HASH_PLACEHOLDER, bootstrapHash),
  );
  if (headers.includes(HASH_PLACEHOLDER))
    problems.push(`_headers: ${HASH_PLACEHOLDER} placeholder left after substitution`);
  for (const keyword of ["'unsafe-inline'", "'unsafe-eval'"])
    if ((headers.match(CSP_LINE) ?? []).some((line) => line.includes(keyword)))
      problems.push(`_headers: the policy grants ${keyword}`);

  if (problems.length > 0) throw new CspError(problems);
  return headers;
}

function htmlFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true, recursive: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.html'))
    .map((entry) => join(entry.parentPath, entry.name));
}

export default function csp(): AstroIntegration {
  let root = '';
  return {
    name: 'fjord-csp',
    hooks: {
      'astro:config:done': ({ config }) => {
        root = fileURLToPath(config.root);
      },
      'astro:build:done': ({ dir, logger }) => {
        const out = fileURLToPath(dir);
        const headersPath = join(out, '_headers');
        const bootstrap = readFileSync(join(root, BOOTSTRAP_SOURCE), 'utf8');
        const pages = htmlFiles(out).map((file) => ({
          name: relative(out, file).split(sep).join('/'),
          html: readFileSync(file, 'utf8'),
        }));
        writeFileSync(
          headersPath,
          applyCsp({ pages, headers: readFileSync(headersPath, 'utf8'), bootstrap }),
        );
        logger.info(
          `CSP: ${pages.length} pages audited, bootstrap ${sha256(bootstrap)} written to _headers`,
        );
      },
    },
  };
}
