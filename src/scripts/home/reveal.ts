// Section reveal (AC-36, sad §8). Sections are visible by default. At start only sections that
// lie fully below the viewport are marked `data-reveal="pending"`; each becomes "in" when it
// first comes into view. The target of the address fragment is never marked. Nothing happens
// under reduced motion or without IntersectionObserver.

interface Section {
  getBoundingClientRect(): { top: number };
  getAttribute(name: string): string | null;
  setAttribute(name: string, value: string): void;
  contains(node: never): boolean;
}

interface Entry {
  target: unknown;
  isIntersecting: boolean;
}

interface Observer {
  observe(target: never): void;
  unobserve(target: never): void;
}

export interface RevealEnv {
  viewportHeight: number;
  /** The element the address fragment points at, already resolved. */
  target: unknown;
  ObserverCtor: (new (callback: (entries: Entry[]) => void) => Observer) | null;
  reducedMotion: boolean;
}

export function initReveal(
  sections: Iterable<Section>,
  { viewportHeight, target, ObserverCtor, reducedMotion }: RevealEnv,
): void {
  if (reducedMotion || !ObserverCtor) return;

  const pending = [...sections].filter(
    (el) =>
      el.getBoundingClientRect().top >= viewportHeight &&
      !(target && (el === target || el.contains(target as never))),
  );
  if (pending.length === 0) return;

  const observer = new ObserverCtor((entries) => {
    for (const entry of entries) {
      const el = entry.target as Section;
      if (!entry.isIntersecting || el.getAttribute('data-reveal') !== 'pending') continue;
      el.setAttribute('data-reveal', 'in');
      observer.unobserve(entry.target as never);
    }
  });
  for (const el of pending) {
    el.setAttribute('data-reveal', 'pending');
    observer.observe(el as never);
  }
}
