// Writes public/img/contours-ridge-spruce.svg: the ridge contours in the spruce tone, as one image
// file (release-1 D-10). The closing band and the mobile menu show it with <img loading="lazy">,
// so the rings below the first screen are not part of the HTML. Both places are spruce in Dag and
// in Natt, and the tone is one value in both themes, so the file carries the colour itself.
//
// The paths come from src/components/brand/contour-paths.ts and the colour from the token
// --fjord-contour-line-spruce in src/styles/tokens.css. tools/contour-image.test.ts fails when
// the file differs from either. Run from the repository root after a change of the data or the
// token: node tools/contour-image.ts
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { ridge } from '../src/components/brand/contour-paths.ts';

export const IMAGE = 'public/img/contours-ridge-spruce.svg';
export const TOKENS = 'src/styles/tokens.css';
export const TOKEN = '--fjord-contour-line-spruce';

/** The value of a custom property, from its first declaration in the stylesheet. */
export function tokenValue(css: string, name: string): string {
  const value = css.match(new RegExp(`(?:^|[\\s;{])${name}:\\s*([^;}]+)`))?.[1]?.trim();
  if (!value) throw new Error(`${name} is not declared`);
  return value;
}

/**
 * The image: the 85 x 55 view box of the Contours component, one path per ring, 1 px lines at
 * any size. It has no size of its own; the <img> covers its layer (object-fit: cover).
 */
export function contourImage(paths: readonly string[], stroke: string): string {
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 85 55" fill="none" stroke="${stroke}" stroke-width="1">`,
    ...paths.map((d) => `<path d="${d}" vector-effect="non-scaling-stroke"/>`),
    '</svg>',
    '',
  ].join('\n');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const image = contourImage(ridge, tokenValue(readFileSync(TOKENS, 'utf8'), TOKEN));
  writeFileSync(IMAGE, image);
  console.log(`${IMAGE}: ${ridge.length} paths, ${Buffer.byteLength(image)} B`);
}
