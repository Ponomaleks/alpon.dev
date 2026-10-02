import { fileURLToPath } from 'node:url';
import stylelint from 'stylelint';
import { describe, expect, it } from 'vitest';

// AC-11: every kind of literal visual value is reported with file and line;
// token-only styles pass (ADR-0003 rule set in stylelint.config.js).

const root = fileURLToPath(new URL('../../', import.meta.url));
const fixture = (name: string) => fileURLToPath(new URL(`./fixtures/${name}`, import.meta.url));

async function lintFile(name: string) {
  const { results } = await stylelint.lint({ files: fixture(name), cwd: root });
  const [result] = results;
  expect(results).toHaveLength(1);
  if (!result) throw new Error(`no lint result for ${name}`);
  return result;
}

describe('stylelint token-only rules (ADR-0003)', () => {
  const banned: [file: string, literal: string, line: number, rule: string][] = [
    ['hex.css', '#24493D', 2, 'color-no-hex'],
    ['named.css', 'red', 2, 'color-named'],
    ['rgb.css', 'rgb(0 0 0)', 2, 'function-disallowed-list'],
    ['px.css', '16px', 2, 'unit-disallowed-list'],
    ['ms.css', '200ms', 2, 'unit-disallowed-list'],
    ['easing.css', 'cubic-bezier', 2, 'function-disallowed-list'],
    ['weight.css', 'font-weight: 600', 2, 'declaration-property-value-allowed-list'],
    ['leading.css', 'line-height: 1.2', 2, 'declaration-property-value-allowed-list'],
    ['breakpoint.css', 'min-width: 800px', 1, 'media-feature-name-value-allowed-list'],
    ['component.astro', '12px in an .astro <style>', 5, 'unit-disallowed-list'],
  ];

  for (const [file, literal, line, rule] of banned) {
    it(`reports ${literal} in ${file} at line ${line} (${rule})`, async () => {
      const result = await lintFile(file);
      expect(result.source).toBe(fixture(file));
      expect(result.warnings).toContainEqual(expect.objectContaining({ line, rule }));
    });
  }

  it('passes a token-only file', async () => {
    const result = await lintFile('token-only.css');
    expect(result.warnings).toEqual([]);
  });

  it.each(['src/styles/tokens.css', 'src/styles/fonts.css'])('ignores %s', async (file) => {
    const { results } = await stylelint.lint({
      code: '.a { color: #fff; }',
      codeFilename: fileURLToPath(new URL(`../../${file}`, import.meta.url)),
      cwd: root,
    });
    expect(results[0]?.ignored).toBe(true);
  });
});
