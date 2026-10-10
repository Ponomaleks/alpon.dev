import { spawnSync } from 'node:child_process';
import { cpSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';
import { BRAND_FILE, HANDOFF_DIR, MEASURE_FONT } from './sources.ts';

// ADR-0001 guard: `build.ts --check` fails, naming the file, when tokens.css is stale (AC-11).

const repo = fileURLToPath(new URL('../../', import.meta.url));
const script = join(repo, 'scripts/tokens/build.ts');
const dirs: string[] = [];

/** A throwaway repo root holding copies of the design sources. */
function fixtureRoot(): string {
  const dir = mkdtempSync(join(tmpdir(), 'fjord-tokens-'));
  dirs.push(dir);
  cpSync(join(repo, HANDOFF_DIR), join(dir, HANDOFF_DIR), { recursive: true });
  cpSync(join(repo, BRAND_FILE), join(dir, BRAND_FILE));
  cpSync(join(repo, MEASURE_FONT), join(dir, MEASURE_FONT));
  mkdirSync(join(dir, 'src/styles'), { recursive: true });
  return dir;
}

const run = (cwd: string, ...args: string[]) =>
  spawnSync(process.execPath, [script, ...args], { cwd, encoding: 'utf8' });

afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

describe('tokens --check', () => {
  it('passes on a freshly generated tokens.css', () => {
    const dir = fixtureRoot();
    expect(run(dir).status).toBe(0);
    const check = run(dir, '--check');
    expect(check.stderr).toBe('');
    expect(check.status).toBe(0);
  });

  it('fails naming src/styles/tokens.css when a design source changed without regenerating', () => {
    const dir = fixtureRoot();
    expect(run(dir).status).toBe(0);
    writeFileSync(
      join(dir, HANDOFF_DIR, 'spacing.css'),
      ':root { --fjord-space-1: 4px; --fjord-space-99: 396px; }\n',
    );
    const check = run(dir, '--check');
    expect(check.status).not.toBe(0);
    expect(check.stderr).toContain('src/styles/tokens.css');
  });

  it('fails naming the file when tokens.css is missing', () => {
    const check = run(fixtureRoot(), '--check');
    expect(check.status).not.toBe(0);
    expect(check.stderr).toContain('src/styles/tokens.css');
  });

  it('passes only with the print block: a tokens.css without it is stale (cv AC-12)', () => {
    const dir = fixtureRoot();
    expect(run(dir).status).toBe(0);
    const file = join(dir, 'src/styles/tokens.css');
    const css = readFileSync(file, 'utf8');
    expect(css).toContain('@media print {');
    writeFileSync(file, css.replace(/@media print \{[\s\S]*?\n\}\n/, ''));
    const check = run(dir, '--check');
    expect(check.status).not.toBe(0);
    expect(check.stderr).toContain('src/styles/tokens.css');
  });
});
