import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test, type Page } from '@playwright/test';

// The Shell end to end on the home placeholder and the Not-found page (base-components T18):
// AC-01, AC-02, AC-03, AC-06, AC-13, AC-14, AC-20, AC-24, AC-25, AC-31. Reduced motion is emulated
// by default (spec section 1).
test.use({ reducedMotion: 'reduce' });

const pages = [
  { name: 'home', path: '/', band: true },
  { name: 'Not-found', path: '/does-not-exist', band: false },
] as const;

const widths = { phone: 390, tablet: 834, desktop: 1440 } as const;

async function open(page: Page, path: string, width: number) {
  await page.setViewportSize({ width, height: 844 });
  await page.goto(path);
}

for (const { name, path, band } of pages) {
  test.describe(`${name} page`, () => {
    test('header at 390 shows the wordmark, "Get in touch" and the menu button, no links (AC-01, AC-02)', async ({
      page,
    }) => {
      await open(page, path, widths.phone);
      const header = page.locator('header');
      await expect(header.locator('a[href="/"]').first()).toBeVisible();
      await expect(header.getByRole('link', { name: 'Get in touch' })).toBeVisible();
      await expect(header.getByRole('button', { name: 'Open menu' })).toBeVisible();
      await expect(header.getByRole('link', { name: 'CV', exact: true })).toBeHidden();
      await expect(header.getByRole('link', { name: 'Contact', exact: true })).toBeHidden();
    });

    for (const width of [widths.tablet, widths.desktop]) {
      test(`header at ${width} shows the links, the theme switch and "Get in touch" with an arrow (AC-01, AC-02)`, async ({
        page,
      }) => {
        await open(page, path, width);
        const header = page.locator('header');
        await expect(header.locator('a[href="/"]').first()).toBeVisible();
        await expect(header.getByRole('link', { name: 'CV', exact: true })).toBeVisible();
        await expect(header.getByRole('link', { name: 'Contact', exact: true })).toBeVisible();
        await expect(header.getByRole('button', { name: 'Open menu' })).toBeHidden();
        await expect(header.locator('.header__theme')).toBeVisible();
        const cta = header.getByRole('link', { name: 'Get in touch' });
        await expect(cta).toBeVisible();
        await expect(cta.locator('svg')).toBeVisible();
        await expect(header.getByText(/projects|search/i)).toHaveCount(0);
        await expect(header.locator('a[href^="/projects"]')).toHaveCount(0);
      });
    }

    test('the menu has no "Projects" link and no search (AC-02)', async ({ page }) => {
      await open(page, path, widths.phone);
      const menu = page.locator('#mobile-menu');
      await expect(menu.getByText(/projects|search/i)).toHaveCount(0);
    });

    test('the header gains a border after scroll and loses it at the top (AC-03)', async ({
      page,
    }) => {
      await open(page, path, widths.phone);
      // Make short pages scrollable.
      await page.evaluate(() => {
        const main = document.querySelector('main');
        if (main) main.style.minHeight = '3000px';
      });
      const header = page.locator('header[data-header]');
      await expect(header).not.toHaveAttribute('data-scrolled', /.*/);
      await page.evaluate(() => window.scrollTo(0, 600));
      await expect(header).toHaveAttribute('data-scrolled', '');
      await expect(header).toHaveCSS('border-bottom-style', 'solid');
      const color = await header.evaluate((el) => getComputedStyle(el).borderBottomColor);
      expect(color).not.toBe('rgba(0, 0, 0, 0)');
      expect((await header.boundingBox())?.y).toBe(0);
      await page.evaluate(() => window.scrollTo(0, 0));
      await expect(header).not.toHaveAttribute('data-scrolled', /.*/);
    });

    test('first Tab lands on "Skip to content" and Enter moves focus to main (AC-13)', async ({
      page,
    }) => {
      await open(page, path, widths.desktop);
      await page.keyboard.press('Tab');
      const skip = page.getByRole('link', { name: 'Skip to content' });
      await expect(skip).toBeFocused();
      await expect(skip).toBeInViewport();
      await page.keyboard.press('Enter');
      await expect(page.locator('#main')).toBeFocused();
    });

    test('footer facts, with language and link relations (AC-14)', async ({ page }) => {
      await open(page, path, widths.desktop);
      const footer = page.locator('footer');
      await expect(footer.getByText('Good products are built together.')).toBeVisible();
      await expect(footer.getByRole('link', { name: 'ponomaleks@gmail.com' })).toHaveAttribute(
        'href',
        'mailto:ponomaleks@gmail.com',
      );
      await expect(footer.getByRole('link', { name: '+47 405 94 584' })).toHaveAttribute(
        'href',
        'tel:+4740594584',
      );
      for (const [text, href] of [
        ['linkedin.com/in/ponomalex', 'https://www.linkedin.com/in/ponomalex/'],
        ['github.com/ponomaleks', 'https://github.com/ponomaleks'],
      ] as const) {
        const link = footer.getByRole('link', { name: text });
        await expect(link).toHaveAttribute('href', href);
        await expect(link).toHaveAttribute('rel', /noopener/);
        await expect(link).toHaveAttribute('rel', /noreferrer/);
      }
      await expect(footer.getByText('Based in')).toBeVisible();
      await expect(footer.locator('[lang="no"]', { hasText: 'Nittedal, Norge' })).toBeVisible();
      await expect(footer.getByText('60.07° N, 10.87° E')).toBeVisible();
      const year = new Date().getFullYear();
      await expect(footer.getByText(`© ${year} Alexander Ponomarenko`)).toBeVisible();
      const updated = footer.locator('[lang="no"]', { hasText: 'Sist oppdatert' });
      await expect(updated).toBeVisible();
      await expect(updated.locator('time')).toHaveAttribute('datetime', /^\d{4}-\d{2}-\d{2}$/);
    });

    test(`the closing band is ${band ? 'there with its downloads' : 'left out'} (AC-20, AC-24)`, async ({
      page,
    }) => {
      await open(page, path, widths.desktop);
      const heading = page.getByRole('heading', { name: 'Let’s build something good together.' });
      if (!band) {
        await expect(heading).toHaveCount(0);
        return;
      }
      await expect(heading).toBeVisible();
      const section = page.locator('section.fj-band');
      await expect(section.getByText(/hiring in the Oslo area/)).toBeVisible();
      await expect(section.getByRole('link', { name: 'Get in touch' })).toHaveAttribute(
        'href',
        '/#contact',
      );
      const download = section.getByRole('link', { name: 'Download CV' });
      await expect(download).toHaveAttribute('href', '/cv/alexander-ponomarenko-cv-en.pdf');
      await expect(download).toHaveAttribute('download', '');
    });

    test('every Shell control has a touch target of at least 44 x 44 at 390 (AC-25)', async ({
      page,
    }) => {
      await open(page, path, widths.phone);
      // The target is the control's box, widened by its invisible overlay where the design draws
      // the control lower than 44 px (spec D-08). Footer text links are the exception of AC-25:
      // they are as high as their line and are checked for spacing below.
      const regions = ['header', '[data-shell-bar]', 'footer', 'section.fj-band'];
      const small: string[] = [];
      for (const region of regions) {
        for (const control of await page.locator(`${region} :is(a[href], button)`).all()) {
          if (!(await control.isVisible())) continue;
          if (await control.evaluate((el) => el.matches('.fj-footer__col a'))) continue;
          const target = await control.evaluate((el) => {
            const box = el.getBoundingClientRect();
            const overlay = getComputedStyle(el, '::before');
            const has = overlay.content !== 'none' && overlay.position === 'absolute';
            return {
              width: Math.max(box.width, has ? parseFloat(overlay.width) : 0),
              height: Math.max(box.height, has ? parseFloat(overlay.height) : 0),
            };
          });
          if (target.width < 44 || target.height < 44) {
            const label =
              ((await control.textContent()) ?? '').trim() ||
              (await control.getAttribute('aria-label'));
            small.push(
              `${region} "${label}" ${Math.round(target.width)}x${Math.round(target.height)}`,
            );
          }
        }
      }
      expect(small).toEqual([]);
    });

    test('footer text links keep 24 px between their centres (AC-25, WCAG 2.5.8 spacing)', async ({
      page,
    }) => {
      await open(page, path, widths.phone);
      const centres = await page.locator('footer .fj-footer__col a').evaluateAll((links) =>
        links.map((link) => {
          const box = link.getBoundingClientRect();
          return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
        }),
      );
      expect(centres.length).toBeGreaterThanOrEqual(4);
      for (const [i, one] of centres.entries()) {
        for (const two of centres.slice(i + 1)) {
          expect(Math.hypot(one.x - two.x, one.y - two.y)).toBeGreaterThanOrEqual(24);
        }
      }
    });
  });
}

