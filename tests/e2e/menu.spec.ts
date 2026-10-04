import { expect, test, type Page } from '@playwright/test';

// The mobile menu end to end (base-components T19): AC-04, AC-05 and the SCR-03 states
// "open", "closed by Escape or the close button", "closed by a link", "closed by width",
// "theme changed inside", "not reachable". Reduced motion is emulated (spec section 1).
test.use({ reducedMotion: 'reduce' });

async function open(page: Page, path = '/') {
  const errors: Error[] = [];
  const consoleErrors: string[] = [];
  page.on('pageerror', (error) => errors.push(error));
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(path);
  return { errors, consoleErrors };
}

const menuButton = (page: Page) =>
  page.locator('header').getByRole('button', { name: 'Open menu' });
const panel = (page: Page) => page.locator('dialog#mobile-menu');

async function openMenu(page: Page) {
  await menuButton(page).click();
  await expect(panel(page)).toBeVisible();
}

test.describe('mobile menu at 390', () => {
  test('opens with the content, focus on the first link, page behind inert and not scrollable (AC-04)', async ({
    page,
  }) => {
    const { errors, consoleErrors } = await open(page);
    await expect(menuButton(page)).toHaveAttribute('aria-expanded', 'false');
    await openMenu(page);
    const dialog = panel(page);
    await expect(menuButton(page)).toHaveAttribute('aria-expanded', 'true');

    await expect(dialog.getByRole('link', { name: /CV/ })).toBeVisible();
    await expect(dialog.getByRole('link', { name: /Contact/ })).toBeVisible();
    await expect(dialog.getByRole('link', { name: 'ponomaleks@gmail.com' })).toHaveAttribute(
      'href',
      'mailto:ponomaleks@gmail.com',
    );
    await expect(dialog.getByRole('link', { name: '+47 405 94 584' })).toHaveAttribute(
      'href',
      /^tel:\+47/,
    );
    await expect(dialog.getByText('Oslo, Norge')).toBeVisible();
    await expect(dialog.getByRole('group', { name: 'Theme' })).toBeVisible();
    await expect(dialog.getByRole('link', { name: 'Get in touch' })).toBeVisible();

    // Focus is inside the panel, on the first navigation link.
    const first = dialog.locator('[data-menu-nav] a').first();
    await expect(first).toBeFocused();

    // Page behind: modal, so inert; Tab never leaves the panel; the page does not scroll.
    expect(await dialog.evaluate((el) => el.matches(':modal'))).toBe(true);
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press('Tab');
      expect(
        await page.evaluate(() => !document.activeElement?.closest('header, main, footer')),
      ).toBe(true);
    }
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).toBe(
      'hidden',
    );
    expect(errors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });

  for (const [how, close] of [
    ['Escape', (page: Page) => page.keyboard.press('Escape')],
    [
      'the close button',
      (page: Page) => panel(page).getByRole('button', { name: 'Close menu' }).click(),
    ],
  ] as const) {
    test(`closes by ${how} and focus returns to the menu button (AC-05)`, async ({ page }) => {
      await open(page);
      await openMenu(page);
      await close(page);
      await expect(panel(page)).toBeHidden();
      await expect(menuButton(page)).toBeFocused();
      await expect(menuButton(page)).toHaveAttribute('aria-expanded', 'false');
      expect(
        await page.evaluate(() => getComputedStyle(document.documentElement).overflow),
      ).not.toBe('hidden');
    });
  }

  test('closes by a link to another page (AC-05)', async ({ page }) => {
    await open(page, '/does-not-exist');
    await openMenu(page);
    await panel(page)
      .getByRole('link', { name: /Contact/ })
      .click();
    await page.waitForURL('**/#contact');
    await expect(panel(page)).toBeHidden();
    await expect(page).toHaveURL(/\/#contact$/);
  });

  test('closes by a link to the page the Visitor is already on (AC-05)', async ({ page }) => {
    await open(page, '/');
    await openMenu(page);
    await panel(page)
      .getByRole('link', { name: /Contact/ })
      .click();
    await expect(panel(page)).toBeHidden();
    await expect(page).toHaveURL(/\/#contact$/);
    await expect(menuButton(page)).toHaveAttribute('aria-expanded', 'false');
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).not.toBe(
      'hidden',
    );
  });

  test('closes when the width reaches 768', async ({ page }) => {
    await open(page);
    await openMenu(page);
    await page.setViewportSize({ width: 768, height: 844 });
    await expect(panel(page)).toBeHidden();
    const button = page.locator('header [aria-controls="mobile-menu"]');
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await expect(button).toBeHidden();
  });

  for (const theme of ['dag', 'natt'] as const) {
    test(`a theme change inside leaves the panel open, readable in ${theme === 'dag' ? 'Dag' : 'Natt'}`, async ({
      page,
    }) => {
      const { errors, consoleErrors } = await open(page);
      await openMenu(page);
      const dialog = panel(page);
      const other = theme === 'dag' ? 'Dark' : 'Light';
      // Start from the opposite theme, then choose the target one inside the panel.
      await dialog.getByRole('button', { name: other }).click();
      await dialog.getByRole('button', { name: theme === 'dag' ? 'Light' : 'Dark' }).click();
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      await expect(dialog).toBeVisible();
      await expect(menuButton(page)).toHaveAttribute('aria-expanded', 'true');
      await expect(
        dialog.getByRole('button', { name: theme === 'dag' ? 'Light' : 'Dark' }),
      ).toHaveAttribute('aria-pressed', 'true');
      const colors = await dialog.evaluate((el) => {
        const style = getComputedStyle(el);
        return { bg: style.backgroundColor, fg: style.color };
      });
      expect(colors.bg).toBe(theme === 'dag' ? 'rgb(243, 244, 240)' : 'rgb(17, 26, 23)');
      expect(colors.fg).not.toBe(colors.bg);
      expect(errors).toEqual([]);
      expect(consoleErrors).toEqual([]);
    });
  }

  test('not reachable with scripts off: the button is hidden, the links stay in the header', async ({
    browser,
  }) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 390, height: 844 },
    });
    const page = await context.newPage();
    await page.goto('/');
    await expect(menuButton(page)).toBeHidden();
    await expect(panel(page)).toBeHidden();
    await expect(page.getByRole('link', { name: 'Get in touch' }).first()).toBeVisible();
    await context.close();
  });
});
