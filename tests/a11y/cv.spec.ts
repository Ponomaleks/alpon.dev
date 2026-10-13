import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '../fixtures';

// Zero axe violations on /cv/en and /cv/no (AC-24, spec §6 Accessibility): Dag and Natt, scripts
// on and off, Original PDF preview closed and open, at 390 and 1440 (16 combinations per page).

const scan = (page: Page) =>
  new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();

const pages = [
  { name: 'cv-en', path: '/cv/en' },
  { name: 'cv-no', path: '/cv/no' },
];
const viewports = [
  { width: 390, height: 844 },
  { width: 1440, height: 900 },
];

// Reduced motion: reveal transitions are done, so colours are final.
test.use({ reducedMotion: 'reduce' });

for (const { name, path } of pages) {
  for (const theme of ['dag', 'natt'] as const) {
    for (const viewport of viewports) {
      for (const scripts of ['on', 'off'] as const) {
        for (const preview of ['closed', 'open'] as const) {
          test(`${name} ${theme} ${viewport.width}px scripts ${scripts} preview ${preview} has no axe violations`, async ({
            page,
          }) => {
            await page.setViewportSize(viewport);
            if (scripts === 'on') {
              await page.addInitScript((t) => localStorage.setItem('fjord-theme', t), theme);
            } else {
              await page.emulateMedia({ colorScheme: theme === 'natt' ? 'dark' : 'light' });
              // axe needs a scripting page, so the site's own scripts are stripped from the
              // document instead of turning JavaScript off for the context.
              await page.route(
                (url) => url.pathname.replace(/\/$/, '') === path,
                async (route) => {
                  const response = await route.fetch();
                  const html = (await response.text()).replace(/<script[\s\S]*?<\/script>/g, '');
                  await route.fulfill({ response, body: html });
                },
              );
            }
            await page.goto(path);
            if (scripts === 'on') {
              await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
            } else {
              await expect(page.locator('html')).not.toHaveAttribute('data-theme', /.+/);
            }
            const details = page.locator('main details.cv-preview');
            await expect(details).toHaveCount(1);
            if (preview === 'open') {
              await details.locator('summary').click();
              await expect(details).toHaveJSProperty('open', true);
            } else {
              await expect(details).toHaveJSProperty('open', false);
            }
            expect((await scan(page)).violations).toEqual([]);
          });
        }
      }
    }
  }
}
