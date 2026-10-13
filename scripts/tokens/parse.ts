// A minimal CSS reader for the handoff token files: flat rules and one level of @media.
// It keeps declarations in source order and drops comments; values are whitespace-collapsed.

export type Declaration = [property: string, value: string];
export interface Rule {
  selector: string;
  declarations: Declaration[];
}
export interface MediaRule {
  query: string;
  rules: Rule[];
}
export interface Stylesheet {
  rules: Rule[];
  media: MediaRule[];
}

const collapse = (text: string) => text.replace(/\s+/g, ' ').trim();

function parseDeclarations(body: string): Declaration[] {
  return body
    .split(';')
    .map(collapse)
    .filter(Boolean)
    .map((declaration) => {
      const colon = declaration.indexOf(':');
      if (colon < 0) throw new Error(`not a declaration: "${declaration}"`);
      return [collapse(declaration.slice(0, colon)), collapse(declaration.slice(colon + 1))];
    });
}

/** Splits `css` into top-level `prelude { body }` pairs, braces balanced. */
function blocks(css: string): [prelude: string, body: string][] {
  const result: [string, string][] = [];
  let depth = 0;
  let start = 0;
  let open = 0;
  for (let i = 0; i < css.length; i++) {
    if (css[i] === '{' && depth++ === 0) open = i;
    if (css[i] === '}' && --depth === 0) {
      result.push([collapse(css.slice(start, open)), css.slice(open + 1, i)]);
      start = i + 1;
    }
    if (depth < 0) throw new Error('unbalanced "}"');
  }
  if (depth !== 0 || collapse(css.slice(start)) !== '') throw new Error('unbalanced "{"');
  return result;
}

export function parseCss(css: string): Stylesheet {
  const sheet: Stylesheet = { rules: [], media: [] };
  for (const [prelude, body] of blocks(css.replace(/\/\*[\s\S]*?\*\//g, ''))) {
    if (prelude.startsWith('@media')) {
      sheet.media.push({
        query: prelude,
        rules: blocks(body).map(([selector, inner]) => ({
          selector,
          declarations: parseDeclarations(inner),
        })),
      });
    } else {
      sheet.rules.push({ selector: prelude, declarations: parseDeclarations(body) });
    }
  }
  return sheet;
}
