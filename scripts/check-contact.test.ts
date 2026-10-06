import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { contact } from '../src/data/contact.ts';
import { buildPerson } from '../src/data/person.ts';
import { checkBuiltContact, checkContact, checkLastUpdated } from './check-contact.ts';

// AC-15: contact.ts and the .vcf agree, a mismatch names the field.
// AC-16: lastUpdated is a real calendar date and not in the future; the message shows value + rule.

const vcf = readFileSync(new URL('../public/alexander-ponomarenko.vcf', import.meta.url), 'utf8');
const TODAY = new Date('2026-10-04T12:00:00Z');

describe('contact.ts against the vCard (AC-15)', () => {
  it('passes on the real files', () => {
    expect(checkContact(contact, vcf, TODAY)).toEqual([]);
  });

  it.each([
    ['email', { ...contact, email: 'other@example.com' }],
    ['phone', { ...contact, phone: '+47 000 00 000' }],
    ['linkedin', { ...contact, linkedin: 'https://www.linkedin.com/in/someone-else/' }],
    ['github', { ...contact, github: 'https://github.com/someone-else' }],
  ])('fails and names the field when %s differs', (field, changed) => {
    const problems = checkContact(changed, vcf, TODAY);
    expect(problems.length).toBeGreaterThan(0);
    expect(problems.join('\n')).toContain(field);
  });

  it('passes Oslo, Norge against ADR locality Oslo', () => {
    const only = 'ADR;TYPE=WORK:;;;Oslo;;;Norway';
    const problems = checkContact({ ...contact, workRegion: 'Oslo, Norge' }, only, TODAY);
    expect(problems.join('\n')).not.toContain('workRegion');
  });

  it('fails and names workRegion with both values when the ADR locality differs', () => {
    const other = vcf.replace('ADR;TYPE=WORK:;;;Oslo;;;Norway', 'ADR;TYPE=WORK:;;;Bergen;;;Norway');
    const msg = checkContact(contact, other, TODAY).join('\n');
    expect(msg).toContain('workRegion');
    expect(msg).toContain('Oslo');
    expect(msg).toContain('Bergen');
  });

  it('reports workRegion when the vCard has no ADR line', () => {
    const none = vcf.replace(/^ADR.*\r?\n/m, '');
    expect(checkContact(contact, none, TODAY).join('\n')).toContain('workRegion');
  });

  it('workRegionGeo agrees with the ADR line on the real files', () => {
    expect(checkContact(contact, vcf, TODAY).join('\n')).not.toContain('workRegionGeo');
  });

  it.each([
    ['locality', { ...contact.workRegionGeo, locality: 'Bergen' }],
    ['country', { ...contact.workRegionGeo, country: 'SE' }],
  ])('fails and names workRegionGeo when its %s disagrees with the ADR line', (_k, geo) => {
    const msg = checkContact({ ...contact, workRegionGeo: geo }, vcf, TODAY).join('\n');
    expect(msg).toContain('workRegionGeo');
  });

  it('keeps the residence coordinates at two decimals at most', () => {
    const decimals = (n: number) => (String(n).split('.')[1] ?? '').length;
    expect(decimals(contact.residence.lat)).toBeLessThanOrEqual(2);
    expect(decimals(contact.residence.lon)).toBeLessThanOrEqual(2);
  });

  it('keeps the work region and the residence apart', () => {
    expect(contact.workRegion).toBe('Oslo, Norge');
    expect(contact.residence.name).toBe('Nittedal, Norge');
  });
});

describe('lastUpdated (AC-16)', () => {
  it('accepts a real date that is not in the future', () => {
    expect(checkLastUpdated('2026-10-04', TODAY)).toEqual([]);
    expect(checkLastUpdated('2026-02-28', TODAY)).toEqual([]);
  });

  it('rejects 2026-02-30 and shows the value and the rule', () => {
    const msg = checkLastUpdated('2026-02-30', TODAY).join('\n');
    expect(msg).toContain('2026-02-30');
    expect(msg).toMatch(/real calendar date/i);
  });

  it('rejects a date after the run day and shows the value and the rule', () => {
    const msg = checkLastUpdated('2026-10-05', TODAY).join('\n');
    expect(msg).toContain('2026-10-05');
    expect(msg).toMatch(/future/i);
  });

  it('rejects a non-ISO string', () => {
    expect(checkLastUpdated('4 Oct 2026', TODAY).join('\n')).toContain('4 Oct 2026');
  });

  it('flows through checkContact', () => {
    const problems = checkContact({ ...contact, lastUpdated: '2026-02-30' }, vcf, TODAY);
    expect(problems.join('\n')).toContain('2026-02-30');
  });

  it('the repo lastUpdated is valid today', () => {
    expect(checkLastUpdated(contact.lastUpdated, new Date())).toEqual([]);
  });
});

