import { describe, expect, it } from 'vitest';
import { contact } from '../../data/contact';
import { legacyCvTarget } from './legacy-cv';

// AC-13, AC-14 (T21; sad §6 Legacy CV hand-off). The map knows exactly the two Legacy CV addresses
// of the home page and nothing else, so a crafted fragment never sends a Visitor elsewhere.

describe('legacyCvTarget', () => {
  it('maps #cv to the English CV page', () => {
    expect(legacyCvTarget('#cv')).toBe('/cv/en');
    expect(legacyCvTarget('#cv')).toBe(contact.links.cvPages.en);
  });

  it('maps #cv-no to the Norwegian CV page', () => {
    expect(legacyCvTarget('#cv-no')).toBe('/cv/no');
    expect(legacyCvTarget('#cv-no')).toBe(contact.links.cvPages.no);
  });

  it.each([
    ['a different case', '#CV'],
    ['a different case, Norwegian', '#cv-NO'],
    ['a trailing dash', '#cv-'],
    ['a suffix', '#cv-no-x'],
    ['a prefix', '#xcv'],
    ['the contact place', '#contact'],
    ['an empty fragment', '#'],
    ['no fragment', ''],
    ['an address in the fragment', '#https://example.com/'],
    ['a protocol-relative address', '#//example.com'],
    ['a path', '#/cv/en'],
    ['a trailing space', '#cv '],
    ['an encoded letter', '#c%76'],
  ])('maps nothing for %s', (_label, hash) => {
    expect(legacyCvTarget(hash)).toBeNull();
  });
});
