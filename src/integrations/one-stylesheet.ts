// One stylesheet per page (home T19). Astro links one CSS chunk per page plus one per group of
// pages that share styles, and has no option to join them (only to inline them, which the policy
// in public/_headers forbids: style-src 'self'). Every link is a request before the first paint,
// so after the build this integration joins the sheets a page links, in link order, into one file
// of the same origin and removes the chunks no page links any more.

import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AstroIntegration } from 'astro';

/** A stylesheet link of the build, as Astro writes it. */
const BUILD_SHEET = /<link rel="stylesheet" href="(\/_astro\/[^"]+\.css)">/g;
/** At-rules that are valid only before every other rule of a file. */
const MUST_BE_FIRST = /@(?:import|charset|namespace)\b/;

export class StylesheetError extends Error {}

export interface MergedPage {
  html: string;
  /** The joined stylesheet and its address; absent when the page had nothing to join. */
  href?: string;
  css?: string;
}

/**
 * Joins the build stylesheets a page links into one, at the place of the first link. The file is
 * named by its content, so pages with the same styles share it.
 */
export function mergePageStyles(html: string, read: (href: string) => string): MergedPage {
  const hrefs = [...html.matchAll(BUILD_SHEET)].map((match) => match[1] ?? '');
  if (hrefs.length < 2) return { html };

  const parts = hrefs.map((href, index) => {
    const css = read(href);
    const rule = index > 0 ? css.match(MUST_BE_FIRST)?.[0] : undefined;
    if (rule)
      throw new StylesheetError(`${href} holds ${rule}, which must be the first rule of a file`);
    return css.trim();
  });
  const css = `${parts.join('\n')}\n`;
  const href = `/_astro/page.${createHash('sha256').update(css).digest('hex').slice(0, 8)}.css`;

  let first = true;
  const merged = html.replace(BUILD_SHEET, () => {
    if (!first) return '';
    first = false;
    return `<link rel="stylesheet" href="${href}">`;
  });
  return { html: merged, href, css };
}

function files(dir: string, extension: string): string[] {
  return readdirSync(dir, { withFileTypes: true, recursive: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(extension))
    .map((entry) => join(entry.parentPath, entry.name));
}

export default function oneStylesheet(): AstroIntegration {
  return {
    name: 'fjord-one-stylesheet',
    hooks: {
      'astro:build:done': ({ dir, logger }) => {
        const out = fileURLToPath(dir);
        const address = (file: string) => `/${relative(out, file).split(sep).join('/')}`;
        const linked = new Set<string>();
        for (const file of files(out, '.html')) {
          const result = mergePageStyles(readFileSync(file, 'utf8'), (href) =>
            readFileSync(join(out, href), 'utf8'),
          );
          if (result.href && result.css) {
            writeFileSync(join(out, result.href), result.css);
            writeFileSync(file, result.html);
          }
          for (const [, href = ''] of result.html.matchAll(BUILD_SHEET)) linked.add(href);
        }
        const unused = files(join(out, '_astro'), '.css').filter(
          (file) => !linked.has(address(file)),
        );
        for (const file of unused) rmSync(file);
        logger.info(`one stylesheet per page: ${linked.size} linked, ${unused.length} removed`);
      },
    },
  };
}
