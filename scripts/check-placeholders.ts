// Placeholder check (home AC-28). Square brackets that stand for a missing value, such as
// "[current project]", must not reach a page for Visitors. Marked Styleguide sample data is the
// only exemption: the whole subtree of an element with SAMPLE_ATTRIBUTE is skipped.
//
// Run after the build from the repo root: node scripts/check-placeholders.ts [dist]

import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

/** Bare attribute the Styleguide puts on sample blocks (see QrTile, MotionControl, Header). */
export const SAMPLE_ATTRIBUTE = 'data-sample';

const VOID = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'source',
  'track',
  'wbr',
]);
const INLINE = new Set([
  'a',
  'abbr',
  'b',
  'cite',
  'code',
  'em',
  'i',
  'mark',
  'q',
  's',
  'small',
  'span',
  'strong',
  'sub',
  'sup',
  'time',
  'u',
]);

function htmlFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return htmlFiles(path);
    return entry.name.endsWith('.html') ? [path] : [];
  });
}

/** Visible text of a page outside script, style, comments, attribute values and sample blocks. */
function visibleText(html: string): string {
  const source = html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<(script|style)\b[\s\S]*?<\/\1\s*>/gi, '');
  const marker = new RegExp(String.raw`(^|\s)${SAMPLE_ATTRIBUTE}(?=[\s=/]|$)`);
  const tokens = /<(\/?)([a-zA-Z][\w:-]*)((?:"[^"]*"|'[^']*'|[^'">])*)>|([^<]+)|</g;
  const stack: string[] = [];
  let sampleDepth = -1;
  let text = '';
  for (const m of source.matchAll(tokens)) {
    const [, closing, rawName, attrs = '', chunk] = m;
    if (chunk !== undefined) {
      if (sampleDepth < 0) text += chunk;
      continue;
    }
    if (!rawName) continue;
    const name = rawName.toLowerCase();
    if (closing) {
      const at = stack.lastIndexOf(name);
      if (at >= 0) stack.length = at;
      if (sampleDepth >= 0 && stack.length < sampleDepth) sampleDepth = -1;
    } else if (!VOID.has(name) && !attrs.trimEnd().endsWith('/')) {
      stack.push(name);
      const bare = attrs.replace(/"[^"]*"|'[^']*'/g, '""');
      if (sampleDepth < 0 && marker.test(bare)) sampleDepth = stack.length;
    }
    if (!INLINE.has(name) && sampleDepth < 0) text += '\n';
  }
  return text;
}

export function checkPlaceholders(distDir: string): string[] {
  const files = htmlFiles(distDir);
  if (files.length === 0) return [`no pages found in ${distDir}: nothing was checked`];
  const problems: string[] = [];
  for (const file of files) {
    const page = relative(distDir, file).replaceAll(sep, '/');
    for (const found of visibleText(readFileSync(file, 'utf8')).match(/\[[^[\]]*\]/g) ?? []) {
      problems.push(
        `${page}: placeholder text "${found.replace(/\s+/g, ' ')}" must not be published`,
      );
    }
  }
  return problems;
}

if (import.meta.main) {
  const dist = process.argv[2] ?? 'dist';
  const problems = checkPlaceholders(dist);
  if (problems.length > 0) {
    console.error(`placeholder check failed:\n  ${problems.join('\n  ')}`);
    process.exit(1);
  }
  console.log('placeholders: no bracketed placeholder text on any page');
}
