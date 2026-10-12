import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '../fixtures';

// Zero axe violations on /, the Not-found page and /styleguide in Dag and Natt, and on / with
// the mobile menu panel open (AC-21, AC-04, AC-17; spec §6 Accessibility).

const scan = (page: Page) =>
  new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();

const targets = [
  { name: 'home', path: '/' },
  { name: 'not-found', path: '/this-path-does-not-exist' },
  { name: 'styleguide', path: '/styleguide' },
];

for (const theme of ['dag', 'natt'] as const) {
  test.describe(theme, () => {
    test.beforeEach(async ({ page }) => {
      await page.addInitScript((t) => localStorage.setItem('fjord-theme', t), theme);
    });

    for (const { name, path } of targets) {
      test(`${name} has no axe violations in ${theme}`, async ({ page }) => {
        await page.goto(path);
        await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
        expect((await scan(page)).violations).toEqual([]);
      });
    }

    test(`home with the menu panel open has no axe violations in ${theme}`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto('/');
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      await page.locator('header').getByRole('button', { name: 'Open menu' }).click();
      await expect(page.locator('dialog#mobile-menu')).toBeVisible();
      expect((await scan(page)).violations).toEqual([]);
    });
  });
}
