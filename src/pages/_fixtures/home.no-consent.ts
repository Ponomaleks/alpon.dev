// Fixture for src/pages/_index.test.ts (AC-10): the home data with a single Recommendation whose
// author has not agreed to it being shown. Everything else is the real content.
import { visibleRecommendations as visible, type Recommendation } from '../../data/home';

export * from '../../data/home';

export const recommendations: Recommendation[] = [
  {
    name: 'Fixture Person',
    role: 'Fixture role, Fixture company',
    quote: 'A fixture quote that nobody agreed to show.',
    consent: false,
    profile: 'https://example.com/in/fixture-person/',
    date: 'January 1, 2026',
    relationship: 'Fixture relationship',
  },
];

export function visibleRecommendations(list: Recommendation[] = recommendations): Recommendation[] {
  return visible(list);
}
