import { describe, expect, it } from 'vitest';
import { contact } from '../contact.ts';
import { cvEn } from './en.ts';
import { cvSectionIds } from './sections.ts';

// AC-01, AC-03, AC-26: the English CV data. Owner decisions: owner-inputs.md table 1.1 (EN-01..EN-13, C-24, C-25).

function strings(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === 'object') return Object.values(value).flatMap(strings);
  return [];
}

const section = (id: string) => cvEn.sections.find((s) => s.id === id);

describe('cvEn sections (AC-01)', () => {
  it('has the eight sections in the order of sections.ts', () => {
    expect(cvEn.lang).toBe('en');
    expect(cvEn.sections.map((s) => s.id)).toEqual([...cvSectionIds]);
  });

  it('uses sentence-case headings (EN-01)', () => {
    expect(section('experience')?.heading).toBe('Work experience');
    expect(section('projects')?.heading).toBe('Personal projects');
    expect(section('community')?.heading).toBe('Community & volunteering');
  });
});

describe('cvEn languages (AC-03)', () => {
  it('lists the three plain levels (EN-02)', () => {
    expect(section('languages')?.languages).toEqual([
      { language: 'English', level: 'Upper-intermediate' },
      { language: 'Norwegian', level: 'Intermediate' },
      { language: 'Ukrainian', level: 'Native' },
    ]);
  });
});

describe('cvEn text rules (AC-26)', () => {
  it('holds no bracketed placeholder', () => {
    for (const s of strings(cvEn)) expect(s).not.toMatch(/\[[^\]]*…?[^\]]*\]/);
  });

  it('holds no CEFR code', () => {
    for (const s of strings(cvEn)) expect(s).not.toMatch(/\b[ABC][12]\b/);
  });

  it('has a title and a description (C-24, C-25)', () => {
    expect(cvEn.title).toBe('CV · Alexander Ponomarenko');
    // The text the Owner approved on 2026-10-12 (release-1 AC-07, AC-08): it does not repeat the
    // name, which the title and the preview image already show.
    expect(cvEn.description).toBe(
      'Frontend developer with backend experience: skills, work experience and education. Read it here or download the PDF.',
    );
    expect(cvEn.description).not.toMatch(/Alexander|Ponomarenko/);
  });

  it('names the town of the Residence in the location line', () => {
    const town = contact.residence.name.split(',')[0];
    expect(cvEn.location).toContain(town);
  });

  it('marks no job as current (EN-12)', () => {
    const jobs = section('experience')?.jobs ?? [];
    expect(jobs).toHaveLength(2);
    for (const job of jobs) expect(job).not.toHaveProperty('current');
  });

  it('prints periods with capitalised months and an en dash (EN-03)', () => {
    const jobs = section('experience')?.jobs ?? [];
    expect(jobs.map((j) => j.period)).toEqual(['Nov 2022 – Jan 2026', 'Dec 2010 – Nov 2021']);
    expect(section('courses')?.rows?.[0]?.period).toBe('Feb 2026 –');
  });

  it('moves "EPAM IT Marathons" into the title of internal project 1 (EN-06)', () => {
    // Types are extended by T5: CvJob.internalProjects holds the internal projects of a job.
    const projects = section('experience')?.jobs?.[0]?.internalProjects ?? [];
    expect(projects[0]?.name).toBe('EPAM IT Marathons (2023 – 2025)');
    expect(projects[0]?.description).toMatch(
      /^Progressed from Angular Developer to Angular Team Lead and Technical Expert, building MVPs/,
    );
    expect(projects[0]?.description).not.toContain('across EPAM IT Marathons');
  });

  it('uses typographic apostrophes everywhere (EN-11)', () => {
    for (const s of strings(cvEn)) expect(s).not.toContain("'");
  });
});
