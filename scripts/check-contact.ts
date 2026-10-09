// Contact check (base-components AC-15, AC-16). Compares src/data/contact.ts with the static
// vCard and validates lastUpdated against the day of the run.
//
// Built half (home AC-27): the Person data, the mail-link sentence and the hero coordinates in
// dist/index.html against contact.ts.
//
// CV half (cv AC-27): the side column and the location line of dist/cv.html, dist/cv/en.html and
// dist/cv/no.html against contact.ts.
//
// Run from the repo root: node scripts/check-contact.ts [--built]

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { contact, type Contact } from '../src/data/contact.ts';
import { buildPerson } from '../src/data/person.ts';

type Fields = Pick<
  Contact,
  'email' | 'phone' | 'linkedin' | 'github' | 'workRegion' | 'workRegionGeo' | 'lastUpdated'
>;

/** Values of the vCard lines whose name (with parameters) starts with `prefix`. */
function vcfValues(vcf: string, prefix: RegExp): string[] {
  return vcf
    .split(/\r?\n/)
    .filter((line) => prefix.test(line))
    .map((line) => line.slice(line.indexOf(':') + 1).trim());
}

export function checkLastUpdated(value: string, today: Date): string[] {
  const rule = 'lastUpdated must be a real calendar date (YYYY-MM-DD) and not in the future';
  // A valid ISO date survives the round trip; 2026-02-30 would come back as 2026-03-02.
  const parsed = new Date(`${value}T00:00:00Z`);
  const real =
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value;
  if (!real) return [`lastUpdated "${value}" is not a real calendar date: ${rule}`];
  if (value > today.toISOString().slice(0, 10))
    return [`lastUpdated "${value}" is in the future: ${rule}`];
  return [];
}

/** The locality of workRegion (text before the first comma) against the ADR locality (4th component). */
function checkWorkRegion(workRegion: string, vcfText: string): string[] {
  const locality = workRegion.split(',', 1)[0]?.trim() ?? '';
  const found = vcfValues(vcfText, /^ADR[;:]/i).map((v) => (v.split(';')[3] ?? '').trim());
  if (found.includes(locality)) return [];
  return [
    `workRegion: contact.ts has "${workRegion}" (locality "${locality}"), vCard ADR has ${found.map((f) => `"${f}"`).join(', ') || 'nothing'}`,
  ];
}

/** workRegionGeo locality and country (ISO code) against the ADR locality (4th) and country (7th) components. */
function checkWorkRegionGeo(geo: Fields['workRegionGeo'], vcfText: string): string[] {
  const adrs = vcfValues(vcfText, /^ADR[;:]/i).map((v) => v.split(';'));
  const country = new Intl.DisplayNames('en', { type: 'region' }).of(geo.country) ?? geo.country;
  const problems: string[] = [];
  const expect = (part: string, value: string, index: number) => {
    const found = adrs.map((a) => (a[index] ?? '').trim());
    if (!found.includes(value))
      problems.push(
        `workRegionGeo.${part}: contact.ts has "${value}", vCard ADR has ${found.map((f) => `"${f}"`).join(', ') || 'nothing'}`,
      );
  };
  expect('locality', geo.locality, 3);
  expect('country', country, 6);
  return problems;
}

export function checkContact(c: Fields, vcfText: string, today: Date): string[] {
  const problems: string[] = [];
  const expect = (field: string, value: string, found: string[]) => {
    if (!found.includes(value))
      problems.push(
        `${field}: contact.ts has "${value}", vCard has ${found.map((f) => `"${f}"`).join(', ') || 'nothing'}`,
      );
  };
  expect('email', c.email, vcfValues(vcfText, /^EMAIL[;:]/i));
  expect('phone', c.phone, vcfValues(vcfText, /^TEL[;:]/i));
  expect('linkedin', c.linkedin, vcfValues(vcfText, /^item\d+\.URL:/i));
  expect('github', c.github, vcfValues(vcfText, /^item\d+\.URL:/i));
  problems.push(...checkWorkRegion(c.workRegion, vcfText));
  problems.push(...checkWorkRegionGeo(c.workRegionGeo, vcfText));
  return [...problems, ...checkLastUpdated(c.lastUpdated, today)];
}

/** Person data, mail-link sentence and hero coordinates of the built home page against contact.ts. */
export function checkBuiltContact(c: Contact, html: string): string[] {
  const problems: string[] = [];
  const blocks = html.matchAll(
    /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi,
  );
  let found: Record<string, unknown> | undefined;
  for (const block of blocks) {
    try {
      const data = JSON.parse(block[1] ?? '') as Record<string, unknown>;
      if (data['@type'] === 'Person') found = data;
    } catch {
      // not JSON: treated as missing below
    }
  }
  if (!found) {
    problems.push('person: no Person structured data (ld+json) on the built page');
  } else {
    const want = buildPerson(c);
    const address = (found.address ?? {}) as Record<string, unknown>;
    const compare = (field: string, expected: unknown, actual: unknown) => {
      if (JSON.stringify(expected) !== JSON.stringify(actual))
        problems.push(
          `person.${field}: contact.ts has ${JSON.stringify(expected)}, built page has ${JSON.stringify(actual)}`,
        );
    };
    compare('name', want.name, found.name);
    compare('jobTitle', want.jobTitle, found.jobTitle);
    compare('email', want.email, found.email);
    compare('telephone', want.telephone, found.telephone);
    compare('addressLocality', want.address.addressLocality, address.addressLocality);
    compare('addressCountry', want.address.addressCountry, address.addressCountry);
    compare('sameAs', want.sameAs, found.sameAs);
  }

  const sentence = /<p[^>]*class="[^"]*\bcontact__sentence\b[^"]*"[^>]*>([\s\S]*?)<\/p>/i.exec(
    html,
  );
  const mail = sentence ? /href="mailto:([^"?]*)/i.exec(sentence[1] ?? '')?.[1] : undefined;
  if (mail !== c.email)
    problems.push(
      `mail-link: contact.ts has "${c.email}", built page sentence has ${mail ? `"${mail}"` : 'no mailto link'}`,
    );

  const { lat, lon } = c.workRegionGeo;
  const expected = `${lat.toFixed(2)}° N, ${lon.toFixed(2)}° E`;
  const coords = /\d+\.\d+° N, \d+\.\d+° E/.exec(html)?.[0];
  if (coords !== expected)
    problems.push(
      `hero coordinates: contact.ts has "${expected}", built page has ${coords ? `"${coords}"` : 'nothing'}`,
    );
  return problems;
}

