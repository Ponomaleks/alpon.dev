import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { checkContrast } from './check-contrast.ts';
import { KNOWN_FAILURES, PAIRS } from './contrast-pairs.ts';

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

  it('measures both warning-soft pairs in Dag and Natt', () => {
    const { measured } = checkContrast(tokens());
    for (const fg of ['--fjord-color-warning', '--fjord-color-text'])
      for (const theme of ['Dag', 'Natt'])
        expect(
          measured.find(
            (m) => m.fg === fg && m.bg === '--fjord-color-warning-soft' && m.theme === theme,
          ),
          `${fg} on warning-soft · ${theme}`,
        ).toBeDefined();
  });

  it('reports the Dag warning pair as a named known failure, not a failure (spec §8 OQ-01)', () => {
    const { failures, known } = checkContrast(tokens());
    expect(failures).toEqual([]);
    expect(known).toContainEqual(
      expect.stringMatching(
        /^--fjord-color-warning on --fjord-color-warning-soft · Dag · 4\.40:1 \(needs 4\.5:1\) · known failure, fix before step 7 Callout$/,
      ),
    );
  });

  it('fails once a known failure passes, so the pair moves to the normal pairs', () => {
    // The Owner darkens the Dag warning color in the design source.
    const fixed = tokens().replaceAll(
      '--fjord-color-warning: #8A6420;',
      '--fjord-color-warning: #6F4F14;',
    );
    expect(fixed).not.toBe(tokens());
    const { failures, known } = checkContrast(fixed);
    expect(known.filter((k) => k.includes('--fjord-color-warning on'))).toEqual([]);
    expect(failures).toContainEqual(
      expect.stringMatching(
        /known failure --fjord-color-warning on --fjord-color-warning-soft · Dag now passes/,
      ),
    );
  });

  it('a UI pair (focus ring) uses the 3:1 threshold', () => {
    const ring = PAIRS.find(
      (p) => p.fg === '--fjord-color-focus-ring' && p.bg === '--fjord-color-bg',
    );
    expect(ring?.kind).toBe('ui');
  });
});

// AC-27: the pairs the Shell and base components use that the foundation manifest did not list.
// The list mirrors what is rendered: each entry names the rule that renders the pair.
describe('base-component pairs', () => {
  const NEW: [string, string, 'text' | 'ui' | 'decorative', string[]][] = [
    ['success', 'bg-raised', 'text', ['Dag', 'Natt']], // Badge --success
    ['warning', 'bg-raised', 'text', ['Dag', 'Natt']], // Badge --warning
    ['link', 'bg-sunken', 'text', ['Dag', 'Natt']], // links in the band and footer
    ['focus-ring', 'bg-sunken', 'ui', ['Dag', 'Natt']], // Tag, band
    ['focus-ring', 'accent-soft', 'ui', ['Dag', 'Natt']], // Button hover
    // TerrainMap .terrain__trail: the dashed route crosses the sunken map frame. Decoration
    // (aria-hidden), not a control boundary, so it is measured and reported but not gated.
    ['border-strong', 'bg-sunken', 'decorative', ['Dag', 'Natt']],
  ];

  // Pairs no rule renders are not listed: a failing pair nobody sees is noise, and a passing one
  // is a false assurance.
  const NEVER_RENDERED: [string, string, string][] = [
    // Nothing muted sits on the soft accent: hover text is --fjord-color-text (Button, IconButton)
    // and a disabled control, the only muted one, keeps a transparent background on hover.
    ['text-muted', 'accent-soft', 'no ghost Button; disabled controls stay transparent'],
    // --fjord-color-bg-inverse is not used by any component or page style.
    ['text-muted', 'bg-inverse', 'no rule paints the inverse ground'],
    // The secondary Button hover switches its border to --fjord-color-text; the header's forced
    // secondary action keeps a transparent background on hover.
    ['border-strong', 'accent-soft', 'the hover border is the text colour'],
  ];

  const find = (fg: string, bg: string) =>
    PAIRS.find((p) => p.fg === `--fjord-color-${fg}` && p.bg === `--fjord-color-${bg}`);

  it.each(NEW)('lists %s on %s as a %s pair', (fg, bg, kind, themes) => {
    const found = find(fg, bg);
    expect(found?.kind).toBe(kind);
    expect(found?.themes).toEqual(expect.arrayContaining(themes as never[]));
  });

  it.each(NEVER_RENDERED)('does not list %s on %s: %s', (fg, bg) => {
    expect(find(fg, bg)).toBeUndefined();
    expect(
      KNOWN_FAILURES.filter(
        (k) => k.fg === `--fjord-color-${fg}` && k.bg === `--fjord-color-${bg}`,
      ),
    ).toEqual([]);
  });

  it('lists the text colour on the soft accent, the pair the hovered Buttons do render', () => {
    expect(find('text', 'accent-soft')?.kind).toBe('text');
  });

  it('keeps only the Dag warning pair as a known failure', () => {
    expect(KNOWN_FAILURES.map((k) => `${k.fg} on ${k.bg} · ${k.theme}`)).toEqual([
      '--fjord-color-warning on --fjord-color-warning-soft · Dag',
    ]);
  });

  it('measures every gated new pair in each of its themes', () => {
    const { measured } = checkContrast(tokens());
    for (const [fg, bg, kind, themes] of NEW)
      for (const theme of themes)
        expect(
          measured.some(
            (m) =>
              m.fg === `--fjord-color-${fg}` && m.bg === `--fjord-color-${bg}` && m.theme === theme,
          ),
          `${fg} on ${bg} · ${theme}`,
        ).toBe(kind !== 'decorative');
  });
});

