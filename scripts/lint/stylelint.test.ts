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
    // Radius and size.
    ['radius.css', 'border-radius: 4px', 2, 'unit-disallowed-list'],
    ['radius.css', 'border-top-left-radius: 50%', 3, 'declaration-property-value-allowed-list'],
    ['size.css', 'font-size: 14px', 2, 'declaration-property-value-allowed-list'],
    ['size.css', 'width: 640px', 3, 'unit-disallowed-list'],
    // Literals hidden in shorthands.
    [
      'shorthand-easing.css',
      'ease-in-out in transition',
      2,
      'declaration-property-value-disallowed-list',
    ],
    [
      'shorthand-easing.css',
      'linear in animation',
      3,
      'declaration-property-value-disallowed-list',
    ],
    ['font-shorthand.css', 'the font shorthand', 2, 'property-disallowed-list'],
    ['border-shorthand.css', 'border: thin', 2, 'declaration-property-value-allowed-list'],
    ['border-shorthand.css', 'outline: medium', 3, 'declaration-property-value-allowed-list'],
    // Absolute and viewport units.
    ['absolute-unit.css', '12pt', 2, 'unit-disallowed-list'],
    ['absolute-unit.css', '4mm in box-shadow', 3, 'unit-disallowed-list'],
    ['viewport.css', 'top: 3vh', 2, 'declaration-property-unit-disallowed-list'],
    ['viewport.css', '100vw', 3, 'unit-disallowed-list'],
    ['viewport.css', 'padding-block: 2dvh', 4, 'declaration-property-unit-disallowed-list'],
    // Height properties take a viewport unit only as a full 100vh / 100svh / 100lvh / 100dvh.
    ['viewport.css', 'min-height: 73vh', 5, 'declaration-property-value-allowed-list'],
    ['viewport.css', 'max-height: 50svh', 6, 'declaration-property-value-allowed-list'],
    ['viewport.css', 'calc(100dvh - token)', 7, 'declaration-property-value-allowed-list'],
    // Container-query units.
    ['container-unit.css', 'width: 50cqi', 2, 'unit-disallowed-list'],
    ['container-unit.css', 'inline-size: 10cqmin', 3, 'unit-disallowed-list'],
    ['container-unit.css', 'height: 20cqh', 4, 'unit-disallowed-list'],
    // Container queries bypass the unit and breakpoint rules, so the at-rule is banned (R32).
    ['container.css', '@container (min-width: 400px)', 1, 'at-rule-disallowed-list'],
    // Allow lists: functions and units nobody listed are rejected by default.
    ['lab.css', 'lab()', 2, 'function-allowed-list'],
    ['oklab.css', 'oklab()', 2, 'function-allowed-list'],
    ['color-mix.css', 'color-mix() on background', 2, 'function-allowed-list'],
    ['rch.css', '20rch', 2, 'unit-allowed-list'],
    // Tokens that tokens.css does not declare.
    [
      'unknown-token.css',
      'var(--fjord-color-txt)',
      2,
      'declaration-property-value-disallowed-list',
    ],
    ['unknown-token.css', 'var(--fjord-space-99)', 3, 'declaration-property-value-disallowed-list'],
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