test.describe('scripts off at 390 (AC-06)', () => {
  test.use({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });

  for (const { name, path } of pages) {
    test(`${name}: the bar offers "View CV" and "Get in touch"; script-only controls leave no gap`, async ({
      page,
    }) => {
      await page.goto(path);
      const bar = page.locator('[data-shell-bar]');
      await expect(bar).toBeInViewport();
      await expect(bar.getByRole('link', { name: 'View CV' })).toHaveAttribute('href', '/cv');
      await expect(bar.getByRole('link', { name: 'Get in touch' })).toHaveAttribute(
        'href',
        '/#contact',
      );
      const header = page.locator('header');
      await expect(header.getByRole('button', { name: 'Open menu' })).not.toBeVisible();
      for (const element of await header.locator('[data-needs-script]').all()) {
        await expect(element).toHaveCSS('display', 'none');
      }
      const cta = await header.getByRole('link', { name: 'Get in touch' }).boundingBox();
      // The call to action sits against the header's own padding, not behind an empty slot.
      expect(390 - (cta?.x ?? 0) - (cta?.width ?? 0)).toBeLessThanOrEqual(16 + 1);
    });
  }
});

// AC-24: a page for Visitors may leave out the bar only if its own content links to the CV.
test('a built Visitor page without the bar links to the CV from its own main (AC-24)', () => {
  const walk = (dir: string): string[] =>
    readdirSync(dir).flatMap((entry) => {
      const full = join(dir, entry);
      if (entry === '_astro') return [];
      return statSync(full).isDirectory() ? walk(full) : full.endsWith('.html') ? [full] : [];
    });
  const files = walk(join(process.cwd(), 'dist'));
  expect(files.length).toBeGreaterThan(1);
  const barless = files.filter((file) => !readFileSync(file, 'utf8').includes('data-shell-bar'));
  const exempt = barless.filter((file) => /styleguide/.test(file));
  expect(exempt.length, 'the Styleguide is the barless exemption').toBe(1);
  const offenders = barless
    .filter((file) => !exempt.includes(file))
    .filter((file) => {
      const main = /<main[\s\S]*?<\/main>/.exec(readFileSync(file, 'utf8'))?.[0] ?? '';
      return !/<a[^>]+href="\/cv[/"#]/.test(main);
    });
  expect(offenders).toEqual([]);
});
