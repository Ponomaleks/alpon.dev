import { fileURLToPath } from 'node:url';
import stylelint from 'stylelint';
import { describe, expect, it } from 'vitest';

// AC-26: a literal visual value is reported with file and line, a token-only style passes, and
// standard CSS (fr, %, minmax(), transforms, ...) is not a finding (base-components ADR-0004, rule
// set in stylelint.config.js). One passing and one failing fixture per enforced group.

const root = fileURLToPath(new URL('../../', import.meta.url));
const fixture = (name: string) => fileURLToPath(new URL(`./fixtures/${name}`, import.meta.url));

async function lintFile(name: string) {
  const { results } = await stylelint.lint({ files: fixture(name), cwd: root });
  const [result] = results;
  expect(results).toHaveLength(1);
  if (!result) throw new Error(`no lint result for ${name}`);
  return result;
}

const strict = 'scale-unlimited/declaration-strict-value';
const hex = 'color-no-hex';
const named = 'color-named';
const colourFunction = 'function-disallowed-list';
const fontShorthand = 'property-disallowed-list';
const undeclared = 'declaration-property-value-disallowed-list';
const breakpoint = 'media-feature-name-value-allowed-list';
const atRule = 'at-rule-disallowed-list';

type Finding = [line: number, rule: string];
type Group = { name: string; pass: string; fail: string; findings: Finding[] };

/** `lines(strict, 2, 3)` is a finding of `rule` on each of the lines. */
const lines = (rule: string, ...at: number[]): Finding[] => at.map((line) => [line, rule]);

const groups: Group[] = [
  {
    name: 'colour literals (hex, named, colour functions) in any property',
    pass: 'colour-literal-pass.css',
    fail: 'colour-literal-fail.css',
    findings: [
      ...lines(hex, 2, 13),
      ...lines(named, 3, 15),
      // rgb / rgba, hsl, hsla, hwb, lab, lch, oklab, oklch, color(), and rgb() inside color-mix().
      ...lines(colourFunction, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14),
    ],
  },
  {
    name: 'colour properties (color, background, border and outline colour, fill, stroke)',
    pass: 'colour-property-pass.css',
    fail: 'colour-property-fail.css',
    findings: [...lines(strict, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13), [12, named], [13, hex]],
  },
  {
    name: 'spacing (margin, padding, gap)',
    pass: 'spacing-pass.css',
    fail: 'spacing-fail.css',
    findings: lines(strict, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12),
  },
  {
    name: 'type (font-size, line-height, the font shorthand)',
    pass: 'type-pass.css',
    fail: 'type-fail.css',
    findings: [...lines(strict, 2, 3, 4, 5, 6, 7, 8), [9, fontShorthand]],
  },
  {
    name: 'border-radius',
    pass: 'radius-pass.css',
    fail: 'radius-fail.css',
    findings: lines(strict, 2, 3, 4, 5, 6),
  },
  {
    name: 'motion (transition and animation durations and easing)',
    pass: 'motion-pass.css',
    fail: 'motion-fail.css',
    findings: lines(strict, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14),
  },
  {
    name: 'breakpoints (360 / 768 / 1024 / 1440, any case, legacy and range syntax)',
    pass: 'breakpoint-pass.css',
    fail: 'breakpoint-fail.css',
    findings: lines(breakpoint, 1, 7, 13, 19, 25),
  },
  {
    name: 'Fjord tokens that tokens.css does not declare',
    pass: 'unknown-token-pass.css',
    fail: 'unknown-token-fail.css',
    findings: lines(undeclared, 2, 3, 4),
  },
  {
    name: 'at-rules (@container is banned in any case; @view-transition, @supports pass)',
    pass: 'at-rule-pass.css',
    fail: 'at-rule-fail.css',
    findings: lines(atRule, 1, 7),
  },
  {
    name: 'a <style> block in an .astro file',
    pass: 'component-pass.astro',
    fail: 'component-fail.astro',
    findings: lines(strict, 5),
  },
];

const byLine = (a: Finding, b: Finding) => a[0] - b[0] || a[1].localeCompare(b[1]);

describe('stylelint token-only rules (ADR-0004)', () => {
  describe.each(groups)('$name', ({ pass, fail, findings }) => {
    it(`passes ${pass} with zero findings`, async () => {
      const result = await lintFile(pass);
      expect(result.warnings).toEqual([]);
    });

    it(`reports exactly the findings of ${fail}, each with file and line`, async () => {
      const result = await lintFile(fail);
      expect(result.source).toBe(fixture(fail));
      const reported = new Map(
        result.warnings.map(({ line, rule }) => [`${line} ${rule}`, [line, rule] as Finding]),
      );
      expect([...reported.values()].sort(byLine)).toEqual([...findings].sort(byLine));
    });
  });

  it('passes standard CSS: fr, %, ch, minmax(), repeat(), clamp(), min(), max(), transforms, calc() over tokens, color-mix() and gradients over tokens', async () => {
    const result = await lintFile('standard-css-pass.css');
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
