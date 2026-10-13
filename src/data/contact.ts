// Contacts live here and only here (contact block, footer, shell). The static vCard
// public/alexander-ponomarenko.vcf must match; scripts/check-contact.ts enforces it.

export interface Contact {
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  /** Region of work (hero, contacts, vCard ADR). Not the place of residence. */
  workRegion: string;
  /** Structured Work region (Person data, vCard ADR check). Coordinates at two decimals. */
  workRegionGeo: { locality: string; country: string; lat: number; lon: number };
  /** Place of residence (footer "Based in", CV). Coordinates at two decimals. */
  residence: { name: string; lat: number; lon: number };
  /** ISO date (YYYY-MM-DD), checked by scripts/check-contact.ts. */
  lastUpdated: string;
  links: {
    cv: string;
    cvPages: { en: string; no: string };
    contact: string;
    cvEn: string;
    cvNo: string;
    recommendations: string;
  };
}

export const contact: Contact = {
  name: 'Alexander Ponomarenko',
  email: 'ponomaleks@gmail.com',
  phone: '+47 405 94 584',
  linkedin: 'https://www.linkedin.com/in/ponomalex/',
  github: 'https://github.com/ponomaleks',
  workRegion: 'Oslo, Norge',
  workRegionGeo: { locality: 'Oslo', country: 'NO', lat: 59.91, lon: 10.75 },
  residence: { name: 'Nittedal, Norge', lat: 60.07, lon: 10.87 },
  lastUpdated: '2026-10-04',
  links: {
    cv: '/cv/en',
    cvPages: { en: '/cv/en', no: '/cv/no' },
    contact: '/#contact',
    cvEn: '/cv/alexander-ponomarenko-cv-en.pdf',
    cvNo: '/cv/alexander-ponomarenko-cv-no.pdf',
    // The recommendations on the LinkedIn profile (home AC-09).
    recommendations: 'https://www.linkedin.com/in/ponomalex/details/recommendations/',
  },
};
