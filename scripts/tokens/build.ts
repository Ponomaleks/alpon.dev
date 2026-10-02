// Writes src/styles/tokens.css from the design sources (fjord-foundation ADR-0001).
// Run from the repo root: node scripts/tokens/build.ts

import { writeFileSync } from 'node:fs';
import { generateTokens } from './generate.ts';
import { readSources } from './sources.ts';

export const OUTPUT = 'src/styles/tokens.css';

writeFileSync(OUTPUT, generateTokens(readSources('.')));
console.log(`wrote ${OUTPUT}`);
