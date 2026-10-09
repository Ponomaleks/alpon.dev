// The CV page's one script entry (AC-04, AC-08, AC-19, AC-23): arrive at a section or at the
// carried scroll position, keep the language links in step, copy the email address.
import { initCopyEmail } from '../shared/copy-email';
import { arrive } from './arrive';
import { initLangSwitch } from './lang-switch';
import { positionToRestore, savePosition, takePosition } from './position';
import { sectionInView } from './section-in-view';

const sections = [...document.querySelectorAll<HTMLElement>('main section[id]')];
const ids = sections.map((s) => s.id);

// Sections take programmatic focus only; they stay out of the Tab order (ADR-0001).
for (const section of sections) section.tabIndex = -1;

// The line under the header, in pixels: the scroll margin the sections already carry.
const offset = () => parseFloat(getComputedStyle(sections[0]).scrollMarginTop) || 0;
const inView = () =>
  sectionInView(
    sections.map((s) => ({ id: s.id, top: s.getBoundingClientRect().top })),
    offset() + 1,
  );

// Reading sessionStorage can throw when the browser blocks it: the page then opens at its top.
function sessionStore(): Storage | null {
  try {
    return sessionStorage;
  } catch {
    return null;
  }
}
const store = sessionStore();

// The position the head's switch carried is taken on every arrival, so nothing stays stored. It is
// restored only without a fragment and only above the first section of this page.
const carried = store ? takePosition(store) : null;
if (location.hash) {
  arrive({ hash: decodeURIComponent(location.hash), ids, document });
} else if (sections[0]) {
  const firstSectionLine = sections[0].getBoundingClientRect().top + scrollY - offset() - 1;
  const top = positionToRestore(carried, firstSectionLine);
  if (top !== null) scrollTo({ top, behavior: 'instant' });
}

initLangSwitch({
  document,
  sectionInView: inView,
  savePosition: () => {
    if (store) savePosition(store, scrollY);
  },
});

const copied = getComputedStyle(document.documentElement).getPropertyValue(
  '--fjord-duration-copied',
);
const copiedMs = parseFloat(copied) * (copied.trim().endsWith('ms') ? 1 : 1000);
initCopyEmail({ document, navigator, duration: copiedMs });
