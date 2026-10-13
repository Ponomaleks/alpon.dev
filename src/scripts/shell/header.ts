// Header scroll border (AC-03, D-13; ADR-0003). An IntersectionObserver watches a sentinel at the
// top of the page: when it leaves the viewport the header gets `data-scrolled`, when it is back
// the attribute goes. This is the only write; the border itself is styled from the attribute.

interface Entry {
  isIntersecting: boolean;
}

interface Observer {
  observe(target: Element): void;
}

type ObserverConstructor = new (callback: (entries: Entry[]) => void) => Observer;

export function observeHeader(
  header: Element,
  sentinel: Element,
  ObserverCtor: ObserverConstructor = IntersectionObserver,
): void {
  const observer = new ObserverCtor((entries) => {
    const entry = entries[entries.length - 1];
    if (!entry) return;
    if (entry.isIntersecting) header.removeAttribute('data-scrolled');
    else header.setAttribute('data-scrolled', '');
  });
  observer.observe(sentinel);
}
