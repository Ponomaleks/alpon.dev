// The language switch of a CV page (AC-08, ADR-0001, sad §8). Switching must not move the page:
// - in the Sticky action bar, on screen mid-page, the link to the other language carries the
//   section in view at the moment of the click;
// - in the CV head, on screen only above the first section, it carries no section and the scroll
//   position is saved on an activation that navigates this tab, so the other page opens where the
//   Visitor was;
// - the link of the current language does not navigate.

const CV_PAGE = /^(\/cv\/(?:en|no))(?:#.*)?$/;

export function langHref(href: string, id: string | null): string {
  const match = CV_PAGE.exec(href);
  if (!match) return href;
  return id ? `${match[1]}#${id}` : match[1];
}

interface LangClick {
  preventDefault(): void;
  button?: number;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
}

interface LangLink {
  getAttribute(name: string): string | null;
  setAttribute(name: string, value: string): void;
  addEventListener(type: 'click', listener: (e: LangClick) => void): void;
}

// A click with a modifier key or another button opens the address elsewhere or saves it: this tab
// does not navigate.
const navigatesThisTab = (e: LangClick) =>
  !e.button && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey;

export interface LangSwitchOptions {
  document: { querySelectorAll(selector: string): Iterable<LangLink> };
  sectionInView: () => string | null;
  savePosition: () => void;
}

const LINKS = '[data-lang-switch] a[data-switch-to]';

export function initLangSwitch({ document, sectionInView, savePosition }: LangSwitchOptions): void {
  const inBar = new Set(document.querySelectorAll(`[data-shell-bar] ${LINKS}`));

  const setFragment = (link: LangLink, id: string | null) => {
    const href = link.getAttribute('href');
    if (href !== null) link.setAttribute('href', langHref(href, id));
  };

  for (const link of document.querySelectorAll(LINKS)) {
    if (link.getAttribute('aria-current') === 'true') {
      link.addEventListener('click', (e) => e.preventDefault());
    } else if (inBar.has(link)) {
      const sync = () => setFragment(link, sectionInView());
      sync();
      link.addEventListener('click', sync);
    } else {
      setFragment(link, null);
      link.addEventListener('click', (e) => {
        if (navigatesThisTab(e)) savePosition();
      });
    }
  }
}
