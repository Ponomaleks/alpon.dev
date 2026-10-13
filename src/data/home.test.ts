import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  experience,
  intro,
  keyFacts,
  nowLine,
  nowProject,
  quickFacts,
  recommendations,
  visibleRecommendations,
  type Recommendation,
} from './home';
import { features } from './site';

// AC-03, AC-05, AC-07, AC-09, AC-10, AC-11 (sad §8 Home content).

const rec = (name: string, consent: boolean): Recommendation => ({
  name,
  role: 'Role, company',
  quote: `Quote of ${name}, kept word for word. Oleksandr \u2014 Alexander.`,
  consent,
  source: 'linkedin',
  profile: 'https://example.com/in/someone/',
  date: 'January 1, 2026',
  relationship: 'Worked with Alexander',
});

/** The Recommendations of owner-inputs.md: the fields, and the quote between its quotation marks. */
function ownerInputs() {
  const file = new URL('../../docs/features/home/owner-inputs.md', import.meta.url);
  const source = readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
  return source
    .split(/^### Recommendation \d+$/m)
    .slice(1)
    .map((block) => {
      const field = (name: string) =>
        block.match(new RegExp(`^- \\*\\*${name}:\\*\\* (.+)$`, 'm'))?.[1] ?? '';
      return {
        name: field('Name'),
        role: field('Role'),
        profile: field('Profile'),
        date: field('Date'),
        relationship: field('Relationship'),
        consent: field('Consent'),
        quote: block.match(/^Quote:\n\n"([\s\S]*)"\s*$/m)?.[1] ?? '',
      };
    });
}

function strings(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === 'object') return Object.values(value).flatMap(strings);
  return [];
}

describe('visibleRecommendations', () => {
  it('leaves out an entry without consent and does not change the others', () => {
    const agreed = rec('Agreed', true);
    const copy = structuredClone(agreed);
    const result = visibleRecommendations([agreed, rec('Silent', false)]);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(copy);
    expect(result[0]?.quote).toBe(copy.quote);
  });

  it('returns nothing when no entry has consent', () => {
    expect(visibleRecommendations([rec('A', false), rec('B', false)])).toEqual([]);
    expect(visibleRecommendations([])).toEqual([]);
  });

  it('holds the two Recommendations of owner-inputs.md, both with consent', () => {
    const inputs = ownerInputs();
    expect(inputs).toHaveLength(2);
    expect(recommendations).toHaveLength(2);
    expect(visibleRecommendations()).toEqual(recommendations);
    recommendations.forEach((r, i) => {
      const input = inputs[i];
      expect(input?.consent).toBe('true');
      expect(r.consent).toBe(true);
      expect(r.name).toBe(input?.name);
      expect(r.role).toBe(input?.role);
      expect(r.profile).toBe(input?.profile);
      expect(r.date).toBe(input?.date);
      expect(r.relationship).toBe(input?.relationship);
    });
  });

  it('keeps each quote character for character as owner-inputs.md has it', () => {
    const inputs = ownerInputs();
    recommendations.forEach((r, i) => {
      const quote = inputs[i]?.quote ?? '';
      expect(quote.length).toBeGreaterThan(200);
      expect(quote).toContain('\n\n');
      expect(r.quote).toBe(quote);
    });
  });
});

describe('nowLine', () => {
  it('shows the project first, then the MSc part, when a project is supplied', () => {
    expect(nowLine('alpon.dev')).toBe('alpon.dev \u00b7 MSc Computer Science at Woolf University');
  });

  it('shows only the MSc part without a project', () => {
    expect(nowLine(undefined)).toBe('MSc Computer Science at Woolf University');
    expect(nowLine('')).toBe('MSc Computer Science at Woolf University');
  });

  it('never returns square brackets in either state', () => {
    for (const line of [nowLine('alpon.dev'), nowLine(undefined), nowLine()]) {
      expect(line).not.toMatch(/[[\]]/);
    }
  });

  it('gives alpon.dev first for the repo data', () => {
    expect(nowProject).toBe('alpon.dev');
    expect(nowLine()).toBe('alpon.dev \u00b7 MSc Computer Science at Woolf University');
  });
});

describe('home content', () => {
  it('has four key facts with value, label and context', () => {
    expect(keyFacts).toHaveLength(4);
    for (const fact of keyFacts) {
      expect(fact.label).toBeTruthy();
      expect(fact.context).toBeTruthy();
      expect(fact.value).toBeDefined();
    }
  });

  it('has four experience entries, the first open and none marked current', () => {
    expect(experience).toHaveLength(4);
    expect(experience[0]?.open).toBe(true);
    expect(experience.slice(1).some((e) => e.open)).toBe(false);
    // Every period has an end (the most recent job ended in January 2026), so no entry is current.
    expect(experience.filter((e) => e.current)).toHaveLength(0);
  });

  it('holds no square bracket in any value', () => {
    const all = strings([intro, quickFacts, keyFacts, experience, nowProject, recommendations]);
    expect(all.length).toBeGreaterThan(10);
    for (const s of all) expect(s).not.toMatch(/[[\]]/);
  });

  it('shows the plain language labels with no level codes', () => {
    const languages = quickFacts.find((q) => q.k === 'Languages');
    // One entry per language, so each is shown on its own line (Owner decision, 2026-10-07).
    expect(languages?.v).toEqual([
      'English, upper-intermediate',
      'Norwegian, intermediate',
      'Ukrainian, native',
    ]);
    for (const s of strings([quickFacts, intro])) expect(s).not.toMatch(/\b[ABC][12]\b/);
  });

  it('keeps contact facts out of home.ts', () => {
    const all = strings([intro, quickFacts, keyFacts, experience]).join('\n');
    expect(all).not.toMatch(/ponomaleks@gmail\.com|\+47 405/);
  });
});

describe('features', () => {
  it('keeps the projects switch off until step 7', () => {
    expect(features.projects).toBe(false);
  });
});
