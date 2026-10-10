import { copyFileSync, mkdirSync, mkdtempSync, appendFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { cvPdf } from '../src/data/cv/index.ts';
import { checkCvPdf } from './check-cv-pdf.ts';

// AC-25: a CV PDF changed without its recorded checksum fails and names the file and the CV page.

const publicDir = new URL('../public', import.meta.url).pathname.replace(/^\/(\w:)/, '$1');

function fixture(): string {
  const dir = mkdtempSync(join(tmpdir(), 'cv-pdf-'));
  mkdirSync(join(dir, 'cv'));
  for (const lang of ['en', 'no'] as const) {
    const href = cvPdf[lang].href;
    copyFileSync(join(publicDir, href), join(dir, href));
  }
  return dir;
}

describe('CV PDF checksum (AC-25)', () => {
  it('passes on the recorded files', () => {
    expect(checkCvPdf(publicDir)).toEqual([]);
  });

  it('passes on an unchanged copy', () => {
    expect(checkCvPdf(fixture())).toEqual([]);
  });

  it.each([
    ['en', 'alexander-ponomarenko-cv-en.pdf', '/cv/en'],
    ['no', 'alexander-ponomarenko-cv-no.pdf', '/cv/no'],
  ] as const)('fails and names the file and the CV page when %s changed', (lang, file, page) => {
    const dir = fixture();
    appendFileSync(join(dir, cvPdf[lang].href), 'changed');
    const problems = checkCvPdf(dir);
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain(file);
    expect(problems[0]).toContain(page);
  });

  it('fails for both files when both changed', () => {
    const dir = fixture();
    appendFileSync(join(dir, cvPdf.en.href), 'changed');
    appendFileSync(join(dir, cvPdf.no.href), 'changed');
    expect(checkCvPdf(dir)).toHaveLength(2);
  });
});
