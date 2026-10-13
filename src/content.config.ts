// Content collections. `projects`: one markdown file per portfolio project (home AC-12); the
// folder is empty until step 7 adds the first Published project.
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { projectSchema } from './data/projects';

const projects = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/projects' }),
  schema: projectSchema,
});

export const collections = { projects };
