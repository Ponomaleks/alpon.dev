// Sample data for the Styleguide only (home AC-12): the Dormant Selected projects section is shown
// there with these projects under a "Sample data" label. They are not real projects; the bracketed
// result values mark them as samples and are allowed only inside a data-sample block (AC-28).
// Copy from design/handoff/site/project/site/data.js.
import type { Project } from './projects';

export const sampleProjects: Project[] = [
  {
    slug: 'project-one',
    title: 'Project One',
    summary: 'Booking app for small teams: shared calendars, reminders and a public booking page.',
    status: 'live',
    year: 2026,
    result: { value: '[1.2 s]', label: 'median load on 4G' },
    tags: ['TypeScript', 'React', 'FastAPI', 'PostgreSQL'],
    live: 'https://one.alpon.dev/',
    code: 'https://github.com/ponomaleks',
    featured: true,
    published: false,
  },
  {
    slug: 'project-two',
    title: 'Project Two',
    summary: 'Typed REST API for public transit departures, with caching and OpenAPI docs.',
    status: 'live',
    year: 2026,
    result: { value: '[42 ms]', label: 'p95 cached response' },
    tags: ['Python', 'FastAPI', 'Redis'],
    live: 'https://api.alpon.dev/',
    code: 'https://github.com/ponomaleks',
    featured: true,
    published: false,
  },
  {
    slug: 'project-three',
    title: 'Project Three',
    summary: 'Small CLI and library that checks a site against a performance budget in CI.',
    status: 'progress',
    year: 2026,
    result: { value: '[0]', label: 'runtime dependencies' },
    tags: ['TypeScript', 'Node.js'],
    code: 'https://github.com/ponomaleks',
    featured: true,
    published: false,
  },
];
