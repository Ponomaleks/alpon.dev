import { describe, expect, it } from 'vitest';
import { cvEn } from './en.ts';
import { cvNo } from './no.ts';
import { cvSectionIds } from './sections.ts';

// AC-02, AC-03, AC-26: the Norwegian CV data. Owner decisions: owner-inputs.md table 1.2 (NO-01..NO-13, C-26..C-33).

function strings(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === 'object') return Object.values(value).flatMap(strings);
  return [];
}

const section = (id: string) => cvNo.sections.find((s) => s.id === id);

describe('cvNo sections (AC-02)', () => {
  it('has section ids that are a subset of sections.ts, in its order', () => {
    expect(cvNo.lang).toBe('no');
    const ids = cvNo.sections.map((s) => s.id);
    expect(ids).toEqual(cvSectionIds.filter((id) => ids.includes(id)));
  });

  it('has all eight sections (NO-04)', () => {
    expect(cvNo.sections.map((s) => s.id)).toEqual([...cvSectionIds]);
  });

  it('uses the Norwegian headings (NO-04)', () => {
    expect(cvNo.sections.map((s) => s.heading)).toEqual([
      'Profil',
      'Kompetanse',
      'Språk',
      'Arbeidserfaring',
      'Personlige prosjekter',
      'Utdanning',
      'Kurs',
      'Samfunnsengasjement og frivillig arbeid',
    ]);
  });

  it('has the Norwegian page labels (AC-02, C-32)', () => {
    const labels = strings(cvNo.labels);
    for (const l of [
      'Last ned PDF',
      'Ta kontakt',
      'Skriv ut',
      'På denne siden',
      'Se original-PDF',
      'Sist oppdatert',
      'PDF · 2 sider · A4',
      'Kopier',
      'Kopiert',
      'CV-språk',
    ]) {
      expect(labels).toContain(l);
    }
  });

  it('has the Norwegian labels of screens C-3 (C-28..C-31)', () => {
    const labels = strings(cvNo.labels);
    for (const l of [
      'E-post',
      'Telefon',
      'LinkedIn',
      'GitHub',
      'Bosted',
      'Brødsmulesti',
      'Kunne ikke kopiere. Marker adressen for å kopiere den.',
      'CV, side 1 av 2, norsk, PDF, åpnes i ny fane',
      'CV, side 2 av 2, norsk, PDF, åpnes i ny fane',
      'Teknologier',
      'Interne prosjekter',
    ]) {
      expect(labels).toContain(l);
    }
  });
});

describe('cvNo jobs and projects (NO-01..NO-03, NO-12)', () => {
  it('has three paragraphs in the insurance job, the new one first (NO-01)', () => {
    const job = section('experience')?.jobs?.[1];
    expect(job?.paragraphs).toHaveLength(3);
    expect(job?.paragraphs?.[0]).toBe(
      'Ledet en agenturgruppe gjennom alle de elleve årene og økte eget salg 20 ganger.',
    );
  });

  it('has one personal project and its note (NO-02, NO-03, C-33)', () => {
    const projects = section('projects');
    expect(projects?.projects).toHaveLength(1);
    expect(projects?.projects?.[0]?.title).toBe('Async Contacts REST API');
    expect(projects?.note).toBe('Backend-praksis ved siden av frontendarbeid');
  });

  it('has the three community lines (NO-04)', () => {
    expect(section('community')?.paragraphs).toEqual([
      'Valgt medlem av et lokalt kommunestyre; drev regionale ungdoms- og samfunnsprogrammer.',
      'Organiserte engelskkurs for fordrevne barn.',
      'Fosterhjem for dyr og dyrevelferdsarbeid.',
    ]);
  });

  it('marks no job as current (NO-12)', () => {
    const jobs = section('experience')?.jobs ?? [];
    expect(jobs).toHaveLength(2);
    for (const job of jobs) expect(job).not.toHaveProperty('current');
  });
});

describe('cvNo languages (AC-03)', () => {
  it('lists the three plain Norwegian levels (NO-08)', () => {
    expect(section('languages')?.languages).toEqual([
      { language: 'Engelsk', level: 'Øvre mellomnivå' },
      { language: 'Norsk', level: 'Mellomnivå' },
      { language: 'Ukrainsk', level: 'Morsmål' },
    ]);
  });
});

describe('cvNo text rules (AC-26)', () => {
  it('holds no bracketed placeholder', () => {
    for (const s of strings(cvNo)) expect(s).not.toMatch(/\[[^\]]*…?[^\]]*\]/);
  });

  it('holds no CEFR code', () => {
    for (const s of strings(cvNo)) expect(s).not.toMatch(/\b[ABC][12]\b/);
  });

  it('has a title and a description that differ from the English ones (C-26, C-27)', () => {
    expect(cvNo.title).toBe('CV (norsk) · Alexander Ponomarenko');
    // The text the Owner approved on 2026-10-12 (release-1 AC-07, AC-08), without the name.
    expect(cvNo.description).toBe(
      'Frontend-utvikler med backend-erfaring: kompetanse, arbeidserfaring og utdanning. Les CV-en her eller last ned PDF-en.',
    );
    expect(cvNo.description).not.toMatch(/Alexander|Ponomarenko/);
    expect(cvNo.title).not.toBe(cvEn.title);
    expect(cvNo.description).not.toBe(cvEn.description);
  });
});
