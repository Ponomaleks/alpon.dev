import { describe, expect, it } from 'vitest';
import { sectionInView } from './section-in-view';

// AC-08 (T18; ADR-0001; sad §6 Critical flow 1). The section in view is the last one whose top has
// reached the line under the header (`offset`, the --fjord-scroll-offset in pixels, measured from
// the top of the viewport); above the first section there is none. Contract:
// sectionInView(sections: { id: string; top: number }[], offset: number): string | null, where
// `top` is getBoundingClientRect().top and the sections come in page order.

const offset = 96;
const ids = ['profile', 'skills', 'experience'];

function at(tops: number[]) {
  return ids.map((id, i) => ({ id, top: tops[i] }));
}

describe('sectionInView', () => {
  it('returns nothing above the first section', () => {
    expect(sectionInView(at([400, 900, 1500]), offset)).toBeNull();
  });

  it('returns nothing when there are no sections', () => {
    expect(sectionInView([], offset)).toBeNull();
  });

  it('returns the first section once its top reaches the line under the header', () => {
    expect(sectionInView(at([offset, 700, 1500]), offset)).toBe('profile');
  });

  it('returns each section in turn as the page scrolls', () => {
    expect(sectionInView(at([-300, offset, 900]), offset)).toBe('skills');
    expect(sectionInView(at([-1200, -600, 50]), offset)).toBe('experience');
  });

  it('keeps the earlier section between two sections', () => {
    expect(sectionInView(at([-200, offset + 1, 900]), offset)).toBe('profile');
  });

  it('counts the header offset: a section 1 px below the line is not yet in view', () => {
    expect(sectionInView(at([offset + 1, 700, 1500]), offset)).toBeNull();
    expect(sectionInView(at([offset + 1, 700, 1500]), offset + 1)).toBe('profile');
  });

  it('returns the last section when the page is scrolled past all of them', () => {
    expect(sectionInView(at([-3000, -2000, -1000]), offset)).toBe('experience');
  });
});
