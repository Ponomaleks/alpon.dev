import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, describe, expect, it } from 'vitest';

// ADR-0002 on a real production build (AC-12): the delivered _headers matches the agreed policy
// contract with the current bootstrap hash, and a build whose pages break the policy fails.

const repo = fileURLToPath(new URL('../../', import.meta.url));
const astro = join(repo, 'node_modules/astro/bin/astro.mjs');
const dirs: string[] = [];

function build(args: string[], env: Record<string, string> = {}) {
  return spawnSync(process.execPath, [astro, 'build', ...args], {
    cwd: repo,
    encoding: 'utf8',
    env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1', ...env },
  });
}

const tempDir = () => {
  const dir = mkdtempSync(join(tmpdir(), 'fjord-csp-'));
  dirs.push(dir);
  return dir;
};

afterAll(() => {
  for (const dir of dirs) rmSync(dir, { recursive: true, force: true });
});

/** Rules of a _headers file: path pattern → header lines. */
function rules(headers: string): Map<string, string[]> {
  const map = new Map<string, string[]>();
  let current = '';
  for (const line of headers.split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    if (/^\S/.test(line)) map.set((current = line.trim()), []);
    else map.get(current)?.push(line.trim());
  }
  return map;
}

describe('the real build', () => {
  const out = join(tempDir(), 'dist');
  const result = build(['--outDir', out]);
  const bootstrap = readFileSync(join(repo, 'src/scripts/theme-bootstrap.js'), 'utf8');
  const hash = `'sha256-${createHash('sha256').update(bootstrap).digest('base64')}'`;

  it('succeeds', () => {
    expect(result.stderr).not.toMatch(/CSP audit failed/);
    expect(result.status).toBe(0);
  });

  it('writes exactly one Content-Security-Policy line, under /*, matching the contract', () => {
    const headers = readFileSync(join(out, '_headers'), 'utf8');
    expect(headers.match(/Content-Security-Policy:/g)).toHaveLength(1);
    const csp = rules(headers)
      .get('/*')
      ?.find((line) => line.startsWith('Content-Security-Policy:'));
    expect(csp).toBeDefined();
    const contract = JSON.parse(
      readFileSync(join(repo, 'tests/contracts/csp.contract.json'), 'utf8'),
    ) as { directives: Record<string, string[]> };
    const delivered = Object.fromEntries(
      (csp ?? '')
        .replace('Content-Security-Policy:', '')
        .split(';')
        .map((d) => d.trim().split(/\s+/))
        .filter(([name]) => name)
        .map(([name = '', ...values]) => [name, values]),
    );
    const expected = Object.fromEntries(
      Object.entries(contract.directives).map(([name, values]) => [
        name,
        values.map((v) => (v === '{{hash}}' ? hash : v)),
      ]),
    );
    expect(delivered).toEqual(expected);
    expect(csp).not.toMatch(/unsafe-inline|unsafe-eval|\*/);
  });

  it('leaves the / rule with Cache-Control only', () => {
    const root = rules(readFileSync(join(out, '_headers'), 'utf8')).get('/');
    expect(root?.map((line) => line.split(':')[0])).toEqual(['Cache-Control']);
  });
});

describe('a build with an unexpected inline script', () => {
  it('fails before the output is finalized, naming the page', () => {
    const out = join(tempDir(), 'dist');
    const result = build(['--config', 'src/integrations/fixtures/astro.bad-page.config.mjs'], {
      FJORD_FIXTURE_OUT_DIR: out,
    });
    expect(result.status).not.toBe(0);
    expect(`${result.stdout}${result.stderr}`).toMatch(/bad-fixture\.html: inline script/);
    const headers = join(out, '_headers');
    if (existsSync(headers))
      expect(readFileSync(headers, 'utf8')).toContain('{{THEME_BOOTSTRAP_HASH}}');
  });
});
