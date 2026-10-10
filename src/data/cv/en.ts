// English CV data (AC-01, AC-03, AC-26). Text is word for word from the design's data.js (cv.en)
// with the Owner's decisions of owner-inputs.md table 1.1 (EN-01..EN-13, C-24, C-25) applied.
// Contact facts are not copied here: the page reads src/data/contact.ts.
import type { Cv } from './types.ts';

export const cvEn: Cv = {
  lang: 'en',
  title: 'CV · Alexander Ponomarenko',
  description:
    'CV of Alexander Ponomarenko, frontend developer with backend experience: skills, work experience and education. Read it here or download the PDF.',
  location: '1482 Nittedal, Norway',
  permit: 'Norwegian work permit',
  labels: {
    pageName: 'CV',
    contents: 'On this page',
    downloadCv: 'Download PDF',
    print: 'Print',
    viewOriginalPdf: 'View original PDF',
    hideOriginalPdf: 'Hide original PDF',
    lastUpdated: 'Last updated',
    meta: 'PDF · 2 pages · A4',
    contact: 'Contact',
    appliedTechnologies: 'Applied technologies',
    internalProjects: 'Internal projects',
  },
  sections: [
    {
      id: 'profile',
      heading: 'Profile',
      paragraphs: [
        'Frontend developer with 3+ years in enterprise teams, with backend experience enabling me to contribute across the stack. Core stack: React, Angular and TypeScript. Experienced in complex data interfaces, design systems, web accessibility (WCAG) and third-party SaaS customization. Next.js and backend skills in Python and FastAPI built through personal projects. Currently exploring agentic engineering and AI-assisted development. I clarify what a feature really needs, work closely with designers and other developers, and follow it from design through to implementation.',
      ],
    },
    {
      id: 'skills',
      heading: 'Skills',
      skillGroups: [
        {
          label: 'Frontend',
          items: [
            'React',
            'Next.js',
            'Angular',
            'TypeScript',
            'JavaScript',
            'HTML',
            'CSS/LESS',
            'Redux Toolkit',
            'TanStack Query',
            'Zustand',
            'Yup',
            'RxJS',
            'Storybook',
          ],
        },
        { label: 'Backend', items: ['Python', 'FastAPI', 'PostgreSQL', 'SQLAlchemy'] },
        { label: 'Web & APIs', items: ['REST APIs', 'WebSockets', 'API Integration', 'Axios'] },
        {
          label: 'Architecture & Quality',
          items: [
            'Reusable UI Components',
            'Design Systems',
            'Web Accessibility (WCAG)',
            'Jest',
            'Pytest',
          ],
        },
        {
          label: 'Tools & Practices',
          items: ['Git', 'Docker', 'Vite', 'Webpack', 'Jira', 'Figma', 'Copilot', 'Claude Code'],
        },
        {
          label: 'Soft skills',
          items: ['Agile/Scrum', 'cross-functional teamwork', 'mentoring', 'technical leadership'],
        },
      ],
    },
    {
      id: 'languages',
      heading: 'Languages',
      languages: [
        { language: 'English', level: 'Upper-intermediate' },
        { language: 'Norwegian', level: 'Intermediate' },
        { language: 'Ukrainian', level: 'Native' },
      ],
    },
    {
      id: 'experience',
      heading: 'Work experience',
      jobs: [
        {
          role: 'Software Engineer (Consultant)',
          employer: 'EPAM Systems',
          employerNote: 'Global digital engineering company, 60,000+ employees in 55+ countries',
          period: 'Nov 2022 – Jan 2026',
          clientProjects: [
            {
              name: 'SaaS Customization',
              description:
                'For a global B2B software leader (Fortune Global 500): rebranded and extended third-party RainFocus portals for registration (in-person and virtual), live broadcasts and in-session chat across an international conference series. Extended platform behaviour through client-side scripting and deep style overrides, fixed vendor defects, enforced brand guidelines. Independently shaped the design and implementation of selected non-customer-facing pages.',
              stack: ['JavaScript', 'LESS', 'RainFocus', 'Webpack'],
            },
            {
              name: 'Enterprise Event Microsite Platform',
              description:
                'Built reusable, accessible React components and design-system tokens inside Adobe Experience Manager for the same conference series (hybrid events in multiple cities; flagship event: 28,000+ attendees in person and online). One of four frontend developers in a cross-functional team of nineteen.',
              stack: ['React', 'Redux', 'Storybook', 'LESS', 'AEM'],
            },
            {
              name: 'Data-Intensive Defense Analytics',
              description:
                'Built search and interactive mapping modules with advanced query-filtering over Elasticsearch APIs, network nodes visualised on maps.',
              stack: ['React', 'TypeScript', 'React Leaflet', 'react-awesome-query-builder'],
            },
            {
              name: 'Internal Assessment Platform',
              description:
                'Developed and maintained EPAM University’s long-running student assessment platform (new features, testing, bug fixing, code improvement); conducted demos and served as Scrum Master for one sprint.',
              stack: ['Angular'],
            },
          ],
          internalProjects: [
            {
              name: 'EPAM IT Marathons (2023 – 2025)',
              description:
                'Progressed from Angular Developer to Angular Team Lead and Technical Expert, building MVPs from scratch; led three frontend developers supporting a public development programme with ~2,000 participants, and gave a technical session on EPAM’s YouTube channel.',
            },
            {
              name: 'University Mentorship',
              description:
                'Designed and taught a React fundamentals course for ~40 third-year CS students at Alfred Nobel University (10 lectures and 10 workshops per group, final exam).',
            },
          ],
        },
        {
          role: 'Agency Group Manager / Insurance Specialist',
          employer: 'Universalna Insurance Company (Fairfax Financial Holdings)',
          employerNote: 'Ukraine',
          period: 'Dec 2010 – Nov 2021',
          paragraphs: [
            'Led an agency group for the full eleven years and grew personal sales 20×.',
            'Trained agents and network partners including a leading fuel retailer and the national postal operator (coaching and group sessions for up to 100 people); expanded the partner network across banks and car dealerships; led tender bids and B2B/B2C client relations.',
            'Moved into software engineering in 2021 through full-time retraining.',
          ],
        },
      ],
    },
    {
      id: 'projects',
      heading: 'Personal projects',
      note: 'Backend practice alongside frontend work',
      projects: [
        {
          title: 'Async Contacts REST API',
          stack: 'FastAPI, PostgreSQL, Docker',
          text: 'Production-ready async backend service: JWT authentication, email verification, rate limiting (SlowAPI), layered Repository/Service architecture on SQLAlchemy 2.x with Alembic migrations and Pydantic v2 validation, containerized via Docker Compose.',
          href: 'https://github.com/Ponomaleks/fastapi-contacts-api',
        },
      ],
    },
    {
      id: 'education',
      heading: 'Education',
      rows: [
        {
          period: '2025 –\nonline',
          title: 'MSc in Computer Science: Software Engineering and AI',
          organisation: 'Woolf University, Malta',
        },
        {
          period: '2004 – 2009\nUkraine',
          title: 'Master’s Degree in Process Automation and Control',
          organisation: 'Ukrainian State University of Chemical Technology',
          note: 'Recognized in Norway as equivalent to a Norwegian short master’s degree (HK-dir)',
        },
      ],
    },
    {
      id: 'courses',
      heading: 'Courses',
      rows: [
        {
          period: 'Feb 2026 –',
          title: 'Norwegian',
          organisation: 'Nittedal voksenopplæring',
          lang: 'no',
        },
        {
          period: '2022 – 2023',
          title: 'Frontend Developer (Angular)',
          organisation: 'EPAM University, Ukraine, online',
        },
        {
          period: '2021 – 2022',
          title: 'Full-Stack Development (React, Node.js), certificate',
          organisation: 'GoIT, Ukraine, online',
        },
      ],
    },
    {
      id: 'community',
      heading: 'Community & volunteering',
      paragraphs: [
        'Elected member of a local municipal council; ran regional youth and community programmes.',
        'Organised English courses for displaced children.',
        'Animal fostering and welfare initiatives.',
      ],
    },
  ],
};
