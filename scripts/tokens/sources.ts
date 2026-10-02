import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// The read-only design sources the generator reads (ADR-0001). design/ is never written.

export interface Sources {
  /** design/handoff/design-system/project/tokens/*.css, in cascade order. */
  handoff: { colors: string; spacing: string; typography: string; motion: string };
  /** design/brand/tokens.json: the core palette, which wins on conflict (BRAND.md). */
  brand: { color: Record<string, { hex: string }> };
}

export const HANDOFF_DIR = 'design/handoff/design-system/project/tokens';
export const BRAND_FILE = 'design/brand/tokens.json';

export function readSources(root: string): Sources {
  const handoff = (name: string) => readFileSync(join(root, HANDOFF_DIR, `${name}.css`), 'utf8');
  return {
    handoff: {
      colors: handoff('colors'),
      spacing: handoff('spacing'),
      typography: handoff('typography'),
      motion: handoff('motion'),
    },
    brand: JSON.parse(readFileSync(join(root, BRAND_FILE), 'utf8')) as Sources['brand'],
  };
}
