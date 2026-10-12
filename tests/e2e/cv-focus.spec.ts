import { expect, test } from '../fixtures';

// Visible focus on the content of the CV pages (cv AC-24; review R1-6). axe does not check focus
// rings, so the page is walked with Tab, with the Original PDF preview open, and the computed
// outline of every element that takes focus inside <main> is read. Computed styles only.

const pages = [
  { path: '/cv/en', summary: 'View original PDF' },
  { path: '/cv/no', summary: 'Se original-PDF' },
] as const;

// The interactive parts of the CV page content; each one on screen must take focus in the walk.
const parts = {
  'language switch': '[data-lang-switch] a',
  breadcrumbs: 'nav.crumbs a',
  'contents list': '.cv-aside nav a',
  'preview summary': '.cv-preview__summary',
  'page image link': 'a.cv-preview__page',
} as const;

const FOCUSABLE =
  'main :is(a[href], button, summary, input, select, textarea, [tabindex]:not([tabindex="-1"]))';

for (const { path, summary } of pages) {
  for (const width of [390, 1440]) {
    test(`${path} at ${width}: every element Tab reaches in main has a visible focus ring (AC-24)`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(path);
      // Opened without a click, so that the first Tab still starts at the top of the document.
      await expect(page.locator('main').getByText(summary, { exact: true })).toBeVisible();
      await page.locator('details.cv-preview').evaluate((el: HTMLDetailsElement) => {
        el.open = true;
      });
      await expect(page.locator('a.cv-preview__page').first()).toBeVisible();

      const onScreen = await page.evaluate(
        ([focusable, selectors]) => {
          const shown = (selector: string) =>
            [...document.querySelectorAll<HTMLElement>(selector)].filter(
              (el) =>
                el.checkVisibility({ visibilityProperty: true }) &&
                !el.closest('[inert]') &&
                !(el as HTMLButtonElement).disabled,
            );
          return {
            count: shown(focusable as string).length,
            parts: Object.entries(selectors as Record<string, string>)
              .filter(([, selector]) => shown(`main ${selector}`).length > 0)
              .map(([name]) => name),
          };
        },
        [FOCUSABLE, parts] as const,
      );
      // At 1440 the whole content is on screen: all five parts, the side column included.
      if (width === 1440) expect(onScreen.parts).toEqual(Object.keys(parts));
      expect(onScreen.count).toBeGreaterThan(0);

      // The skip link moves focus to <main>; the walk starts from there.
      await page.keyboard.press('Tab');
      await expect(page.locator('.skip-link')).toBeFocused();
      await page.keyboard.press('Enter');

      const walked: { what: string; ring: boolean; parts: string[] }[] = [];
      for (let i = 0; i < onScreen.count + 5; i += 1) {
        await page.keyboard.press('Tab');
        const step = await page.evaluate((selectors) => {
          const el = document.activeElement;
          if (!el || el.tagName === 'MAIN' || !el.closest('main')) return null;
          // The ring is on the element or on the visible control inside it (CopyButton draws it
          // around its chip, not around the taller target).
          const outlined = (node: Element) => {
            const s = getComputedStyle(node);
            return (
              s.outlineStyle !== 'none' &&
              parseFloat(s.outlineWidth) > 0 &&
              s.outlineColor !== 'rgba(0, 0, 0, 0)'
            );
          };
          return {
            what: `${el.tagName.toLowerCase()}.${el.className} "${(el.textContent ?? '').trim().slice(0, 30)}"`,
            ring: el.matches(':focus-visible') && [el, ...el.querySelectorAll('*')].some(outlined),
            parts: Object.entries(selectors)
              .filter(([, selector]) => el.matches(selector))
              .map(([name]) => name),
          };
        }, parts);
        if (!step) break;
        walked.push(step);
      }

      expect(walked).toHaveLength(onScreen.count);
      expect(walked.filter((step) => !step.ring).map((step) => step.what)).toEqual([]);
      const reached = new Set(walked.flatMap((step) => step.parts));
      expect(onScreen.parts.filter((name) => !reached.has(name))).toEqual([]);
    });
  }
}
