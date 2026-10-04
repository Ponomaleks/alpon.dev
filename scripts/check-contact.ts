// Contact check (base-components AC-15, AC-16). Compares src/data/contact.ts with the static
// vCard and validates lastUpdated against the day of the run.
//
// Run from the repo root: node scripts/check-contact.ts

import { readFileSync } from 'node:fs';
import { contact, type Contact } from '../src/data/contact.ts';

type Fields = Pick<Contact, 'email' | 'phone' | 'linkedin' | 'github' | 'lastUpdated'>;

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
  return [...problems, ...checkLastUpdated(c.lastUpdated, today)];
}

if (import.meta.main) {
  const vcf = readFileSync('public/alexander-ponomarenko.vcf', 'utf8');
  const problems = checkContact(contact, vcf, new Date());
  if (problems.length > 0) {
    console.error(`contact check failed:\n  ${problems.join('\n  ')}`);
    process.exit(1);
  }
  console.log('contact: contact.ts matches the vCard, lastUpdated is valid');
}
