// CV PDF check (cv AC-25). Hashes the two CV PDFs and compares with the sha256 in the CV data.
// A changed file fails and names the file and the CV page whose text to check. No text is extracted.
//
// Run from the repo root: node scripts/check-cv-pdf.ts

import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { cvPdf } from '../src/data/cv/index.ts';

const pages = { en: '/cv/en', no: '/cv/no' } as const;

/** Problems for the CV PDFs found under `publicDir`; empty when every checksum matches. */
export function checkCvPdf(publicDir: string): string[] {
  const problems: string[] = [];
  for (const lang of ['en', 'no'] as const) {
    const { href, sha256 } = cvPdf[lang];
    const file = join(publicDir, href);
    const name = href.split('/').pop();
    if (!existsSync(file)) {
      problems.push(`${name} is missing: restore it, then check the text of ${pages[lang]}`);
      continue;
    }
    const actual = createHash('sha256').update(readFileSync(file)).digest('hex');
    if (actual !== sha256)
      problems.push(
        `${name} changed (sha256 ${actual}, recorded ${sha256}): update the sha256 in src/data/cv/index.ts and check the text of ${pages[lang]} against the new file`,
      );
  }
  return problems;
}

if (import.meta.main) {
  const problems = checkCvPdf('public');
  if (problems.length > 0) {
    console.error(`CV PDF check failed:\n  ${problems.join('\n  ')}`);
    process.exit(1);
  }
  console.log('cv: both CV PDFs match the recorded checksums');
}
