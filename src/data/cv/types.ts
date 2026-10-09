// Types of the CV data (sad §5). One `Cv` per CV language.
import type { CvSectionId } from './sections.ts';

export type CvLang = 'en' | 'no';

export interface DatedRow {
  /** Date or date range as printed, e.g. "Nov 2022 – Jan 2026". */
  period: string;
  title: string;
  detail?: string;
}

export interface SkillGroup {
  label: string;
  items: string[];
}

export interface ClientProject {
  name: string;
  period?: string;
  description: string;
  stack?: string[];
}

export interface CvJob {
  role: string;
  employer: string;
  period: string;
  summary?: string;
  bullets: string[];
  stack?: string[];
}

export interface CvLanguageLevel {
  language: string;
  /** Plain self-assessed label, never a CEFR code. */
  level: string;
}

export interface CvSection {
  id: CvSectionId;
  heading: string;
  paragraphs?: string[];
  skillGroups?: SkillGroup[];
  languages?: CvLanguageLevel[];
  jobs?: CvJob[];
  projects?: ClientProject[];
  rows?: DatedRow[];
}

/** Page labels (breadcrumbs, buttons, headings) in the CV language. */
export interface CvLabels {
  pageName: string;
  contents: string;
  downloadCv: string;
  print: string;
  viewOriginalPdf: string;
  hideOriginalPdf: string;
  lastUpdated: string;
}

export interface Cv {
  lang: CvLang;
  title: string;
  description: string;
  labels: CvLabels;
  sections: CvSection[];
}

export interface CvPageImage {
  src: string;
  width: number;
  height: number;
}

export interface CvPdf {
  href: string;
  downloadName: string;
  /** sha256 of the file, checked by scripts/check-cv-pdf.ts (AC-25). */
  sha256: string;
  images: [CvPageImage, CvPageImage];
}
