import { describe, expect, it } from 'vitest';
import { numberSections } from './sections';

// AC-10, AC-11, D-05 (sad §8 Home content). Sections are numbered from the ones that are
// rendered: About, Selected projects (dormant), Experience, Recommendations, Contact.

const combos = [
  { projects: false, recommendations: false },
  { projects: false, recommendations: true },
  { projects: true, recommendations: false },
  { projects: true, recommendations: true },
];

describe('numberSections', () => {
  it('numbers About 01, Experience 02 and Contact 03 without Recommendations and projects', () => {
    expect(numberSections({ projects: false, recommendations: false })).toEqual({
      about: '01',
      experience: '02',
      contact: '03',
    });
  });

  it('puts Recommendations at 03 and Contact at 04 when a Recommendation is rendered', () => {
    expect(numberSections({ projects: false, recommendations: true })).toEqual({
      about: '01',
      experience: '02',
      recommendations: '03',
      contact: '04',
    });
  });

  it('puts Selected projects between About and Experience when rendered', () => {
    expect(numberSections({ projects: true, recommendations: false })).toEqual({
      about: '01',
      projects: '02',
      experience: '03',
      contact: '04',
    });
    expect(numberSections({ projects: true, recommendations: true })).toEqual({
      about: '01',
      projects: '02',
      experience: '03',
      recommendations: '04',
      contact: '05',
    });
  });

  it.each(combos)('has no gap and no duplicate for %o', (flags) => {
    const nums = Object.values(numberSections(flags)).map(Number);
    expect(nums).toEqual(nums.map((_, i) => i + 1));
  });

  it('leaves out the keys of sections that are not rendered', () => {
    const none = numberSections({ projects: false, recommendations: false });
    expect(none).not.toHaveProperty('projects');
    expect(none).not.toHaveProperty('recommendations');
  });
});
