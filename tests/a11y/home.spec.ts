import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

// Zero axe violations on / in Dag and Natt, with scripts on, with scripts off, and with a second
// experience entry open (AC-32, spec §6 Accessibility). The page is scanned as built, with the
// Recommendations section rendered (AC-09, T30).

const scan = (page: Page) =>
  new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();

// Reduced motion: the reveal and count-up transitions are done, so colours are final.
test.use({ reducedMotion: 'reduce' });

for (const theme of ['dag', 'natt'] as const) {
  test.describe(theme, () => {
    test.describe('scripts on', () => {
      test.beforeEach(async ({ page }) => {
        await page.addInitScript((t) => localStorage.setItem('fjord-theme', t), theme);
      });

      test(`home has no axe violations in ${theme}`, async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
        await expect(page.locator('main .recs figure:not([data-carousel-clone])')).toHaveCount(2);
        expect((await scan(page)).violations).toEqual([]);
      });

      test(`home with a second experience entry open has no axe violations in ${theme}`, async ({
        page,
      }) => {
        await page.goto('/');
        await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
        const entries = page.locator('main .experience details');
        await entries.nth(1).locator('summary').click();
        await expect(entries.nth(1)).toHaveJSProperty('open', true);
        expect(
          await entries.evaluateAll(
            (all) => all.filter((d) => (d as HTMLDetailsElement).open).length,
          ),
        ).toBeGreaterThan(1);
        expect((await scan(page)).violations).toEqual([]);
      });
    });

    test.describe('scripts off', () => {
      test.use({ colorScheme: theme === 'natt' ? 'dark' : 'light' });

      test(`home has no axe violations in ${theme}`, async ({ page }) => {
        // axe itself needs a scripting page, so the site's own scripts are stripped from the
        // document instead of turning JavaScript off for the context.
        await page.route('**/', async (route) => {
          const response = await route.fetch();
          const html = (await response.text()).replace(/<script[\s\S]*?<\/script>/g, '');
          await route.fulfill({ response, body: html });
        });
        await page.goto('/');
        // No script runs, so the theme comes from prefers-color-scheme alone.
        await expect(page.locator('html')).not.toHaveAttribute('data-theme', /.+/);
        expect((await scan(page)).violations).toEqual([]);
      });
    });
  });
}

// save-contact-hint AC-08: the open sheet of "Add to contacts", in both themes at 390 and 834.
for (const theme of ['dag', 'natt'] as const) {
  for (const width of [390, 834]) {
    test(`home with the contact card sheet open has no axe violations in ${theme} at ${width}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.addInitScript((t) => localStorage.setItem('fjord-theme', t), theme);
      await page.goto('/');
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      await page.evaluate(() =>
        document.querySelector<HTMLDialogElement>('#save-contact-sheet')?.showModal(),
      );
      await expect(page.getByRole('dialog', { name: 'Add the contact card' })).toBeVisible();
      expect((await scan(page)).violations).toEqual([]);
    });
  }
}
