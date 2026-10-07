// @ts-check
// Build configs for src/pages/_index.test.ts: the site config with fixture content in place of
// the real content, so that the real pages are built from it. Never used for the real build.
import { fileURLToPath } from 'node:url';
import { normalizePath } from 'vite';
import base from '../../../astro.config.mjs';

/** @param {string} path Path relative to this folder. */
const here = (path) => normalizePath(fileURLToPath(new URL(path, import.meta.url)));

const realHome = here('../../data/home.ts');
const realContentConfig = here('../../content.config.ts');
const REAL_PROJECTS = "'./src/content/projects'";

/**
 * @param {object} fixtures
 * @param {string} [fixtures.home] Module next to this file that stands in for src/data/home.ts.
 * @param {string} [fixtures.projects] Folder next to this file that stands in for src/content/projects.
 */
export function fixtureConfig({ home, projects }) {
  const homeFixture = home && here(home);
  return {
    ...base,
    vite: {
      ...base.vite,
      plugins: [
        ...(base.vite?.plugins ?? []),
        {
          name: 'home-fixtures',
          enforce: /** @type {const} */ ('pre'),
          /**
           * @this {import('vite').Rollup.PluginContext}
           * @param {string} source
           * @param {string | undefined} importer
           * @param {object} options
           */
          async resolveId(source, importer, options) {
            // The fixture itself reads the real data.
            if (!homeFixture || !importer || normalizePath(importer) === homeFixture) return null;
            const resolved = await this.resolve(source, importer, { ...options, skipSelf: true });
            return resolved && normalizePath(resolved.id) === realHome ? homeFixture : null;
          },
          /**
           * @param {string} code
           * @param {string} id
           */
          transform(code, id) {
            if (!projects || normalizePath(id) !== realContentConfig) return null;
            if (!code.includes(REAL_PROJECTS)) {
              throw new Error(`home-fixtures: ${REAL_PROJECTS} not found in src/content.config.ts`);
            }
            return code.replace(REAL_PROJECTS, JSON.stringify(`./src/pages/_fixtures/${projects}`));
          },
        },
      ],
    },
  };
}
