// CV date and the two CV PDFs (sad §5, AC-05, AC-25). Owner confirms the date in the Claims list.
import type { CvLang, CvPdf } from './types.ts';

export const cvDate = '2026-09-30';

function images(lang: CvLang): CvPdf['images'] {
  return [1, 2].map((n) => ({
    src: `/cv/cv-${lang}-${n}.webp`,
    width: 1240,
    height: 1754,
  })) as CvPdf['images'];
}

export const cvPdf: Record<CvLang, CvPdf> = {
  en: {
    href: '/cv/alexander-ponomarenko-cv-en.pdf',
    downloadName: 'Alexander_Ponomarenko_CV_EN.pdf',
    sha256: '30c311a0ac2b0a864617e528e0d0d961bd41077b5f5742d81925052a28e137d8',
    images: images('en'),
  },
  no: {
    href: '/cv/alexander-ponomarenko-cv-no.pdf',
    downloadName: 'Alexander_Ponomarenko_CV_NO.pdf',
    sha256: '57e91368e7bcf6b8abbbaaa91733ba89dd97347143c5063ffe7cdfe56dd95e69',
    images: images('no'),
  },
};
