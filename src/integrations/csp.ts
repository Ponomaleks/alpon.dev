// The CSP integration (fjord-foundation ADR-0002). After `astro build` it audits the inline code
// of every built page, then writes the theme bootstrap's sha256 into the single
// Content-Security-Policy line of dist/_headers. It fails the build, before anything can be
// deployed, when:
//   1. a page has an inline <script> other than exactly one copy of the bootstrap
//      (non-executable application/ld+json data blocks are allowed, type compared case-insensitively);
//   2. a page has an inline <style>, a style="…" attribute or an on*="…" handler attribute;
//   3. the hash placeholder is missing from the policy line, or left anywhere after substitution;
//   4. dist/_headers has more than one Content-Security-Policy line (or none).
// It also refuses a policy that grants 'unsafe-inline' or 'unsafe-eval'. Pages are parsed with
// parse5 (the WHATWG HTML parser), never scanned with regexes (review 2026-10-02 F-06).

import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AstroIntegration } from 'astro';
import { html, parse, type DefaultTreeAdapterMap } from 'parse5';
import { normaliseNewlines } from '../scripts/newlines.ts';

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

type Node = DefaultTreeAdapterMap['node'];
type Element = DefaultTreeAdapterMap['element'];

const isElement = (node: Node): node is Element => 'tagName' in node;
const attr = (element: Element, name: string) =>
  element.attrs.find((a) => a.name === name && !a.prefix)?.value;

/** Every element of the page, including template contents, in document order. */
function* elements(node: Node): Generator<Element> {
  if (isElement(node)) yield node;
  const content = 'content' in node ? node.content.childNodes : [];
  for (const child of [...content, ...('childNodes' in node ? node.childNodes : [])])
    yield* elements(child);
}

const text = (element: Element) =>
  element.childNodes.map((child) => ('value' in child ? child.value : '')).join('');

/** An external script: `src` on HTML, `href` / `xlink:href` on SVG. */
const isExternal = (script: Element) =>
  script.attrs.some(
    (a) => a.name === 'src' || (script.namespaceURI === html.NS.SVG && a.name === 'href'),
  );

function auditPage({ name, html: source }: BuiltPage, bootstrapHash: string): string[] {
  const problems: string[] = [];
  let bootstrapCopies = 0;
  // Parsed as the browser parses it (WHATWG algorithm): attribute names are exact, quoted values
  // may hold '>', and CRLF in script text is already LF. Scripting off, so <noscript> content
  // is audited as markup too.
  const document = parse(source, { scriptingEnabled: false });

  for (const element of elements(document)) {
    const tag = `<${element.tagName}${element.attrs.map((a) => ` ${a.name}="${a.value}"`).join('')}>`;
    // The script branch only decides whether the body is allowed; it never skips the style and
    // handler checks below, which run for every element (review 2026-10-02-2 S2-02).
    if (element.tagName === 'script' && !isExternal(element)) {
      const type = attr(element, 'type');
      const isData = type?.trim().toLowerCase() === 'application/ld+json';
      const body = text(element);
      const isBootstrap = sha256(body) === bootstrapHash;
      const allowed = isData || (isBootstrap && bootstrapCopies++ === 0);
      if (!allowed)
        problems.push(
          `${name}: inline script (type ${type ?? 'none'}) that is not the bootstrap: ${
            isBootstrap ? 'a second copy of the bootstrap' : `"${body.trim().slice(0, 40)}"`
          }`,
        );
    }
    if (element.tagName === 'style') problems.push(`${name}: inline <style> element`);
    if (element.attrs.some((a) => a.name === 'style'))
      problems.push(`${name}: style attribute in ${tag.slice(0, 60)}`);
    for (const handler of element.attrs.filter((a) => /^on/i.test(a.name)))
      problems.push(`${name}: ${handler.name} handler attribute in ${tag.slice(0, 60)}`);
  }
  return problems;
}

/** Audits the built pages and returns `headers` with the bootstrap hash substituted. */
export function applyCsp(input: {
  pages: BuiltPage[];
  headers: string;
  bootstrap: string;
}): string {
  const bootstrapHash = sha256(normaliseNewlines(input.bootstrap));
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
        const bootstrap = normaliseNewlines(readFileSync(join(root, BOOTSTRAP_SOURCE), 'utf8'));
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