// WCAG 1.4.11 asks 3:1 of what is needed to identify a control or to understand a graphic, not of
// decoration. A decorative pair is measured and printed on every run but never fails the check.
describe('decorative pairs', () => {
  it('are exactly the map route on the sunken frame', () => {
    expect(PAIRS.filter((p) => p.kind === 'decorative').map((p) => `${p.fg} on ${p.bg}`)).toEqual([
      '--fjord-color-border-strong on --fjord-color-bg-sunken',
    ]);
  });

  it('are reported with their ratio and not gated, in each theme', () => {
    const { failures, known, decorative } = checkContrast(tokens());
    expect(failures).toEqual([]);
    expect(decorative).toEqual([
      expect.stringMatching(
        /^--fjord-color-border-strong on --fjord-color-bg-sunken · Dag · 2\.95:1 \(decorative, not gated\)$/,
      ),
      expect.stringMatching(
        /^--fjord-color-border-strong on --fjord-color-bg-sunken · Natt · \d+\.\d{2}:1 \(decorative, not gated\)$/,
      ),
    ]);
    expect(known.filter((k) => k.includes('border-strong'))).toEqual([]);
  });

  it('do not fail the check however low the ratio', () => {
    // The Dag strong border set to the sunken ground itself: 1:1 on the decorative pair.
    const lowered = tokens().replaceAll(
      '--fjord-color-border-strong: #7E8C85;',
      '--fjord-color-border-strong: #E9ECE6;',
    );
    expect(lowered).not.toBe(tokens());
    const { failures, decorative } = checkContrast(lowered);
    expect(decorative[0]).toMatch(/· Dag · 1\.00:1 \(decorative, not gated\)$/);
    expect(failures.filter((f) => f.includes('--fjord-color-bg-sunken'))).toEqual([]);
    // The same colour as a control boundary on the page ground is still gated.
    expect(failures).toContainEqual(
      expect.stringMatching(/--fjord-color-border-strong on --fjord-color-bg · Dag · .*needs 3:1/),
    );
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
    expect(run.stdout).toMatch(
      /--fjord-color-warning on --fjord-color-warning-soft · Dag · 4\.40:1 \(needs 4\.5:1\) · known failure, fix before step 7 Callout/,
    );
    // A failing pair is never printed as if it met its threshold.
    expect(run.stdout).not.toMatch(/4\.40:1 \(≥/);
    expect(run.stdout).toMatch(
      /--fjord-color-border-strong on --fjord-color-bg-sunken · Dag · 2\.95:1 \(decorative, not gated\)/,
    );
    expect(run.stdout).toMatch(
      /contrast: \d+ pairs pass, 1 known failure\(s\), 2 decorative pair\(s\) not gated\n$/,
    );
  });
});
