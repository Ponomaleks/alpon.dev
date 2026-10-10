import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { cvDate, cvPdf } from './index.ts';
import { cvSectionIds } from './sections.ts';

// AC-05: download names and the CV date. sad §5: eight shared section ids in order (ADR-0001).

const publicDir = new URL('../../../public', import.meta.url);

describe('cvPdf (AC-05)', () => {
  it('names the downloads in the CV language', () => {
    expect(cvPdf.en.downloadName).toBe('Alexander_Ponomarenko_CV_EN.pdf');
    expect(cvPdf.no.downloadName).toBe('Alexander_Ponomarenko_CV_NO.pdf');
  });

  it('links the existing CV PDF addresses', () => {
    expect(cvPdf.en.href).toBe('/cv/alexander-ponomarenko-cv-en.pdf');
    expect(cvPdf.no.href).toBe('/cv/alexander-ponomarenko-cv-no.pdf');
  });

  it('records a sha256 for each file', () => {
    expect(cvPdf.en.sha256).toMatch(/^[0-9a-f]{64}$/);
    expect(cvPdf.no.sha256).toMatch(/^[0-9a-f]{64}$/);
  });

  it.each(['en', 'no'] as const)('has two page images for %s that exist in public/cv', (lang) => {
    const images = cvPdf[lang].images;
    expect(images).toHaveLength(2);
    for (const image of images) {
      expect(image.width).toBeGreaterThan(0);
      expect(image.height).toBeGreaterThan(0);
      expect(existsSync(new URL(`.${image.src}`, `${publicDir.href}/`))).toBe(true);
    }
  });

  it('has the CV date as a calendar date', () => {
    expect(cvDate).toBe('2026-09-30');
  });
});

describe('section ids (ADR-0001)', () => {
  it('are the eight of sad §5, in order', () => {
    expect([...cvSectionIds]).toEqual([
      'profile',
      'skills',
      'languages',
      'experience',
      'projects',
      'education',
      'courses',
      'community',
    ]);
  });
});
