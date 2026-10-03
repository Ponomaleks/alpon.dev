import { readdirSync, readFileSync } from 'node:fs';
import { sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import stylelint from 'stylelint';
import { describe, expect, it } from 'vitest';
import { conditionalImports } from './import-conditions.ts';

// AC-11: a media condition on @import carries a width past the breakpoint and unit rules, which
// read @media preludes only. No Stylelint core rule checks an @import prelude (ADR-0003), so this
// check does.

const root = fileURLToPath(new URL('../../', import.meta.url));
const fixture = fileURLToPath(new URL('./fixtures/import-condition.css', import.meta.url));

describe('conditional @import check (ADR-0003)', () => {
  it('reports a media condition on @import, with the feature name in either case', () => {
    expect(conditionalImports(readFileSync(fixture, 'utf8'))).toEqual([
      { line: 1, prelude: "'./wide.css' (min-width: 800px)" },
      { line: 2, prelude: "'./wider.css' screen and (MIN-WIDTH: 50em)" },
    ]);
  });

  // The reason this check exists. If Stylelint starts to report the fixture, move the check into
  // stylelint.config.js and delete this file.
  it('covers a case that the Stylelint rule set lets through', async () => {
    const { results } = await stylelint.lint({ files: fixture, cwd: root });
    expect(results[0]?.warnings).toEqual([]);
  });

  it.each([
    ['a media type', '@import "print.css" print;'],
    ['a condition after url()', '@import url("wide.css") (width >= 800px);'],
    ['a supports() condition', '@import "grid.css" supports(display: grid);'],
    ['a layer', '@import "theme.css" layer(theme);'],
    ['an upper-case at-rule name', '@IMPORT "wide.css" (min-width: 800px);'],
    ['a comment before the condition', '@import "wide.css" /* wide */ (min-width: 800px);'],
  ])('reports %s', (_, source) => {
    expect(conditionalImports(source)).toHaveLength(1);
  });

  it('reports the line inside an .astro <style> block', () => {
    const source =
      '---\n---\n<p>Hei</p>\n<style>\n  @import "wide.css" (min-width: 800px);\n</style>\n';
    expect(conditionalImports(source)).toEqual([
      { line: 5, prelude: '"wide.css" (min-width: 800px)' },
    ]);
  });

  it.each([
    "@import './tokens.css';",
    '@import "tokens.css";',
    '@import url("tokens.css");',
    '@import url(tokens.css);',
    '/* @import "wide.css" (min-width: 800px); */',
    '---\nimport BaseLayout from "../layouts/BaseLayout.astro";\n---\n',
  ])('passes %s', (source) => {
    expect(conditionalImports(source)).toEqual([]);
  });

  it('finds no conditional @import under src/', () => {
    const files = readdirSync(`${root}src`, { recursive: true, encoding: 'utf8' })
      .filter((file) => /\.(css|astro)$/.test(file))
      .map((file) => `src/${file.split(sep).join('/')}`);
    expect(files).toContain('src/styles/global.css');
    const found = files.flatMap((file) =>
      conditionalImports(readFileSync(`${root}${file}`, 'utf8')).map((hit) => ({ file, ...hit })),
    );
    expect(found).toEqual([]);
  });
});
