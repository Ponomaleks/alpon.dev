// Home page content (copy from design/handoff/site/project/site/data.js and Home.jsx).
// Contact facts live in contact.ts, not here.

export interface KeyFact {
  value: number;
  prefix?: string;
  suffix?: string;
  unit?: string;
  label: string;
  context: string;
}

export interface QuickFact {
  k: string;
  v: string;
}

export interface ExperienceEntry {
  role: string;
  org: string;
  period: string;
  location: string;
  summary: string;
  points: string[];
  stack: string[];
  open?: boolean;
  current?: boolean;
}

export interface Recommendation {
  name: string;
  role: string;
  quote: string;
  consent: boolean;
}

export const keyFacts: KeyFact[] = [
  {
    value: 3,
    suffix: '+',
    unit: 'yrs',
    label: 'Software Engineer in enterprise teams',
    context: 'EPAM Systems \u00b7 2022 \u2013 2026',
  },
  {
    value: 40,
    prefix: '~',
    label: 'Students taught React fundamentals',
    context: 'Alfred Nobel University \u00b7 2 groups',
  },
  {
    value: 2000,
    prefix: '~',
    label: 'Participants in the IT Marathon where I led an Angular team',
    context: 'EPAM IT Marathons \u00b7 2023 \u2013 2025',
  },
  {
    value: 100,
    suffix: '+',
    label: 'Repositories on GitHub',
    context: 'github.com/ponomaleks',
  },
];

export const intro =
  'I\u2019m a frontend-focused full stack engineer. I build web applications with React, Angular and TypeScript, and backend services with Python and FastAPI. For the last years I worked at EPAM Systems on a large enterprise event platform, led a small Angular team and mentored around 40 students. Now I\u2019m based in the Oslo area and looking for a team to build good products with.';

export const quickFacts: QuickFact[] = [
  { k: 'Based in', v: 'Nittedal, Oslo area \u00b7 Norwegian work permit' },
  { k: 'Focus', v: 'Frontend, with backend experience' },
  {
    k: 'Stack',
    v: 'React \u00b7 Angular \u00b7 TypeScript \u00b7 Next.js \u00b7 Python \u00b7 FastAPI',
  },
  {
    k: 'Languages',
    v: 'English, upper-intermediate \u00b7 Norwegian, intermediate \u00b7 Ukrainian, native',
  },
];

export const experience: ExperienceEntry[] = [
  {
    role: 'Software Engineer (Consultant)',
    org: 'EPAM Systems',
    period: 'Nov 2022 \u2013 Jan 2026',
    location: 'Global digital engineering company',
    summary:
      'Four client and internal projects in enterprise teams, from SaaS customization to data-heavy interfaces.',
    points: [
      'Reusable, accessible React components and design-system tokens in Adobe Experience Manager for a conference series with 28,000+ attendees at the flagship event.',
      'Rebranded and extended third-party RainFocus portals for registration, live broadcasts and in-session chat.',
      'Search and interactive map modules over Elasticsearch APIs for a defense analytics product.',
      'Features, testing and one sprint as Scrum Master on EPAM University\u2019s assessment platform (Angular).',
    ],
    stack: ['React', 'TypeScript', 'Angular', 'Redux', 'Storybook', 'LESS', 'AEM'],
    open: true,
    current: true,
  },
  {
    role: 'Angular Team Lead and Technical Expert',
    org: 'EPAM IT Marathons',
    period: '2023 \u2013 2025',
    location: 'Internal projects',
    summary: 'Progressed from Angular Developer to Team Lead, building MVPs from scratch.',
    points: [
      'Led three frontend developers supporting a public development programme with ~2,000 participants.',
      'Gave a technical session on EPAM\u2019s YouTube channel.',
    ],
    stack: ['Angular', 'TypeScript'],
  },
  {
    role: 'React course author and mentor',
    org: 'Alfred Nobel University',
    period: 'EPAM mentorship',
    location: 'Third-year CS students',
    summary:
      'Designed and taught a React fundamentals course for ~40 students: 10 lectures and 10 workshops per group, final exam.',
    points: [],
    stack: ['React'],
  },
  {
    role: 'Agency Group Manager / Insurance Specialist',
    org: 'Universalna Insurance Company (Fairfax Financial Holdings)',
    period: 'Dec 2010 \u2013 Nov 2021',
    location: 'Ukraine',
    summary:
      'Led an agency group for eleven years and grew personal sales 20\u00d7. Trained agents and partners in sessions for up to 100 people.',
    points: ['Moved into software engineering in 2021 through full-time retraining.'],
    stack: [],
  },
];

// Entered in T27, only with the author's consent.
export const recommendations: Recommendation[] = [];

export const nowProject: string | undefined = 'alpon.dev';

const MSC = 'MSc Computer Science at Woolf University';

export function visibleRecommendations(list: Recommendation[] = recommendations): Recommendation[] {
  return list.filter((r) => r.consent);
}

// No argument uses the repo data; an explicit undefined or empty string means no project.
export function nowLine(...args: [project?: string | undefined]): string {
  const project = args.length ? args[0] : nowProject;
  return project ? `${project} \u00b7 ${MSC}` : MSC;
}
