import { describe, expect, it } from 'vitest';
import { contact, type Contact } from './contact.ts';
import { buildPerson } from './person.ts';

// AC-26: structured Person data (name, job title, email, phone, address Oslo NO, sameAs).
// AC-27: every fact comes from contact.ts.

describe('buildPerson (AC-26, AC-27)', () => {
  it('describes a Person with the role Software Engineer', () => {
    const p = buildPerson(contact);
    expect(p['@context']).toBe('https://schema.org');
    expect(p['@type']).toBe('Person');
    expect(p.jobTitle).toBe('Software Engineer');
    expect(p.name).toBe('Alexander Ponomarenko');
  });

  it('has the address Oslo, NO', () => {
    const p = buildPerson(contact);
    expect(p.address['@type']).toBe('PostalAddress');
    expect(p.address.addressLocality).toBe('Oslo');
    expect(p.address.addressCountry).toBe('NO');
  });

  it('sameAs holds both profile addresses', () => {
    expect(buildPerson(contact).sameAs).toEqual([contact.linkedin, contact.github]);
  });

  it('reads email and phone from contact.ts', () => {
    const p = buildPerson(contact);
    expect(p.email).toBe(contact.email);
    expect(p.telephone).toBe(contact.phone);
  });

  it('changing a contact value changes the matching output field', () => {
    const changed: Contact = {
      ...contact,
      email: 'other@example.com',
      phone: '+47 000 00 000',
      linkedin: 'https://www.linkedin.com/in/someone-else/',
      github: 'https://github.com/someone-else',
      workRegionGeo: { ...contact.workRegionGeo, locality: 'Bergen', country: 'SE' },
    };
    const p = buildPerson(changed);
    expect(p.email).toBe('other@example.com');
    expect(p.telephone).toBe('+47 000 00 000');
    expect(p.sameAs).toEqual([
      'https://www.linkedin.com/in/someone-else/',
      'https://github.com/someone-else',
    ]);
    expect(p.address.addressLocality).toBe('Bergen');
    expect(p.address.addressCountry).toBe('SE');
  });

  it('the Work region coordinates are 59.91, 10.75 and the residence is untouched', () => {
    expect(contact.workRegionGeo).toMatchObject({
      locality: 'Oslo',
      country: 'NO',
      lat: 59.91,
      lon: 10.75,
    });
    expect(contact.residence).toEqual({ name: 'Nittedal, Norge', lat: 60.07, lon: 10.87 });
  });
});
