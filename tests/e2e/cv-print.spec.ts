import { expect, test, type Page } from '@playwright/test';

// The printed CV (AC-11, AC-12, AC-27, AC-06; screens SCR-05 / SCR-06 `print offered`, `print not
// offered`, `print (document)`, `contact line on screen`; sad §8 Print; ADR-0002). Print media is
// emulated from Dag and from Natt; Playwright's PDF output is used for the A4 sheet.

const pages = ['/cv/en', '/cv/no'] as const;
const themes = ['dag', 'natt'] as const;

// Parts outside the document: none of them is rendered in print media.
const hidden = {
  'skip link': '.skip-link',
  header: 'body > header',
  'mobile menu': '.menu, dialog',
  breadcrumbs: '.crumbs',
  'language switch': '[data-lang-switch]',
  buttons: '.cv-head .fj-btn',
  'meta line': '.cv-meta',
  'original PDF preview': '.cv-page__preview',
  'side column': '.cv-aside',
  'action bar': '[data-shell-bar]',
  BackToTop: 'a[href="#top"]',
  'closing band': '.fj-band',
  footer: 'footer',
} as const;

async function openIn(page: Page, path: string, theme: (typeof themes)[number]) {
  await page.addInitScript((t) => localStorage.setItem('theme', t), theme);
  await page.emulateMedia({ colorScheme: theme === 'natt' ? 'dark' : 'light' });
  await page.goto(path);
  await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme);
}

