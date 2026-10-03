import { expect, test, type BrowserContext, type Page } from '@playwright/test';
import { platformFonts } from './platform-fonts.ts';

// Theme from the first frame (AC-01..AC-04, sad QG-1): stored Theme choice × device preference,
// unusable stored values, blocked storage and scripts off, on SCR-01 and SCR-02.

const PAGES = ['/', '/does-not-exist'];
const BG = { dag: 'rgb(243, 244, 240)', natt: 'rgb(17, 26, 23)' } as const;
const SCHEME = { dag: 'light', natt: 'dark' } as const;
type Theme = keyof typeof BG;
type Device = 'light' | 'dark';
const deviceTheme = (device: Device): Theme => (device === 'dark' ? 'natt' : 'dag');

interface FirstFrame {
  theme: string | undefined;
  background: string;
  colorScheme: string;
}

/** Runs before any page script: records every data-theme change and the first frame. */
function recordTheme() {
  const w = window as unknown as { __themeWrites: (string | null)[]; __firstFrame?: FirstFrame };
  w.__themeWrites = [];
  new MutationObserver((records) => {
    for (const r of records)
      if (r.attributeName === 'data-theme')
        w.__themeWrites.push((r.target as HTMLElement).getAttribute('data-theme'));
  }).observe(document, { attributes: true, subtree: true, attributeFilter: ['data-theme'] });
  requestAnimationFrame(() => {
    const style = getComputedStyle(document.documentElement);
    w.__firstFrame = {
      theme: document.documentElement.dataset.theme,
      background: style.backgroundColor,
      colorScheme: style.colorScheme,
    };
  });
}

async function open(context: BrowserContext, path: string) {
  const page = await context.newPage();
  const errors: Error[] = [];
  page.on('pageerror', (error) => errors.push(error));
  await page.addInitScript(recordTheme);
  await page.goto(path, { waitUntil: 'load' });
  await page.waitForFunction(() => '__firstFrame' in window);
  return { page, errors };
}

async function observed(page: Page) {
  return page.evaluate(() => {
    const w = window as unknown as { __themeWrites: string[]; __firstFrame: FirstFrame };
    const style = getComputedStyle(document.documentElement);
    return {
      writes: w.__themeWrites,
      first: w.__firstFrame,
      settled: {
        theme: document.documentElement.dataset.theme,
        background: style.backgroundColor,
        colorScheme: style.colorScheme,
      },
    };
  });
}

function expectTheme(result: Awaited<ReturnType<typeof observed>>, theme: Theme) {
  const expected = { theme, background: BG[theme], colorScheme: SCHEME[theme] };
  expect(result.writes, 'data-theme is set exactly once').toEqual([theme]);
  expect(result.first, 'first frame').toEqual(expected);
  expect(result.settled, 'at load').toEqual(expected);
}

for (const path of PAGES) {
  test.describe(`theme on ${path}`, () => {
    for (const device of ['light', 'dark'] as const) {
      test.describe(`device ${device}`, () => {
        test.use({ colorScheme: device });

        for (const stored of ['dag', 'natt', null] as const) {
          test(`stored ${stored ?? 'none'} → ${stored ?? deviceTheme(device)} from the first frame`, async ({
            context,
          }) => {
            if (stored)
              await context.addInitScript((t) => localStorage.setItem('fjord-theme', t), stored);
            const { page, errors } = await open(context, path);
            expectTheme(await observed(page), stored ?? deviceTheme(device));
            expect(errors).toEqual([]);
          });
        }

        test('an unknown stored value falls back to the device, silently', async ({ context }) => {
          await context.addInitScript(() => localStorage.setItem('fjord-theme', 'foo'));
          const { page, errors } = await open(context, path);
          expectTheme(await observed(page), deviceTheme(device));
          expect(errors).toEqual([]);
        });

        test('blocked storage falls back to the device, silently', async ({ context }) => {
          await context.addInitScript(() =>
            Object.defineProperty(window, 'localStorage', {
              get() {
                throw new DOMException('The operation is insecure.', 'SecurityError');
              },
            }),
          );
          const { page, errors } = await open(context, path);
          expectTheme(await observed(page), deviceTheme(device));
          expect(errors).toEqual([]);
        });
      });

      test.describe(`scripts off, device ${device}`, () => {
        test.use({ colorScheme: device, javaScriptEnabled: false });

        test(`renders ${deviceTheme(device)} through the no-JS block, in brand fonts`, async ({
          page,
        }) => {
          await page.goto(path);
          const theme = deviceTheme(device);
          const result = await page.evaluate(() => {
            const html = getComputedStyle(document.documentElement);
            return {
              theme: document.documentElement.dataset.theme ?? null,
              background: html.backgroundColor,
              colorScheme: html.colorScheme,
              font: getComputedStyle(document.body).fontFamily,
            };
          });
          expect(result).toMatchObject({
            theme: null,
            background: BG[theme],
            colorScheme: SCHEME[theme],
          });
          expect(result.font).toMatch(/^"Schibsted Grotesk"/);
          await expect(page.locator('h1')).toBeVisible();
          // The face actually drawn, not just the declared stack (review F-05).
          await page.evaluate(() => document.fonts.ready);
          expect(await platformFonts(page, 'h1')).toEqual([
            expect.objectContaining({ familyName: 'Schibsted Grotesk', isCustomFont: true }),
          ]);
        });
      });
    }
  });
}
