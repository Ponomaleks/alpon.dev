// Sample data for the Styleguide only (home AC-12): the Testimonial cards and the Dormant Selected
// projects section are shown there under a "Sample data" label. None of it is real; the bracketed
// values mark it as sample and are allowed only inside a data-sample block (AC-28).
// Copy from design/handoff/site/project/site/data.js.
import type { Recommendation } from './home';
import type { Project } from './projects';
import type { CvJob, CvLanguageLevel, DatedRow, SkillGroup } from './cv/types';

/** Two Testimonial cards for the Styleguide. Every value is bracketed: no real person, no real quote. */
export const sampleRecommendations: Recommendation[] = [
  {
    name: '[Name]',
    role: '[Role, company]',
    quote:
      '[Recommendation from LinkedIn. Two or three sentences about working with Alexander, kept verbatim.]',
    consent: true,
    source: 'linkedin',
    profile: '[profile address]',
    date: '[date]',
    relationship: '[relationship]',
  },
  {
    name: '[Name]',
    role: '[Role, company]',
    quote: '[Second recommendation. What he built, how he worked with the team, what changed.]',
    consent: true,
    source: 'linkedin',
    profile: '[profile address]',
    date: '[date]',
    relationship: '[relationship]',
  },
];

/** A quote longer than three lines: the Styleguide shows it closed, with "Show more" (home D-19). */
export const sampleLongRecommendation: Recommendation = {
  name: '[Name]',
  role: '[Role, company]',
  quote:
    '[A longer sample recommendation, long enough to run past three lines at every width of the page. It stands for a real quote of several paragraphs: what the person worked on with Alexander, how he worked with the team and what changed because of it. On the home page such a quote is closed to its first three lines and opened in place with the text button below it.]',
  consent: true,
  source: 'linkedin',
  profile: '[profile address]',
  date: '[date]',
  relationship: '[relationship]',
};

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

// Sample CV data for the Styleguide (cv AC-29): shown there under the "Sample data" label, inside a
// data-sample block. None of it is CV text: every value is invented and says so.
export const sampleCvSkillGroups: SkillGroup[] = [
  { label: 'Sample group', items: ['Sample skill', 'Another skill', 'A third skill'] },
  { label: 'Another sample group', items: ['Sample tool', 'Another tool'] },
];

export const sampleCvLanguages: CvLanguageLevel[] = [
  { language: 'Sample language', level: 'Sample level' },
  { language: 'Another language', level: 'Another level' },
  { language: 'A third language', level: 'A third level' },
];

/** A current job with two client projects and internal projects, then an earlier job with paragraphs only. */
export const sampleCvJobs: CvJob[] = [
  {
    role: 'Sample role, current',
    employer: 'Sample employer',
    employerNote: 'sample note',
    period: 'Jan 2022 – Present',
    clientProjects: [
      {
        name: 'Sample client project',
        description: 'A sample description of the project, two lines at most.',
        stack: ['Sample', 'Tags'],
      },
      {
        name: 'Another sample client project',
        description: 'Another sample description.',
        stack: ['More', 'Sample', 'Tags'],
      },
    ],
    internalProjects: [
      { name: 'Sample internal project', description: 'A sample description.' },
      { name: 'Another sample internal project', description: 'Another sample description.' },
    ],
  },
  {
    role: 'Sample role, earlier',
    employer: 'Another sample employer',
    period: 'Jan 2019 – Dec 2021',
    paragraphs: ['A sample paragraph about the job.', 'Another sample paragraph.'],
  },
];

/** A row with a two-line period and a note, then a row with a Norwegian name. */
export const sampleCvRows: DatedRow[] = [
  {
    period: '2020 – 2024\nSample place',
    title: 'Sample title',
    organisation: 'Sample organisation',
    note: 'A sample note.',
  },
  { period: '2019', title: 'Eksempeltittel', organisation: 'Eksempelorganisasjon', lang: 'no' },
];

/** Eight headings for the Contents list. */
export const sampleCvContents: string[] = [
  'Sample section',
  'Second section',
  'Third section',
  'Fourth section',
  'Fifth section',
  'Sixth section',
  'Seventh section',
  'Eighth section',
];
