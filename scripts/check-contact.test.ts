import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { contact } from '../src/data/contact.ts';
import { buildPerson } from '../src/data/person.ts';
import {
  checkBuiltContact,
  checkBuiltCvPages,
  checkContact,
  checkLastUpdated,
  CV_PAGES,
} from './check-contact.ts';

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

// cv AC-27 built half: the three CV files against contact.ts. A failure names the page and the fact.

const dirs: string[] = [];
afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

type Facts = {
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  residence: string;
  location: string;
};
const same: Facts = {
  email: contact.email,
  phone: contact.phone,
  linkedin: contact.linkedin,
  github: contact.github,
  residence: contact.residence.name,
  location: '1482 Nittedal, Norway',
};
const short = (url: string) => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');

/** A built CV page as the site renders it (head location line, side column), from the given facts. */
function cvPage(f: Facts = same): string {
  const tel = `tel:${f.phone.replace(/[^\d+]/g, '')}`;
  return (
    '<!doctype html><html lang="en"><head><title>CV</title></head><body><main>' +
    '<header class="cv-head"><h1>Alexander Ponomarenko</h1>' +
    `<p class="place astro-x">${f.location}</p></header></main>` +
    '<aside class="cv-aside astro-x"><nav aria-label="On this page"><ol><li><a href="#a">A</a></li></ol></nav>' +
    '<div role="group" aria-label="Contact"><dl class="cv-aside__list">' +
    `<div class="cv-aside__row"><dt>Email</dt><dd><a class="cv-aside__value" href="mailto:${f.email}">${f.email}</a></dd></div>` +
    `<div class="cv-aside__row"><dt>Phone</dt><dd><a class="cv-aside__value" href="${tel}">${f.phone}</a></dd></div>` +
    `<div class="cv-aside__row"><dt>LinkedIn</dt><dd><span class="cv-aside__value"><a href="${f.linkedin}">${short(f.linkedin)}</a></span></dd></div>` +
    `<div class="cv-aside__row"><dt>GitHub</dt><dd><span class="cv-aside__value"><a href="${f.github}">${short(f.github)}</a></span></dd></div>` +
    `<div class="cv-aside__row"><dt>Based in</dt><dd><span class="cv-aside__value" lang="no">${f.residence.replace(/&/g, '&amp;')}</span></dd></div>` +
    '</dl></div></aside></body></html>'
  );
}

/** A fixture dist/ with the given pages (path relative to dist). */
function dist(pages: Record<string, string>): string {
  const root = mkdtempSync(join(tmpdir(), 'fjord-cv-contact-'));
  dirs.push(root);
  for (const [path, html] of Object.entries(pages)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), html);
  }
  return root;
}
const allPages = (override: Record<string, string> = {}) =>
  dist({ ...Object.fromEntries(CV_PAGES.map((p) => [p, cvPage()])), ...override });

describe('built CV pages against contact.ts (cv AC-27)', () => {
  it('reads dist/cv.html, dist/cv/en.html and dist/cv/no.html', () => {
    expect([...CV_PAGES]).toEqual(['cv.html', 'cv/en.html', 'cv/no.html']);
  });

  it('passes pages equal to contact.ts', () => {
    expect(checkBuiltCvPages(contact, allPages())).toEqual([]);
  });

  it.each([
    ['email', { ...same, email: 'other@example.com' }],
    ['phone', { ...same, phone: '+47 000 00 000' }],
    ['linkedin', { ...same, linkedin: 'https://www.linkedin.com/in/someone-else/' }],
    ['github', { ...same, github: 'https://github.com/someone-else' }],
    ['residence', { ...same, residence: 'Bergen, Norge' }],
  ])('fails naming the page and %s when it differs', (fact, changed) => {
    const problems = checkBuiltCvPages(contact, allPages({ 'cv/no.html': cvPage(changed) }));
    expect(problems.length).toBeGreaterThan(0);
    const msg = problems.join('\n');
    expect(msg).toContain('cv/no.html');
    expect(msg).toContain(fact);
    expect(msg).not.toContain('cv/en.html');
  });

  it('fails naming the page and location when the line lacks the town of the Residence', () => {
    const problems = checkBuiltCvPages(
      contact,
      allPages({ 'cv/en.html': cvPage({ ...same, location: '0150 Oslo, Norway' }) }),
    );
    const msg = problems.join('\n');
    expect(msg).toContain('cv/en.html');
    expect(msg).toContain('location');
    expect(msg).toContain('Nittedal');
  });

  it('accepts a location line with a different postal code, same town', () => {
    const pages = allPages({ 'cv.html': cvPage({ ...same, location: '9999 Nittedal, Norge' }) });
    expect(checkBuiltCvPages(contact, pages)).toEqual([]);
  });

  it('fails closed naming the page when a CV file is missing', () => {
    const root = dist({ 'cv/en.html': cvPage(), 'cv/no.html': cvPage() });
    expect(checkBuiltCvPages(contact, root).join('\n')).toContain('cv.html');
  });

  it('fails naming the page when the side column is missing', () => {
    const noAside = cvPage().replace(/<aside[\s\S]*<\/aside>/, '');
    const msg = checkBuiltCvPages(contact, allPages({ 'cv.html': noAside })).join('\n');
    expect(msg).toContain('cv.html');
    expect(msg).toContain('email');
  });
});