/** The built CV files, relative to dist. */
export const CV_PAGES = ['cv.html', 'cv/en.html', 'cv/no.html'] as const;

const decode = (text: string) =>
  text
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();

/** Email, phone, LinkedIn, GitHub and Residence of the CV side column, and the location line, against contact.ts. */
export function checkBuiltCvPages(c: Contact, distDir: string): string[] {
  const problems: string[] = [];
  for (const name of CV_PAGES) {
    const file = join(distDir, name);
    if (!existsSync(file)) {
      problems.push(`${name}: file not found in ${distDir}, run the build first`);
      continue;
    }
    const html = readFileSync(file, 'utf8');
    const miss = (fact: string, expected: string, found: string | string[] | undefined) => {
      const list = [found ?? []].flat();
      problems.push(
        `${name}: ${fact}: contact.ts has "${expected}", the side column has ${list.map((f) => `"${f}"`).join(', ') || 'nothing'}`,
      );
    };

    const aside = /<aside\b[^>]*class="[^"]*\bcv-aside\b[^"]*"[^>]*>[\s\S]*?<\/aside>/i.exec(
      html,
    )?.[0];
    if (!aside) {
      for (const [fact, value] of [
        ['email', c.email],
        ['phone', c.phone],
        ['linkedin', c.linkedin],
        ['github', c.github],
        ['residence', c.residence.name],
      ] as const)
        miss(fact, value, undefined);
    } else {
      const hrefs = [...aside.matchAll(/<a\b[^>]*\bhref="([^"]*)"/gi)].map((m) => m[1] ?? '');
      const mails = hrefs
        .filter((h) => h.startsWith('mailto:'))
        .map((h) => h.slice(7).split('?')[0] ?? '');
      if (!mails.includes(c.email)) miss('email', c.email, mails);
      const tels = hrefs.filter((h) => h.startsWith('tel:')).map((h) => h.slice(4));
      if (!tels.includes(c.phone.replace(/[^\d+]/g, ''))) miss('phone', c.phone, tels);
      const external = hrefs.filter((h) => /^https?:/.test(h));
      if (!external.includes(c.linkedin)) miss('linkedin', c.linkedin, external);
      if (!external.includes(c.github)) miss('github', c.github, external);
      const based = [
        ...aside.matchAll(
          /<span\b[^>]*class="[^"]*\bcv-aside__value\b[^"]*"[^>]*\blang="no"[^>]*>([\s\S]*?)<\/span>/gi,
        ),
      ].map((m) => decode(m[1] ?? ''));
      if (!based.includes(c.residence.name)) miss('residence', c.residence.name, based);
    }

    const town = c.residence.name.split(',', 1)[0]?.trim() ?? '';
    const place = /<p\b[^>]*class="[^"]*\bplace\b[^"]*"[^>]*>([\s\S]*?)<\/p>/i.exec(html)?.[1];
    const line = place === undefined ? undefined : decode(place);
    if (line === undefined || !line.includes(town))
      problems.push(
        `${name}: location: the location line must name the town "${town}" of the Residence, it has ${line === undefined ? 'no location line' : `"${line}"`}`,
      );
  }
  return problems;
}

if (import.meta.main && process.argv.includes('--built')) {
  const page = 'dist/index.html';
  if (!existsSync(page)) {
    console.error(`contact check failed: ${page} not found, run the build first`);
    process.exit(1);
  }
  const problems = [
    ...checkBuiltContact(contact, readFileSync(page, 'utf8')),
    ...checkBuiltCvPages(contact, 'dist'),
  ];
  if (problems.length > 0) {
    console.error(`built contact check failed:\n  ${problems.join('\n  ')}`);
    process.exit(1);
  }
  console.log(
    'contact: the built home page and the CV pages match contact.ts (Person data, mail link, coordinates, side column, location)',
  );
} else if (import.meta.main) {
  const vcf = readFileSync('public/alexander-ponomarenko.vcf', 'utf8');
  const problems = checkContact(contact, vcf, new Date());
  if (problems.length > 0) {
    console.error(`contact check failed:\n  ${problems.join('\n  ')}`);
    process.exit(1);
  }
  console.log('contact: contact.ts matches the vCard, lastUpdated is valid');
}
