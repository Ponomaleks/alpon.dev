// @ts-check
import { defineConfig } from 'astro/config';

// Static output served by Cloudflare Workers static assets (ADR-0001).
// build.format 'file' + trailingSlash 'never': /cv/en builds to dist/cv/en.html,
// and Workers auto-trailing-slash serves it at /cv/en with no redirect.
export default defineConfig({
  site: 'https://alpon.dev',
  output: 'static',
  trailingSlash: 'never',
  build: {
    format: 'file',
  },
});
