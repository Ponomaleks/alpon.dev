import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

// A real production build of the site into a throwaway directory, for build-output tests.

export const repo = fileURLToPath(new URL('../../', import.meta.url));

export interface SiteBuild {
  out: string;
  status: number | null;
  log: string;
  cleanup: () => void;
}

export function buildSite(args: string[] = [], env: Record<string, string> = {}): SiteBuild {
  const dir = mkdtempSync(join(tmpdir(), 'fjord-build-'));
  const out = join(dir, 'dist');
  const result = spawnSync(
    process.execPath,
    [join(repo, 'node_modules/astro/bin/astro.mjs'), 'build', '--outDir', out, ...args],
    {
      cwd: repo,
      encoding: 'utf8',
      env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1', ...env },
    },
  );
  return {
    out,
    status: result.status,
    log: `${result.stdout}${result.stderr}`,
    cleanup: () => rmSync(dir, { recursive: true, force: true }),
  };
}
