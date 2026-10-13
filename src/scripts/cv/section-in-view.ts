// The shared section in view under the header (AC-08, ADR-0001): the last section whose top has
// reached the line `offset` px below the viewport top; null above the first section.

export interface SectionTop {
  id: string;
  top: number;
}

export function sectionInView(sections: readonly SectionTop[], offset: number): string | null {
  let inView: string | null = null;
  for (const { id, top } of sections) {
    if (top <= offset) inView = id;
    else break;
  }
  return inView;
}
