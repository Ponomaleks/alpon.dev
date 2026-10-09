// The CV page's one script entry (AC-04, AC-08, AC-19, AC-23): arrive at a section, keep the
// language links in step with the section in view, copy the email address.
import { initCopyEmail } from '../shared/copy-email';
import { arrive } from './arrive';
import { initLangSwitch } from './lang-switch';
import { sectionInView } from './section-in-view';

const sections = [...document.querySelectorAll<HTMLElement>('main section[id]')];
const ids = sections.map((s) => s.id);

// Sections take programmatic focus only; they stay out of the Tab order (ADR-0001).
for (const section of sections) section.tabIndex = -1;

arrive({ hash: decodeURIComponent(location.hash), ids, document });

// The line under the header, in pixels: the scroll margin the sections already carry.
const offset = () => parseFloat(getComputedStyle(sections[0]).scrollMarginTop) || 0;
const inView = () =>
  sectionInView(
    sections.map((s) => ({ id: s.id, top: s.getBoundingClientRect().top })),
    offset() + 1,
  );

// The CV head is not in view while a section is, so the Visitor scrolls up to it to switch. The
// section last read stays the answer then; with no section ever read the other page opens at its top.
let lastRead: string | null = null;
let frame = 0;
addEventListener(
  'scroll',
  () => {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      lastRead = inView() ?? lastRead;
    });
  },
  { passive: true },
);

initLangSwitch({ document, sectionInView: () => inView() ?? lastRead });

const copied = getComputedStyle(document.documentElement).getPropertyValue(
  '--fjord-duration-copied',
);
const copiedMs = parseFloat(copied) * (copied.trim().endsWith('ms') ? 1 : 1000);
initCopyEmail({ document, navigator, duration: copiedMs });
