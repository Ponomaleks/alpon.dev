// Moves keyboard focus to the CV section a fragment names (AC-08, spec §6.1, ADR-0001). The browser
// does the scrolling; anything that is not exactly a section id of this page is ignored.

export interface ArriveOptions {
  hash: string;
  ids: readonly string[];
  document: {
    getElementById(id: string): { focus(options?: { preventScroll?: boolean }): void } | null;
  };
}

export function arrive({ hash, ids, document }: ArriveOptions): void {
  if (!hash.startsWith('#')) return;
  const id = hash.slice(1);
  if (!ids.includes(id)) return;
  document.getElementById(id)?.focus({ preventScroll: true });
}
