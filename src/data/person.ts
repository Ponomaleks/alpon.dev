import type { Contact } from './contact.ts';

// Structured Person data (schema.org) for the home page. Every fact comes from contact.ts.

export function buildPerson(c: Contact) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: c.name,
    jobTitle: 'Software Engineer',
    email: c.email,
    telephone: c.phone,
    address: {
      '@type': 'PostalAddress',
      addressLocality: c.workRegionGeo.locality,
      addressCountry: c.workRegionGeo.country,
    },
    sameAs: [c.linkedin, c.github],
  };
}