for (const path of pages) {
  for (const theme of themes) {
    test.describe(`${path} printed from ${theme}`, () => {
      test.beforeEach(async ({ page }) => {
        await openIn(page, path, theme);
        await page.emulateMedia({
          media: 'print',
          colorScheme: theme === 'natt' ? 'dark' : 'light',
        });
      });

      for (const [name, selector] of Object.entries(hidden)) {
        test(`does not render the ${name} (AC-11)`, async ({ page }) => {
          const nodes = page.locator(selector);
          const count = await nodes.count();
          for (let i = 0; i < count; i++) {
            const display = await nodes.nth(i).evaluate((el) => {
              const box = el.getBoundingClientRect();
              const style = getComputedStyle(el);
              return style.display === 'none' || style.visibility === 'hidden'
                ? 'none'
                : box.width * box.height > 0
                  ? 'rendered'
                  : 'none';
            });
            expect(display, `${selector} #${i}`).toBe('none');
          }
        });
      }

      test('renders the contact line once, with the four facts (AC-11, AC-27)', async ({
        page,
      }) => {
        const line = page.locator('.cv-print-line');
        await expect(line).toHaveCount(1);
        await expect(line).toBeVisible();
        const links = await line
          .locator('a')
          .evaluateAll((as) => as.map((a) => a.getAttribute('href')));
        expect(links.some((h) => h?.startsWith('mailto:'))).toBe(true);
        expect(links.some((h) => h?.startsWith('tel:'))).toBe(true);
        expect(links.some((h) => h?.includes('linkedin.com'))).toBe(true);
        expect(links.some((h) => h?.includes('github.com'))).toBe(true);
      });

      test('prints the name, the role line, the location line and every section (AC-11)', async ({
        page,
      }) => {
        await expect(page.locator('h1')).toBeVisible();
        await expect(page.locator('.cv-head .role')).toBeVisible();
        await expect(page.locator('.cv-head .place')).toBeVisible();
        const sections = page.locator('main section[id]');
        expect(await sections.count()).toBe(8);
        for (let i = 0; i < 8; i++) await expect(sections.nth(i)).toBeVisible();
      });

      test('the sheet is white and the text is the Dag text colour (AC-12)', async ({ page }) => {
        const colours = await page.evaluate(() => {
          const probe = document.createElement('i');
          const resolve = (name: string) => {
            probe.style.color = `var(${name})`;
            document.body.append(probe);
            const value = getComputedStyle(probe).color;
            probe.remove();
            return value;
          };
          const bodyBg = getComputedStyle(document.body).backgroundColor;
          const rootBg = getComputedStyle(document.documentElement).backgroundColor;
          return {
            bodyBg,
            rootBg,
            text: getComputedStyle(
              document.querySelector('.cv-section p, .cv-section li') as Element,
            ).color,
            printText: resolve('--fjord-print-text'),
            printBg: resolve('--fjord-print-bg'),
          };
        });
        expect(colours.printBg).toBe('rgb(255, 255, 255)');
        const sheet = [colours.bodyBg, colours.rootBg].filter((c) => c !== 'rgba(0, 0, 0, 0)');
        expect(sheet.length).toBeGreaterThan(0);
        for (const c of sheet) expect(c).toBe('rgb(255, 255, 255)');
        expect(colours.text).toBe(colours.printText);
      });

      test('links to other sites show their address (AC-11)', async ({ page }) => {
        const external = page.locator('main a[href^="http"]:not(.cv-print-line a)');
        const count = await external.count();
        expect(count).toBeGreaterThan(0);
        for (let i = 0; i < count; i++) {
          const result = await external.nth(i).evaluate((a) => {
            const after = getComputedStyle(a, '::after').content;
            return { after, href: a.getAttribute('href') ?? '', text: a.textContent ?? '' };
          });
          const shown =
            result.text.includes(result.href.replace(/^https?:\/\//, '')) ||
            result.after.includes('attr(href)') ||
            result.after.includes(result.href.replace(/^https?:\/\//, ''));
          expect(shown, result.href).toBe(true);
        }
      });

      test('keeps entries whole and headings with their content (AC-11)', async ({ page }) => {
        const rules = await page.evaluate(() => {
          const avoidInside = (sel: string) =>
            [...document.querySelectorAll(sel)].map((el) => {
              const s = getComputedStyle(el);
              return s.breakInside === 'avoid' || s.breakInside === 'avoid-page';
            });
          const headings = [...document.querySelectorAll('main section[id] > :first-child')].map(
            (el) => {
              const s = getComputedStyle(el);
              return s.breakAfter === 'avoid' || s.breakAfter === 'avoid-page';
            },
          );
          const jobHeads = [...document.querySelectorAll('.cv-job__head')].map((el) => {
            const s = getComputedStyle(el);
            return s.breakAfter === 'avoid' || s.breakAfter === 'avoid-page';
          });
          return {
            // A job is longer than a sheet can spare: its head stays with what follows and each of
            // its parts stays whole, the job itself may run over (Owner, 2026-10-10).
            jobHeads,
            jobParts: avoidInside('.cv-job__list > li, .cv-job__text > p'),
            projects: avoidInside('.cv-projects__item'),
            rows: avoidInside('.dated-rows > li'),
            headings,
          };
        });
        for (const [kind, flags] of Object.entries(rules)) {
          expect(flags.length, kind).toBeGreaterThan(0);
          expect(flags.every(Boolean), kind).toBe(true);
        }
        const wholeJobs = await page.evaluate(() =>
          [...document.querySelectorAll('.cv-job')].map((el) => getComputedStyle(el).breakInside),
        );
        // Keeping a whole job together pushed it to the next sheet and left the sheet before half empty.
        for (const value of wholeJobs) expect(value).toBe('auto');
      });

      test('does not print the skip link even while it has focus (AC-11)', async ({ page }) => {
        await page.emulateMedia({ media: 'screen' });
        await page.keyboard.press('Tab');
        await expect(page.locator('.skip-link')).toBeFocused();
        await page.emulateMedia({ media: 'print' });
        expect(
          await page.locator('.skip-link').evaluate((el) => getComputedStyle(el).display),
        ).toBe('none');
      });

      test('prints an A4 document and leaves the theme on screen alone (AC-12)', async ({
        page,
      }) => {
        const before = await page.evaluate(() => document.documentElement.dataset.theme);
        const pdf = await page.pdf({ format: 'A4', printBackground: true });
        expect(pdf.subarray(0, 4).toString()).toBe('%PDF');
        const pageCount = (pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) ?? []).length;
        expect(pageCount).toBeGreaterThan(0);
        // The two-page CV prints on two sheets, three at most: no half-empty sheets.
        expect(pageCount).toBeLessThanOrEqual(3);
        expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBe(before);
        await page.emulateMedia({ media: 'screen' });
        expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBe(theme);
      });
    });
  }

  test(`${path}: on screen the contact line is not displayed and not in the accessibility tree (AC-11)`, async ({
    page,
  }) => {
    await page.goto(path);
    const line = page.locator('.cv-print-line');
    await expect(line).toHaveCount(1);
    await expect(line).toBeHidden();
    await expect(
      page.getByRole('link', { name: /@/ }).filter({ has: page.locator('.cv-print-line') }),
    ).toHaveCount(0);
    const inTree = await line.evaluate((el) => getComputedStyle(el).display);
    expect(inTree).toBe('none');
  });

  test(`${path}: Print is offered, not primary, and asks the browser to print (AC-11, AC-06)`, async ({
    page,
  }) => {
    await page.addInitScript(() => {
      (window as unknown as { __prints: number }).__prints = 0;
      window.print = () => void ((window as unknown as { __prints: number }).__prints += 1);
    });
    await page.goto(path);
    const label = path === '/cv/no' ? 'Skriv ut' : 'Print';
    const button = page.locator('.cv-head').getByRole('button', { name: label });
    await expect(button).toBeVisible();
    await expect(button).not.toHaveClass(/fj-btn--primary/);
    await button.click();
    expect(await page.evaluate(() => (window as unknown as { __prints: number }).__prints)).toBe(1);
  });
}

test.describe('scripts off', () => {
  test.use({ javaScriptEnabled: false });

  for (const path of pages) {
    test(`${path}: Print is not displayed and leaves no gap (AC-11)`, async ({ page }) => {
      await page.goto(path);
      const label = path === '/cv/no' ? 'Skriv ut' : 'Print';
      const button = page.locator('.cv-head [data-needs-script]').filter({ hasText: label });
      expect(await button.count()).toBe(1);
      expect(await button.count()).toBeGreaterThan(0);
      for (let i = 0; i < (await button.count()); i++) {
        const box = await button.nth(i).evaluate((el) => {
          const r = el.getBoundingClientRect();
          return { display: getComputedStyle(el).display, w: r.width, h: r.height };
        });
        expect(box.display).toBe('none');
        expect(box.w * box.h).toBe(0);
      }
      // The contact line stays out of the screen view without scripts too.
      await expect(page.locator('.cv-print-line')).toBeHidden();
    });
  }
});
