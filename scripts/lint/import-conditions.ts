// Token-only styles (fjord-foundation ADR-0003): an @import may name a file and nothing else.
// A media condition after the file (`@import "x.css" (min-width: 800px)`) is a media query that
// the breakpoint and unit rules never see, because Stylelint's core rules read @media preludes
// only. supports() and layer conditions are rejected with it until real code needs one.

export interface ConditionalImport {
  line: number;
  prelude: string;
}

/** A CSS comment, replaced by its own line breaks so line numbers hold. */
const comment = /\/\*[\s\S]*?\*\//g;
const importRule = /@import\b([^;{}]*)/gi;
/** One string or one url(), and nothing after it. */
const fileOnly = /^(?:"[^"]*"|'[^']*'|url\([^)]*\))$/i;

/** Every @import in a .css or .astro source whose prelude is more than the file it imports. */
export function conditionalImports(source: string): ConditionalImport[] {
  const css = source.replace(comment, (text) => text.replace(/[^\n]/g, ''));
  const found: ConditionalImport[] = [];
  for (const match of css.matchAll(importRule)) {
    const prelude = (match[1] ?? '').trim().replace(/\s+/g, ' ');
    if (fileOnly.test(prelude)) continue;
    found.push({ line: css.slice(0, match.index).split('\n').length, prelude });
  }
  return found;
}
