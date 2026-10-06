// @ts-check
import { defineConfig } from 'astro/config';
import csp from './src/integrations/csp.ts';
import oneStylesheet from './src/integrations/one-stylesheet.ts';

// Static output served by Cloudflare Workers static assets (ADR-0001).
// build.format 'file' + trailingSlash 'never': /cv/en builds to dist/cv/en.html,
// and Workers auto-trailing-slash serves it at /cv/en with no redirect.
export default defineConfig({
  site: 'https://alpon.dev',
  output: 'static',
  trailingSlash: 'never',
  // Joins the stylesheets of each page into one file (one request before the first paint), then
  // audits inline code and writes the theme bootstrap hash into dist/_headers (ADR-0002).
  integrations: [oneStylesheet(), csp()],
  build: {
    format: 'file',
    // Never inline CSS into <style>: the CSP allows only style-src 'self' (ADR-0002).
    inlineStylesheets: 'never',
  },
  // Never inline assets as data: URLs either (the global stylesheet is linked by ?url).
  vite: { build: { assetsInlineLimit: 0 } },
});
