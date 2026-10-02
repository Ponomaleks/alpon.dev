// Writes src/styles/tokens.css from the design sources (fjord-foundation ADR-0001).
// Run from the repo root: node scripts/tokens/build.ts [--check]
// --check regenerates in memory and fails, naming the file, when the committed copy is stale.

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { generateTokens } from './generate.ts';
import { readSources } from './sources.ts';

const OUTPUT = 'src/styles/tokens.css';
const fresh = generateTokens(readSources('.'));

if (process.argv.includes('--check')) {
  // git may check the file out with CRLF on Windows; the content is what counts.
  const committed = existsSync(OUTPUT) ? readFileSync(OUTPUT, 'utf8').replace(/\r\n/g, '\n') : null;
  if (committed !== fresh) {
    const state = committed === null ? 'missing' : 'stale';
    console.error(`${OUTPUT} is ${state}: run \`npm run tokens:build\` and commit it.`);
    process.exit(1);
  }
} else {
  writeFileSync(OUTPUT, fresh);
  console.log(`wrote ${OUTPUT}`);
}
