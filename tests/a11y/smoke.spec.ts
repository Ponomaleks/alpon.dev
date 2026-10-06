import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

// Zero axe violations on SCR-01 and SCR-02 in Dag and Natt (spec §6 Accessibility), and with
// the scripts-off state in both device preferences (AC-04: readable contrast via the no-JS block).

const pages = [
  { name: 'home', path: '/' },
  { name: '404', path: '/this-path-does-not-exist' },
];

const scan = (page: Page) =>
  new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();

for (const { name, path } of pages) {
  for (const theme of ['dag', 'natt'] as const) {
    test(`${name} has no axe violations in ${theme}`, async ({ page }) => {
      await page.addInitScript((t) => localStorage.setItem('fjord-theme', t), theme);
      await page.goto(path);
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      expect((await scan(page)).violations).toEqual([]);
    });
  }

  for (const device of ['light', 'dark'] as const) {
    test.describe(`scripts off, device ${device}`, () => {
      test.use({ colorScheme: device });

      // axe needs timers, which a context with JavaScript disabled does not run. With scripts
      // off only CSS decides the page: no data-theme plus the device preference. Reproduce
      // exactly that state, then scan (the scripts-off render itself is covered in theme.spec.ts).
      test(`${name} has no axe violations`, async ({ page }) => {
        await page.goto(path);
        await page.evaluate(() => document.documentElement.removeAttribute('data-theme'));
        // Colour transitions started by the removal must finish before the scan reads colours.
        await page.evaluate(() =>
          Promise.all(
            document
              .getAnimations()
              .filter((a) => a instanceof CSSTransition)
              .map((a) => a.finished),
          ),
        );
        const background = await page.evaluate(
          () => getComputedStyle(document.documentElement).backgroundColor,
        );
        expect(background).toBe(device === 'dark' ? 'rgb(17, 26, 23)' : 'rgb(243, 244, 240)');
        expect((await scan(page)).violations).toEqual([]);
      });
    });
  }
}

test('home has no axe violations with an experience entry open', async ({ page }) => {
  await page.goto('/');
  const entry = page.locator('main section[aria-label="Experience"] details').last();
  await entry.locator('summary').click();
  await expect(entry).toHaveAttribute('open', '');
  // The click scrolls the section into view and its reveal fades in: axe would read blended colours.
  await page.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        .filter((a) => a instanceof CSSTransition)
        .map((a) => a.finished),
    ),
  );
  expect((await scan(page)).violations).toEqual([]);
});
