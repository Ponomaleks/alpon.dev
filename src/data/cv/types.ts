// Types of the CV data (sad §5). One `Cv` per CV language.
import type { CvSectionId } from './sections.ts';

export type CvLang = 'en' | 'no';

export interface DatedRow {
  /** Date or date range as printed, e.g. "Nov 2022 – Jan 2026". */
  period: string;
  title: string;
  organisation?: string;
  note?: string;
  /** Language of the organisation's name when it differs from the page. */
  lang?: string;
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

export interface PersonalProject {
  title: string;
  stack: string;
  text: string;
  href: string;
}

export interface CvJob {
  role: string;
  employer: string;
  /** Note after the employer name, e.g. a company description or the country. */
  employerNote?: string;
  period: string;
  /** Plain paragraphs, for a job without projects. */
  paragraphs?: string[];
  clientProjects?: ClientProject[];
  internalProjects?: ClientProject[];
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
  /** Muted note above the personal projects. */
  note?: string;
  projects?: PersonalProject[];
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
  /** Page meta line, e.g. "PDF · 2 pages · A4". */
  meta: string;
  /** Label of the side-column contact block. */
  contact: string;
  /** Label before each client project's technologies. */
  appliedTechnologies: string;
  /** Eyebrow above the internal projects of a job. */
  internalProjects: string;
}

export interface Cv {
  lang: CvLang;
  title: string;
  description: string;
  /** Town line under the name, e.g. "1482 Nittedal, Norway". */
  location: string;
  /** Work permit line. */
  permit: string;
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
