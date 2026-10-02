import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { checkContrast } from './check-contrast.ts';
import { PAIRS } from './contrast-pairs.ts';

// AC-10: every manifest pair stays readable in Dag, Natt and on spruce; a lowered pair fails
// naming the pair, the theme and the measured ratio. The two Natt blocks must be identical.

const repo = fileURLToPath(new URL('../', import.meta.url));
const tokens = () => readFileSync(`${repo}src/styles/tokens.css`, 'utf8');

describe('checkContrast', () => {
  it('passes the real generated tokens', () => {
    const result = checkContrast(tokens());
    expect(result.failures).toEqual([]);
    expect(result.checked).toBeGreaterThanOrEqual(PAIRS.length);
  });

  it('checks every pair in Dag and Natt and the on-spruce pairs on spruce', () => {
    const { measured } = checkContrast(tokens());
    const themes = new Set(measured.map((m) => m.theme));
    expect(themes).toEqual(new Set(['Dag', 'Natt', 'on-spruce']));
    expect(
      measured.find((m) => m.fg === '--fjord-color-text' && m.theme === 'Natt')?.ratio,
    ).toBeCloseTo(15.69, 2);
  });

  it('fails a lowered pair, naming the pair, the theme and the ratio with two decimals', () => {
    // Dag muted text lightened from #5E6B65 to #8A948F.
    const lowered = tokens().replace('--fjord-muted: #5E6B65;', '--fjord-muted: #8A948F;');
    expect(lowered).not.toBe(tokens());
    const { failures } = checkContrast(lowered);
    expect(failures).toContainEqual(
      expect.stringMatching(
        /--fjord-color-text-muted on --fjord-color-bg · Dag · \d+\.\d{2}:1 \(needs 4\.5:1\)/,
      ),
    );
    expect(failures.every((f) => !f.includes('· Natt ·'))).toBe(true);
  });

  it('fails when the no-JS Natt block differs from [data-theme="natt"]', () => {
    const css = tokens();
    const noJs = css.indexOf(':root:not([data-theme])');
    const drifted =
      css.slice(0, noJs) +
      css.slice(noJs).replace('--fjord-color-bg: #111A17;', '--fjord-color-bg: #000000;');
    expect(drifted).not.toBe(css);
    expect(checkContrast(drifted).failures).toContainEqual(
      expect.stringMatching(/no-JS Natt block.*--fjord-color-bg/),
    );
  });

  it('a UI pair (focus ring) uses the 3:1 threshold', () => {
    const ring = PAIRS.find(
      (p) => p.fg === '--fjord-color-focus-ring' && p.bg === '--fjord-color-bg',
    );
    expect(ring?.kind).toBe('ui');
  });
});

describe('scripts/check-contrast.ts CLI', () => {
  it('exits 0 on the real tokens and prints the measured pairs', () => {
    const run = spawnSync(process.execPath, ['scripts/check-contrast.ts'], {
      cwd: repo,
      encoding: 'utf8',
    });
    expect(run.stderr).toBe('');
    expect(run.status).toBe(0);
    expect(run.stdout).toMatch(/--fjord-color-text on --fjord-color-bg · Dag · 14\.39:1/);
  });
});
