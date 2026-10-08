// The shape of a portfolio project (home AC-12) and the choice of the projects a page shows.
// One markdown file per project in src/content/projects/ (src/content.config.ts); the folder is
// empty until step 7, which also owns the switch in site.ts.
import { z } from 'astro/zod';

export const projectSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  status: z.enum(['live', 'progress', 'archived']),
  year: z.number().int(),
  /** One result: the value and what it measures. */
  result: z.object({ value: z.string().min(1), label: z.string().min(1) }),
  tags: z.array(z.string().min(1)).min(1),
  /** Address of the running project, when there is one. */
  live: z.url().optional(),
  /** Address of the source code, when it is public. */
  code: z.url().optional(),
  /** Shown in Selected projects on the home page. */
  featured: z.boolean().default(false),
  /** Ready to be presented on the site with its case study. */
  published: z.boolean().default(false),
});

export type ProjectData = z.infer<typeof projectSchema>;

/** A project entry with the name of its file. */
export interface Project extends ProjectData {
  slug: string;
}

export const STATUS_LABELS: Record<Project['status'], string> = {
  live: 'Live',
  progress: 'In progress',
  archived: 'Archived',
};

const MAX_SELECTED = 3;

/** The featured projects in their order, three at most; the first one is shown large. */
export function selectProjects(list: Project[]): Project[] {
  return list.filter((p) => p.featured).slice(0, MAX_SELECTED);
}

/** What Selected projects shows on the home page: nothing until the switch of step 7 is on. */
export function homeProjects(switchOn: boolean, list: Project[]): Project[] {
  return switchOn ? selectProjects(list.filter((p) => p.published)) : [];
}
