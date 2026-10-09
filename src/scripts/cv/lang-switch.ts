// Keeps the fragment of every link to the other CV language in step with the section in view
// (AC-08, ADR-0001, sad §8) and stops navigation on the link of the current language.

const CV_PAGE = /^(\/cv\/(?:en|no))(?:#.*)?$/;

export function langHref(href: string, id: string | null): string {
  const match = CV_PAGE.exec(href);
  if (!match) return href;
  return id ? `${match[1]}#${id}` : match[1];
}

interface LangLink {
  getAttribute(name: string): string | null;
  setAttribute(name: string, value: string): void;
  addEventListener(type: 'click', listener: (e: { preventDefault(): void }) => void): void;
}

export interface LangSwitchOptions {
  document: { querySelectorAll(selector: string): Iterable<LangLink> };
  sectionInView: () => string | null;
}

export function initLangSwitch({ document, sectionInView }: LangSwitchOptions): void {
  const links = [...document.querySelectorAll('a[data-cv-lang]')];
  const others = links.filter((link) => link.getAttribute('aria-current') !== 'true');

  const sync = () => {
    const id = sectionInView();
    for (const link of others) {
      const href = link.getAttribute('href');
      if (href !== null) link.setAttribute('href', langHref(href, id));
    }
  };

  sync();
  for (const link of links) {
    if (link.getAttribute('aria-current') === 'true') {
      link.addEventListener('click', (e) => e.preventDefault());
    } else {
      link.addEventListener('click', sync);
    }
  }
}
