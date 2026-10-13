import { describe, expect, it, vi } from 'vitest';
import { arrive } from './arrive';

// AC-08, spec §6.1 (T18; ADR-0001). The browser scrolls; the script only moves keyboard focus, and
// only to the element a fragment names when that is one of the page's CV sections. Contract:
// arrive({ hash, ids, document }): hash is location.hash ("#experience"); ids the section ids of
// the page (src/data/cv/sections.ts); document.getElementById(id) returns the element or null.
// Focus is called with { preventScroll: true }: the browser already placed the section under the header.

const ids = ['profile', 'skills', 'experience'];

function el() {
  return { focus: vi.fn() };
}

function run(hash: string, elements: Record<string, ReturnType<typeof el>>) {
  const getElementById = vi.fn((id: string) =>
    Object.prototype.hasOwnProperty.call(elements, id) ? elements[id] : null,
  );
  arrive({ hash, ids, document: { getElementById } });
}

describe('arrive', () => {
  it('focuses the section a known id names, without scrolling', () => {
    const experience = el();
    run('#experience', { experience });
    expect(experience.focus).toHaveBeenCalledTimes(1);
    expect(experience.focus).toHaveBeenCalledWith({ preventScroll: true });
  });

  it('ignores an empty fragment', () => {
    const profile = el();
    run('', { profile });
    run('#', { profile });
    expect(profile.focus).not.toHaveBeenCalled();
  });

  it('ignores an id that is not a CV section id', () => {
    const unknown = el();
    run('#unknown', { unknown });
    expect(unknown.focus).not.toHaveBeenCalled();
  });

  it('ignores the id of an element that is not a section of this page', () => {
    const main = el();
    const contact = el();
    run('#main', { main });
    run('#contact', { contact });
    expect(main.focus).not.toHaveBeenCalled();
    expect(contact.focus).not.toHaveBeenCalled();
  });

  it('ignores a known id when the page has no such section', () => {
    expect(() => run('#skills', {})).not.toThrow();
  });

  it('reads a percent-encoded id as the browser does', () => {
    const experience = el();
    run('#%65xperience', { experience });
    expect(experience.focus).toHaveBeenCalledTimes(1);
  });

  // Review R1-1: `/cv/en#%` must not stop the page script.
  it.each(['#%', '#%E0%A4%A', '#experience%'])(
    'ignores the fragment %s, which cannot be decoded, without throwing',
    (hash) => {
      const experience = el();
      expect(() => run(hash, { experience })).not.toThrow();
      expect(experience.focus).not.toHaveBeenCalled();
    },
  );

  it.each([
    '#experience%20',
    '#experience/../x',
    '#%3Cscript%3Ealert(1)%3C/script%3E',
    '#<img src=x onerror=alert(1)>',
    '#__proto__',
    '#constructor',
    '#toString',
    '#EXPERIENCE',
    '#experience&x=1',
    '#experience#skills',
  ])('ignores the crafted fragment %s', (hash) => {
    const elements = { experience: el(), skills: el(), toString: el() };
    run(hash, elements);
    for (const e of Object.values(elements)) expect(e.focus).not.toHaveBeenCalled();
  });
});
