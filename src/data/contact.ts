// Contacts live here and only here (contact block, footer, shell). The static vCard
// public/alexander-ponomarenko.vcf must match; scripts/check-contact.ts enforces it.

export interface Contact {
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  /** Region of work (hero, contacts, vCard ADR). Not the place of residence. */
  workRegion: string;
  /** Place of residence (footer "Based in", CV). Coordinates at two decimals. */
  residence: { name: string; lat: number; lon: number };
  /** ISO date (YYYY-MM-DD), checked by scripts/check-contact.ts. */
  lastUpdated: string;
  links: { cv: string; contact: string; cvEn: string; cvNo: string };
}

export const contact: Contact = {
  email: 'ponomaleks@gmail.com',
  phone: '+47 405 94 584',
  linkedin: 'https://www.linkedin.com/in/ponomalex/',
  github: 'https://github.com/ponomaleks',
  workRegion: 'Oslo, Norge',
  residence: { name: 'Nittedal, Norge', lat: 60.07, lon: 10.87 },
  lastUpdated: '2026-10-04',
  links: {
    cv: '/cv',
    contact: '/#contact',
    cvEn: '/cv/alexander-ponomarenko-cv-en.pdf',
    cvNo: '/cv/alexander-ponomarenko-cv-no.pdf',
  },
};
