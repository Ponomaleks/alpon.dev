import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

// The read-only design sources the generator reads (ADR-0001). design/ is never written.

const TOKEN_FILES = ['colors', 'spacing', 'typography', 'motion'] as const;

export interface Sources {
  /**
   * design/handoff/design-system/project/tokens/*.css, in cascade order, plus `usage`: every
   * other handoff CSS file (base, components), where tokens are used, e.g. inside scale().
   */
  handoff: Record<(typeof TOKEN_FILES)[number] | 'usage', string>;
  /** design/brand/tokens.json: the core palette, which wins on conflict (BRAND.md). */
  brand: { color: Record<string, { hex: string }> };
}

export const HANDOFF_PROJECT = 'design/handoff/design-system/project';
export const HANDOFF_DIR = `${HANDOFF_PROJECT}/tokens`;
export const BRAND_FILE = 'design/brand/tokens.json';

export function readSources(root: string): Sources {
  const handoff = (name: string) => readFileSync(join(root, HANDOFF_DIR, `${name}.css`), 'utf8');
  const tokenFiles = new Set(TOKEN_FILES.map((name) => `tokens/${name}.css`));
  const usage = readdirSync(join(root, HANDOFF_PROJECT), { recursive: true, encoding: 'utf8' })
    .map((file) => file.replaceAll('\\', '/'))
    .filter((file) => file.endsWith('.css') && !tokenFiles.has(file))
    .sort()
    .map((file) => readFileSync(join(root, HANDOFF_PROJECT, file), 'utf8'))
    .join('\n');
  return {
    handoff: {
      colors: handoff('colors'),
      spacing: handoff('spacing'),
      typography: handoff('typography'),
      motion: handoff('motion'),
      usage,
    },
    brand: JSON.parse(readFileSync(join(root, BRAND_FILE), 'utf8')) as Sources['brand'],
  };
}
