// Captures design reference screenshots from the standalone mockup (roadmap D1, fjord-foundation
// T15): the Natt counterparts of the existing Dag references (full page at 1918px) and the
// not-found screen at the visual-test breakpoints in both themes. Writes only files that do not
// exist yet; existing references are never touched (design/ is read-only otherwise).
//
// Run from the repo root: node tools/screenshots/capture-references.mjs

import { existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { chromium } from '@playwright/test';

const MOCKUP = pathToFileURL('design/handoff/site/alpon.dev standalone.html').href;
const OUT = 'design/screenshots';

const FULL_PAGES = [
  ['home', '#/'],
  ['projects', '#/projects'],
  ['project_1', '#/projects/project-one'],
  ['project_2', '#/projects/project-two'],
  ['project_3', '#/projects/project-three'],
  ['cv', '#/cv/en'],
  ['thoughts', '#/thoughts'],
  ['thought_1', '#/thoughts/performance-budget'],
];

const shots = [
  ...FULL_PAGES.map(([name, hash]) => ({ file: `natt_${name}.png`, theme: 'natt', hash, width: 1918, fullPage: true })),
  { file: 'natt_search.png', theme: 'natt', hash: '#/', width: 1918, height: 910, search: true },
  ...['dag', 'natt'].flatMap((theme) =>
    [390, 834, 1440].map((width) => ({ file: `${theme}_not_found_${width}.png`, theme, hash: '#/nowhere', width, fullPage: true })),
  ),
];

const browser = await chromium.launch();
for (const shot of shots) {
  const path = `${OUT}/${shot.file}`;
  if (existsSync(path)) {
    console.log(`kept ${path}`);
    continue;
  }
  const context = await browser.newContext({
    viewport: { width: shot.width, height: shot.height ?? 900 },
    colorScheme: shot.theme === 'natt' ? 'dark' : 'light',
    reducedMotion: 'reduce',
  });
  await context.addInitScript((theme) => localStorage.setItem('fjord-theme', theme), shot.theme);
  const page = await context.newPage();
  await page.goto(`${MOCKUP}${shot.hash}`);
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1500);
  if (shot.search) {
    await page.keyboard.press('Control+K');
    await page.waitForTimeout(500);
  }
  await page.screenshot({ path, fullPage: shot.fullPage ?? false });
  console.log(`wrote ${path}`);
  await context.close();
}
await browser.close();
