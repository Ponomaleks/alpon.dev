import { expect, test, type Page } from '@playwright/test';

// The two CV pages end to end (AC-01 to AC-05, AC-16, AC-23, AC-24; screens SCR-05 / SCR-06): the
// order and labels of the content, the side column from 1024, the downloads, the Shell's CV links
// and the closing band, the same with scripts off and the 44 x 44 targets at 390.

type Lang = 'en' | 'no';

const pages: Record<
  Lang,
  {
    path: string;
    headings: string[];
    levels: string[];
    download: string;
    file: string;
    href: string;
    touch: string;
    toc: string;
  }
> = {
  en: {
    path: '/cv/en',
    headings: [
      'Profile',
      'Skills',
      'Languages',
      'Work experience',
      'Personal projects',
      'Education',
      'Courses',
      'Community & volunteering',
    ],
    levels: ['Upper-intermediate', 'Intermediate', 'Native'],
    download: 'Download PDF',
    file: 'Alexander_Ponomarenko_CV_EN.pdf',
    href: '/cv/alexander-ponomarenko-cv-en.pdf',
    touch: 'Get in touch',
    toc: 'On this page',
  },
  no: {
    path: '/cv/no',
    headings: [
      'Profil',
      'Kompetanse',
      'Språk',
      'Arbeidserfaring',
      'Personlige prosjekter',
      'Utdanning',
      'Kurs',
      'Samfunnsengasjement og frivillig arbeid',
    ],
    levels: ['Øvre mellomnivå', 'Mellomnivå', 'Morsmål'],
    download: 'Last ned PDF',
    file: 'Alexander_Ponomarenko_CV_NO.pdf',
    href: '/cv/alexander-ponomarenko-cv-no.pdf',
    touch: 'Ta kontakt',
    toc: 'På denne siden',
  },
};

const IDS = [
  'profile',
  'skills',
  'languages',
  'experience',
  'projects',
  'education',
  'courses',
  'community',
];

// Astro escapes "&" in text; innerText already decodes it, this guards helpers that read markup.
const decode = (s: string) =>
  s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);

const bodyText = (page: Page) => page.locator('main').innerText();

