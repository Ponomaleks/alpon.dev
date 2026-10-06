import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  cpSync,
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'parse5';
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

const sha256 = (text: string) => `'sha256-${createHash('sha256').update(text).digest('base64')}'`;

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

/** A throwaway copy of the site (sources, public files, config) sharing the repo's node_modules. */
function siteCopy(): string {
  const dir = tempDir();
  for (const entry of [
    'src',
    'public',
    'astro.config.mjs',
    'tsconfig.json',
    'package.json',
    // The Not-found ridge imports its contour data from the handoff bundle.
    'design/handoff/design-system/project/components/brand/contourData.js',
  ])
    cpSync(join(repo, entry), join(dir, entry), { recursive: true });
  symlinkSync(join(repo, 'node_modules'), join(dir, 'node_modules'), 'junction');
  return dir;
}

function buildCopy(dir: string) {
  const result = spawnSync(process.execPath, [astro, 'build'], {
    cwd: dir,
    encoding: 'utf8',
    env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' },
  });
  expect(result.status, `${result.stdout}${result.stderr}`).toBe(0);
  return {
    headers: readFileSync(join(dir, 'dist/_headers'), 'utf8'),
    page: readFileSync(join(dir, 'dist/index.html'), 'utf8'),
  };
}

/** The inline script text of a built page as the browser sees it (parse5, CRLF → LF). */
function inlineScript(html: string): string {
  const head = parse(html).childNodes.find((n) => 'tagName' in n && n.tagName === 'html');
  const found: string[] = [];
  const walk = (node: unknown) => {
    const n = node as { tagName?: string; attrs?: { name: string }[]; childNodes?: unknown[] };
    if (
      n.tagName === 'script' &&
      !n.attrs?.some((a) => a.name === 'src') &&
      !n.attrs?.some(
        (a) => a.name === 'type' && (a as { value?: string }).value === 'application/ld+json',
      )
    )
      found.push((n.childNodes ?? []).map((c) => (c as { value?: string }).value ?? '').join(''));
    n.childNodes?.forEach(walk);
  };
  walk(head);
  expect(found).toHaveLength(1);
  return found[0] ?? '';
}

describe('a rebuild after editing the bootstrap (AC-12, review 2026-10-02 F-03)', () => {
  it('delivers the new hash with no other edit, and drops the old one', () => {
    const dir = siteCopy();
    const file = join(dir, 'src/scripts/theme-bootstrap.js');
    const before = readFileSync(file, 'utf8');
    const after = `${before};`; // one character more: an empty statement
    writeFileSync(file, after);
    const { headers, page } = buildCopy(dir);
    expect(headers).toContain(sha256(after));
    expect(headers).not.toContain(sha256(before));
    expect(sha256(inlineScript(page))).toBe(sha256(after));
  });

  it('a bootstrap saved with CRLF line endings still matches its delivered hash (F-17)', () => {
    const dir = siteCopy();
    const file = join(dir, 'src/scripts/theme-bootstrap.js');
    const lf = readFileSync(file, 'utf8').replaceAll(';', ';\n').trimEnd();
    writeFileSync(file, lf.replaceAll('\n', '\r\n'));
    const { headers, page } = buildCopy(dir);
    const delivered = inlineScript(page);
    expect(delivered).toBe(lf);
    expect(headers).toContain(sha256(delivered));
  });
});
