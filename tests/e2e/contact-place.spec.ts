import { expect, test, type Locator, type Page } from '@playwright/test';

// The Shell's contact links end at the contact place (home T23): AC-18. From the home page and from
// the Not-found page, "Contact" and "Get in touch" in the header and in the mobile menu arrive at the
// contact section with its heading in view below the header, the menu closed and keyboard focus on
// the section. This spec also runs in Firefox and WebKit (CI only). Reduced motion is emulated so the
// scroll ends at once.
test.use({ reducedMotion: 'reduce' });

const PAGES = [
  ['the home page', '/'],
  ['the Not-found page', '/this-path-does-not-exist'],
] as const;

const header = (page: Page) => page.locator('header').first();
const panel = (page: Page) => page.locator('dialog#mobile-menu');

async function expectArrivedAtContact(page: Page) {
  // Focus placed at the section itself.
  await expect
    .poll(() => page.evaluate(() => document.activeElement?.id ?? ''), { timeout: 5000 })
    .toBe('contact');
  await expect(page).toHaveURL(/\/#contact$/);

  // The menu is closed.
  expect(await panel(page).evaluate((el) => (el as HTMLDialogElement).open)).toBe(false);

  // The heading is fully in view and starts below the header.
  const heading = page.locator('#contact').getByRole('heading', { name: 'Get in touch' });
  await expect(heading).toBeVisible();
  await expect
    .poll(
      async () => {
        const h = await heading.boundingBox();
        const bar = await header(page).boundingBox();
        const viewport = page.viewportSize();
        if (!h || !bar || !viewport) return 'no box';
        if (h.y < bar.y + bar.height - 1)
          return `heading top ${h.y} is under the header bottom ${bar.y + bar.height}`;
        if (h.y + h.height > viewport.height)
          return `heading bottom ${h.y + h.height} is below the viewport ${viewport.height}`;
        return 'ok';
      },
      { timeout: 5000 },
    )
    .toBe('ok');
}

async function openMenu(page: Page) {
  await header(page).getByRole('button', { name: 'Open menu' }).click();
  await expect(panel(page)).toBeVisible();
}

async function follow(link: Locator) {
  await expect(link).toBeVisible();
  await expect(link).toHaveAttribute('href', /#contact$/);
  await link.click();
}

for (const [pageName, path] of PAGES) {
  test.describe(`from ${pageName}, wide screen`, () => {
    test.use({ viewport: { width: 1280, height: 800 } });

    test('header "Contact" arrives at the contact place (AC-18)', async ({ page }) => {
      await page.goto(path);
      await follow(header(page).getByRole('link', { name: 'Contact', exact: true }));
      await expectArrivedAtContact(page);
    });

    test('header "Get in touch" arrives at the contact place (AC-18)', async ({ page }) => {
      await page.goto(path);
      await follow(header(page).getByRole('link', { name: 'Get in touch' }));
      await expectArrivedAtContact(page);
    });
  });

  test.describe(`from ${pageName}, narrow screen`, () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test('header "Get in touch" arrives at the contact place (AC-18)', async ({ page }) => {
      await page.goto(path);
      await follow(header(page).getByRole('link', { name: 'Get in touch' }));
      await expectArrivedAtContact(page);
    });

    test('menu "Contact" arrives at the contact place with the menu closed (AC-18)', async ({
      page,
    }) => {
      await page.goto(path);
      await openMenu(page);
      await follow(panel(page).getByRole('link', { name: /^[0-9]+ Contact$/ }));
      await expectArrivedAtContact(page);
    });

    test('menu "Get in touch" arrives at the contact place with the menu closed (AC-18)', async ({
      page,
    }) => {
      await page.goto(path);
      await openMenu(page);
      await follow(panel(page).getByRole('link', { name: 'Get in touch' }));
      await expectArrivedAtContact(page);
    });
  });
}