for (const lang of ['en', 'no'] as const) {
  const p = pages[lang];

  test.describe(`${p.path}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(p.path);
    });

    test('content order and labels (AC-01, AC-02)', async ({ page }) => {
      await expect(page.locator('html')).toHaveAttribute('lang', lang);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('h1')).toHaveText('Alexander Ponomarenko');
      await expect(page.locator('main nav.crumbs li')).toHaveText(['alpon.dev', 'CV']);
      await expect(page.locator('.cv-head .place')).toContainText(
        lang === 'en' ? '1482 Nittedal, Norway' : '1482 Nittedal, Norge',
      );
      await expect(page.locator('main article section[id] h2')).toHaveText(
        p.headings.map((h) => new RegExp(String.raw`${escapeRe(h)}$`)),
      );
      const ids = await page.evaluate(() =>
        [...document.querySelectorAll('main article section[id]')].map((s) => s.id),
      );
      expect(ids).toEqual(IDS);
      await expect(page.locator('.cv-head').getByRole('link', { name: p.download })).toBeVisible();
      await expect(page.locator('.cv-head').getByRole('link', { name: p.touch })).toBeVisible();
      await expect(page.locator('.cv-preview summary')).toContainText(
        lang === 'en' ? 'View original PDF' : 'Se original-PDF',
      );
    });

    test('plain language levels, no brackets, no bars (AC-03)', async ({ page }) => {
      const text = decode(await bodyText(page));
      for (const level of p.levels) expect(text).toContain(level);
      expect(text).not.toMatch(/\b[ABC][12]\b/);
      expect(text).not.toMatch(/\[[^\]]*\]/);
      expect(text).not.toMatch(/\d+\s?%/);
      await expect(
        page.locator('main [role="progressbar"], main meter, main progress'),
      ).toHaveCount(0);
      await expect(page.locator('main article img')).toHaveCount(0);
    });

    test('side column at 1440: contents, contact, download (AC-04)', async ({ page }) => {
      const aside = page.locator('.cv-aside');
      await expect(aside).toBeVisible();
      await expect(aside.getByText(p.toc, { exact: true })).toBeVisible();
      await expect(aside.locator('nav ol li a')).toHaveCount(8);
      await expect(aside.locator('a[href^="mailto:"]')).toBeVisible();
      await expect(aside.locator('a[href^="tel:"]')).toBeVisible();
      await expect(aside.locator('a[href*="linkedin.com"]')).toBeVisible();
      await expect(aside.locator('a[href*="github.com"]')).toBeVisible();
      await expect(aside).toContainText('Nittedal, Norge');
      await expect(aside.getByRole('link', { name: p.download })).toBeVisible();
    });

    test('a contents link puts the heading clear of the header (AC-04)', async ({ page }) => {
      await page.locator('.cv-aside nav ol li a').nth(3).click();
      await expect(page).toHaveURL(/#experience$/);
      await expect
        .poll(() =>
          page.evaluate(() => {
            const h = document.querySelector('#experience h2')?.getBoundingClientRect().top;
            const header = document.querySelector('header')?.getBoundingClientRect().bottom;
            // A missing element gives NaN, which fails the comparison below.
            return (h ?? NaN) - (header ?? NaN);
          }),
        )
        .toBeGreaterThanOrEqual(0);
    });

    test('three downloads with the file name, a CV date that is not the footer date (AC-05)', async ({
      page,
    }) => {
      for (const scope of ['.cv-head', '.cv-aside', '.fj-band']) {
        const link = page.locator(`${scope} a[href="${p.href}"]`);
        await expect(link).toHaveCount(1);
        await expect(link).toHaveAttribute('download', p.file);
      }
      await expect(
        page.locator('.fj-band').getByRole('link', { name: 'Download CV' }),
      ).toBeVisible();

      const meta = page.locator('.cv-head .cv-meta');
      await expect(meta).toContainText(lang === 'en' ? 'PDF · 2 pages · A4' : 'PDF · 2 sider · A4');
      await expect(meta).toContainText(lang === 'en' ? 'Last updated' : 'Sist oppdatert');
      const date = await meta.locator('time').getAttribute('datetime');
      const footer = await page.locator('footer time').getAttribute('datetime');
      expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(date).not.toBe(footer);
    });

    test("the Shell's CV link and the band (AC-16)", async ({ page }) => {
      const cv = page.locator('header').getByRole('link', { name: 'CV', exact: true });
      await expect(cv).toHaveAttribute('href', p.path);
      await expect(cv).toHaveAttribute('aria-current', 'page');
      const touch = page.locator('.fj-band').getByRole('link', { name: 'Get in touch' });
      await expect(touch).toHaveCount(1);
      await expect(touch).toHaveAttribute('href', /#contact$/);
    });
  });
}

test('the CV date is the same on both pages (AC-05)', async ({ page }) => {
  const dates: (string | null)[] = [];
  for (const lang of ['en', 'no'] as const) {
    await page.goto(pages[lang].path);
    dates.push(await page.locator('.cv-head .cv-meta time').getAttribute('datetime'));
  }
  expect(dates[0]).toBeTruthy();
  expect(dates[0]).toBe(dates[1]);
});

test.describe('the side column by width (AC-04)', () => {
  for (const width of [1024, 1440]) {
    test(`shown at ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/cv/en');
      await expect(page.locator('.cv-aside')).toBeVisible();
    });
  }
  for (const width of [390, 834]) {
    test(`not displayed at ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/cv/en');
      await expect(page.locator('.cv-aside')).toHaveCSS('display', 'none');
    });
  }
});

test.describe('the Shell CV links (AC-16)', () => {
  test('from the home page the header and "View CV" reach the English CV page', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await expect(
      page.locator('header').getByRole('link', { name: 'CV', exact: true }),
    ).toHaveAttribute('href', '/cv/en');
    await expect(
      page.locator('main').getByRole('link', { name: 'View CV' }).first(),
    ).toHaveAttribute('href', '/cv/en');
  });

  test('in the mobile menu on the Norwegian page "CV" leads to /cv/no and is current', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/cv/no');
    await page.locator('header').getByRole('button', { name: 'Open menu' }).click();
    const link = page.locator('dialog#mobile-menu').getByRole('link', { name: /CV$/ });
    await expect(link).toHaveAttribute('href', '/cv/no');
    await expect(link).toHaveAttribute('aria-current', 'page');
  });
});

test.describe('scripts off (AC-23)', () => {
  test.use({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });

  for (const lang of ['en', 'no'] as const) {
    const p = pages[lang];
    const otherLang: Lang = lang === 'en' ? 'no' : 'en';
    test(`${p.path}: sections, switch, downloads, preview and contact links work`, async ({
      page,
    }) => {
      await page.goto(p.path);
      await expect(page.locator('main article section[id]')).toHaveCount(8);
      for (const h of p.headings) {
        await expect(page.locator('main section[id] h2').filter({ hasText: h })).toBeVisible();
      }
      const sw = page.locator('.cv-head [data-lang-switch]');
      await expect(sw.locator(`a[data-switch-to="${lang}"]`)).toHaveAttribute(
        'aria-current',
        'true',
      );
      await expect(sw.locator(`a[data-switch-to="${otherLang}"]`)).toHaveAttribute(
        'href',
        pages[otherLang].path,
      );
      await expect(
        page.locator('.cv-head').getByRole('link', { name: p.download }),
      ).toHaveAttribute('download', p.file);
      await expect(
        page.locator('.cv-aside').getByRole('link', { name: p.download }),
      ).toHaveAttribute('download', p.file);
      // The preview is a native <details>: it opens without a script.
      await page.locator('.cv-preview summary').click();
      await expect(page.locator('.cv-preview')).toHaveAttribute('open', '');
      await expect(page.locator('.cv-preview a[target="_blank"]')).toHaveCount(2);
      const aside = page.locator('.cv-aside');
      for (const sel of [
        'a[href^="mailto:"]',
        'a[href^="tel:"]',
        'a[href*="linkedin"]',
        'a[href*="github"]',
      ]) {
        await expect(aside.locator(sel)).toBeVisible();
      }
      await expect(aside.locator('[data-copy-email]')).toBeHidden();
      await expect(page.getByRole('button', { name: /^(Copy|Kopier)$/ })).toHaveCount(0);
    });
  }

  test('the language switch opens the other page at its top', async ({ page }) => {
    await page.goto('/cv/en');
    await page.locator('.cv-head [data-lang-switch] a[data-switch-to="no"]').click();
    await expect(page).toHaveURL(/\/cv\/no$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'no');
  });
});

// AC-24: every interactive element of the page content is at least 44 x 44 at 390, with the
// preview closed and open, counting its overlay (spec §6 Touch targets; the measurement of
// shell.spec.ts). Links inside running text are exempt (WCAG 2.5.8 inline exception).
test.describe('targets of at least 44 x 44 at 390 (AC-24)', () => {
  test.use({ viewport: { width: 390, height: 844 } });
  for (const lang of ['en', 'no'] as const) {
    for (const state of ['closed', 'open'] as const) {
      test(`${pages[lang].path}, preview ${state}`, async ({ page }) => {
        await page.goto(pages[lang].path);
        if (state === 'open') {
          await page.locator('.cv-preview summary').click();
          await expect(page.locator('.cv-preview')).toHaveAttribute('open', '');
        }
        const small = await page.evaluate(() => {
          const sel =
            'a[href], button, summary, input, select, textarea, [tabindex]:not([tabindex="-1"])';
          return [...document.querySelectorAll(`main ${sel}`)]
            .filter((el) => {
              const s = getComputedStyle(el);
              const r = el.getBoundingClientRect();
              return (
                s.display !== 'none' && s.visibility !== 'hidden' && r.width > 0 && r.height > 0
              );
            })
            .filter((el) => !el.closest('article p, article li'))
            .map((el) => {
              // The target is the control's box, widened by its invisible overlay where the
              // design draws the control lower than 44 px (spec §6 Touch targets, screens C-7).
              const r = el.getBoundingClientRect();
              const overlay = getComputedStyle(el, '::before');
              const has = overlay.content !== 'none' && overlay.position === 'absolute';
              return {
                text: (el.textContent ?? '').trim().slice(0, 40),
                w: Math.max(r.width, has ? parseFloat(overlay.width) : 0),
                h: Math.max(r.height, has ? parseFloat(overlay.height) : 0),
              };
            })
            .filter((m) => m.w < 44 || m.h < 44);
        });
        expect(small).toEqual([]);
      });
    }
  }
});
