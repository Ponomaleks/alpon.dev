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
  /** One value, or several that are shown one per line. */
  v: string | string[];
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
  /** Word for word, paragraphs separated by an empty line. Never edited, shortened or corrected. */
  quote: string;
  consent: boolean;
  /** Where it was given: on LinkedIn (the card links to the recommendations there) or to Alexander directly (no link). */
  source: 'linkedin' | 'direct';
  /** Source fields for the Claims list (AC-29). Never rendered. */
  profile: string;
  date: string;
  relationship: string;
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
    // One per line at every width (Owner decision, 2026-10-07; the design joins them in one line).
    v: ['English, upper-intermediate', 'Norwegian, intermediate', 'Ukrainian, native'],
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

// From docs/features/home/owner-inputs.md, word for word (home.test.ts compares them), each with
// the author's consent.
export const recommendations: Recommendation[] = [
  {
    name: 'Hennadii Shpak',
    role: 'Senior Software Engineer at EPAM Systems',
    quote: [
      'I worked with Oleksandr for over two years and had the opportunity to observe his growth from an EPAM internship student to a strong mid-level specialist.',
      'Oleksandr has consistently demonstrated high motivation and a strong sense of ownership, always striving to deliver his work with the highest level of quality and responsibility. As his resource manager, I frequently came across positive feedback from project managers, which clearly reflects the reliability and quality of his contributions.',
      'I would also like to highlight his solid technical expertise. Oleksandr successfully passed two technical assessments in React and JavaScript at the intermediate level, confirming his strong knowledge in these areas.',
      'In addition, Oleksandr stands out for his initiative and well-developed soft skills. He took on the role of a technical lead for a team of students during a special EPAM event focused on showcasing the key stages of IT product development. Leading the Angular team, he effectively managed all stages of frontend development, and as a result, the team successfully delivered their part on time.',
      'To sum up, Oleksandr is a dedicated and capable professional who would be a valuable addition to any team.',
    ].join('\n\n'),
    consent: true,
    source: 'linkedin',
    profile: 'https://www.linkedin.com/in/hennadii-shpak-4435a81a5/',
    date: 'April 26, 2026',
    relationship: 'Hennadii managed Alexander directly',
  },
  {
    name: 'Alina Shcherbak',
    role: 'Frontend Developer at EPAM Systems',
    quote: [
      'I had the pleasure of working with Alexander for nearly two years as his Team Lead, and I can confidently say he is a highly reliable and proactive Front-end Developer.',
      'He consistently demonstrated strong ownership, transparency in his work, and a genuine drive to grow. Alexander is not the kind of person who waits for tasks \u2014 he actively looks for ways to contribute, improve processes, and take on challenging work without hesitation.',
      'During high-pressure periods with tight deadlines, he showed exceptional dedication, stepping up to ensure the team delivered on time \u2014 even if it meant going the extra mile.',
      'From my perspective as a lead, Alexander was someone I could fully rely on. When I was away, he took ownership of team responsibilities and ensured everything stayed on track. His supportive attitude, clear communication, and willingness to help others made him a strong pillar within the team.',
      'On top of his technical skills, he is a great person to work with \u2014 easygoing, respectful, and collaborative.',
      'I highly recommend Alexander to any team looking for a dependable and motivated engineer who brings both results and a positive team dynamic.',
    ].join('\n\n'),
    consent: true,
    source: 'linkedin',
    profile: 'https://www.linkedin.com/in/alinka-scherbak-289516124/en/',
    date: 'April 13, 2026',
    relationship: 'Alina managed Alexander directly',
  },
];

/** The Recommendations carousel turns by itself (AC-43). Off: it moves only when the Visitor moves it. */
export const recommendationsAutoplay: boolean = false;

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