// AC-27 built half: dist/index.html against contact.ts. A failure names the field.

/** A built home page as the site renders it, from the given contact facts. */
function builtPage(c: typeof contact = contact, person = buildPerson(c)): string {
  const { lat, lon } = c.workRegionGeo;
  return (
    '<!doctype html><html><head>' +
    `<script type="application/ld+json">${JSON.stringify(person)}</script>` +
    '</head><body>' +
    `<p class="hero__eyebrow"><span lang="no">${c.workRegion}</span> · <span>${lat.toFixed(2)}° N, ${lon.toFixed(2)}° E</span></p>` +
    '<div class="contact"><p class="contact__sentence">Hiring? ' +
    `<a class="fj-link" href="mailto:${c.email}">A short email</a> about the role is the quickest way to reach me.</p></div>` +
    '</body></html>'
  );
}

describe('built page against contact.ts (AC-27)', () => {
  it('passes the page built from the same facts', () => {
    expect(checkBuiltContact(contact, builtPage())).toEqual([]);
  });

  const person = buildPerson(contact);
  it.each([
    ['person.name', { ...person, name: 'Someone Else' }],
    ['person.jobTitle', { ...person, jobTitle: 'Plumber' }],
    ['person.email', { ...person, email: 'other@example.com' }],
    ['person.telephone', { ...person, telephone: '+47 000 00 000' }],
    [
      'person.addressLocality',
      { ...person, address: { ...person.address, addressLocality: 'Bergen' } },
    ],
    ['person.addressCountry', { ...person, address: { ...person.address, addressCountry: 'SE' } }],
    ['person.sameAs', { ...person, sameAs: [contact.linkedin, 'https://github.com/other'] }],
  ])('fails and names %s when the structured data differs', (field, changed) => {
    const problems = checkBuiltContact(contact, builtPage(contact, changed));
    expect(problems.length).toBeGreaterThan(0);
    expect(problems.join(' | ')).toContain(field);
  });

  it('fails and names the structured data when the block is missing', () => {
    const html = builtPage().replace(/<script type="application\/ld\+json">.*?<\/script>/, '');
    expect(checkBuiltContact(contact, html).join('\n')).toContain('person');
  });

  it('passes the mail-link sentence with the contact address', () => {
    const problems = checkBuiltContact(contact, builtPage());
    expect(problems.join('\n')).not.toContain('mail-link');
  });

  it('fails and names the mail-link sentence when its address differs', () => {
    const html = builtPage().replace(
      `mailto:${contact.email}">A short`,
      'mailto:other@example.com">A short',
    );
    const msg = checkBuiltContact(contact, html).join('\n');
    expect(msg).toContain('mail-link');
    expect(msg).toContain('other@example.com');
    expect(msg).toContain(contact.email);
  });

  it('fails and names the mail-link sentence when it is missing', () => {
    const html = builtPage().replace(/<p class="contact__sentence">.*?<\/p>/, '');
    expect(checkBuiltContact(contact, html).join('\n')).toContain('mail-link');
  });

  it('passes the hero coordinates from workRegionGeo', () => {
    expect(checkBuiltContact(contact, builtPage()).join('\n')).not.toContain('hero coordinates');
  });

  it('fails and names the hero coordinates when they differ', () => {
    const html = builtPage().replace('59.91° N, 10.75° E', '60.39° N, 5.32° E');
    const msg = checkBuiltContact(contact, html).join('\n');
    expect(msg).toContain('hero coordinates');
    expect(msg).toContain('60.39');
    expect(msg).toContain('59.91');
  });

  it('fails and names the hero coordinates when they are missing', () => {
    const html = builtPage().replace('59.91° N, 10.75° E', 'somewhere');
    expect(checkBuiltContact(contact, html).join('\n')).toContain('hero coordinates');
  });
});
