import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { contact } from '../src/data/contact.ts';
import { checkContact, checkLastUpdated } from './check-contact.ts';

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
