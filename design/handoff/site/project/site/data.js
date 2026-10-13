// alpon.dev content. REAL: name, role, contacts, location, experience and CV (from the EN / NO PDF CVs, 2026).
// PLACEHOLDER: projects + project metrics ([…] values), testimonials, "Nå" project.
window.AP = {
  person: {
    name: 'Alexander Ponomarenko', role: 'Software Engineer', role2: 'Full Stack Developer',
    email: 'ponomaleks@gmail.com', phone: '+47 405 94 584',
    linkedin: 'linkedin.com/in/ponomalex', github: 'github.com/ponomaleks',
    location: 'Nittedal, Norge', coords: '59.91° N, 10.75° E', updated: '2026-09-30',
    now: '[current project]'
  },
  facts: [
    { value: 3, suffix: '+', unit: 'yrs', label: 'Software Engineer in enterprise teams', context: 'EPAM Systems · 2022 – 2026' },
    { value: 40, prefix: '~', label: 'Students taught React fundamentals', context: 'Alfred Nobel University · 2 groups' },
    { value: 2000, prefix: '~', label: 'Participants in the IT Marathon where I led an Angular team', context: 'EPAM IT Marathons · 2023 – 2025' },
    { value: 100, suffix: '+', label: 'Repositories on GitHub', context: 'github.com/ponomaleks' }
  ],
  intro: 'I’m a frontend-focused full stack engineer. I build web applications with React, Angular and TypeScript, and backend services with Python and FastAPI. For the last years I worked at EPAM Systems on a large enterprise event platform, led a small Angular team and mentored around 40 students. Now I’m based in the Oslo area and looking for a team to build good products with.',
  quick: [
    { k: 'Based in', v: 'Nittedal, Oslo area · Norwegian work permit' },
    { k: 'Focus', v: 'Frontend, with backend experience' },
    { k: 'Stack', v: 'React · Angular · TypeScript · Next.js · Python · FastAPI' },
    { k: 'Languages', v: 'English, upper-intermediate · Norwegian, intermediate · Ukrainian, native' }
  ],
  timeline: [
    { role: 'Software Engineer (Consultant)', org: 'EPAM Systems', period: 'Nov 2022 – Jan 2026', location: 'Global digital engineering company', current: true,
      summary: 'Four client and internal projects in enterprise teams, from SaaS customization to data-heavy interfaces.',
      points: ['Reusable, accessible React components and design-system tokens in Adobe Experience Manager for a conference series with 28,000+ attendees at the flagship event.', 'Rebranded and extended third-party RainFocus portals for registration, live broadcasts and in-session chat.', 'Search and interactive map modules over Elasticsearch APIs for a defense analytics product.', 'Features, testing and one sprint as Scrum Master on EPAM University’s assessment platform (Angular).'],
      stack: ['React', 'TypeScript', 'Angular', 'Redux', 'Storybook', 'LESS', 'AEM'] },
    { role: 'Angular Team Lead and Technical Expert', org: 'EPAM IT Marathons', period: '2023 – 2025', location: 'Internal projects',
      summary: 'Progressed from Angular Developer to Team Lead, building MVPs from scratch.',
      points: ['Led three frontend developers supporting a public development programme with ~2,000 participants.', 'Gave a technical session on EPAM’s YouTube channel.'], stack: ['Angular', 'TypeScript'] },
    { role: 'React course author and mentor', org: 'Alfred Nobel University', period: 'EPAM mentorship', location: 'Third-year CS students',
      summary: 'Designed and taught a React fundamentals course for ~40 students: 10 lectures and 10 workshops per group, final exam.', points: [], stack: ['React'] },
    { role: 'Agency Group Manager / Insurance Specialist', org: 'Universalna Insurance Company (Fairfax Financial Holdings)', period: 'Dec 2010 – Nov 2021', location: 'Ukraine',
      summary: 'Led an agency group for eleven years and grew personal sales 20×. Trained agents and partners in sessions for up to 100 people.', points: ['Moved into software engineering in 2021 through full-time retraining.'], stack: [] }
  ],
  testimonials: [
    { quote: '[Recommendation from LinkedIn. Two or three sentences about working with Alexander, kept verbatim.]', name: '[Name]', role: '[Role, company]' },
    { quote: '[Second recommendation. What he built, how he worked with the team, what changed.]', name: '[Name]', role: '[Role, company]' }
  ],
  // type: web | api | tool. media: live | docs | none
  projects: [
    { slug: 'project-one', title: 'Project One', type: 'web', status: 'live', year: 2026, featured: true,
      summary: 'Booking app for small teams: shared calendars, reminders and a public booking page.',
      result: { value: '[1.2 s]', label: 'median load on 4G' }, stack: ['TypeScript', 'React', 'FastAPI', 'PostgreSQL'], role: 'Solo, full stack', sub: 'one.alpon.dev' },
    { slug: 'project-two', title: 'Project Two', type: 'api', status: 'live', year: 2026, featured: true,
      summary: 'Typed REST API for public transit departures, with caching and OpenAPI docs.',
      result: { value: '[42 ms]', label: 'p95 cached response' }, stack: ['Python', 'FastAPI', 'Redis'], role: 'Solo, backend', sub: 'api.alpon.dev', liveLabel: 'Live docs' },
    { slug: 'project-three', title: 'Project Three', type: 'tool', status: 'progress', year: 2026, featured: true,
      summary: 'Small CLI and library that checks a site against a performance budget in CI.',
      result: { value: '[0]', label: 'runtime dependencies' }, stack: ['TypeScript', 'Node.js'], role: 'Solo', sub: null },
    { slug: 'project-four', title: 'Project Four', type: 'web', status: 'live', year: 2025, summary: 'Dashboard for a volunteer group: shifts, sign-ups and reminders by email.', result: { value: '[60]', label: 'weekly users' }, stack: ['Angular', 'Firebase'], role: 'Solo' },
    { slug: 'project-five', title: 'Project Five', type: 'api', status: 'live', year: 2025, summary: 'Webhook relay that retries, logs and replays failed deliveries.', result: { value: '[99.9%]', label: 'delivery rate' }, stack: ['Python', 'FastAPI', 'SQLite'], role: 'Solo' },
    { slug: 'project-six', title: 'Project Six', type: 'tool', status: 'live', year: 2025, summary: 'Angular schematics that scaffold accessible form components.', result: { value: '[3]', label: 'teams using it' }, stack: ['Angular', 'TypeScript'], role: 'Solo' },
    { slug: 'project-seven', title: 'Project Seven', type: 'web', status: 'live', year: 2024, summary: 'Study planner used in my mentoring groups: tasks, reviews, progress.', result: { value: '[40]', label: 'students' }, stack: ['React', 'Vite'], role: 'Solo' },
    { slug: 'project-eight', title: 'Project Eight', type: 'tool', status: 'archived', year: 2024, summary: 'Browser extension that copies a page’s metadata as Markdown.', result: { value: '[4 kB]', label: 'bundle size' }, stack: ['TypeScript'], role: 'Solo' }
  ],
  cv: {
    en: {
      title: 'Frontend Developer · Backend Experience', location: '1482 Nittedal, Norway', permit: 'Norwegian work permit',
      h: { profile: 'Profile', skills: 'Skills', langs: 'Languages', work: 'Work experience', personal: 'Personal projects', edu: 'Education', courses: 'Courses', community: 'Community & volunteering' },
      ui: { dl: 'Download PDF', print: 'Print', updated: 'Last updated', meta: 'PDF · 2 pages · A4', toc: 'On this page', preview: 'View original PDF', contact: 'Contact', tech: 'Applied technologies', internal: 'Internal projects', personalNote: 'Backend practice alongside frontend work' },
      profile: 'Frontend developer with 3+ years in enterprise teams, with backend experience enabling me to contribute across the stack. Core stack: React, Angular and TypeScript. Experienced in complex data interfaces, design systems, web accessibility (WCAG) and third-party SaaS customization. Next.js and backend skills in Python and FastAPI built through personal projects. Currently exploring agentic engineering and AI-assisted development. I clarify what a feature really needs, work closely with designers and other developers, and follow it from design through to implementation.',
      skills: [
        { title: 'Frontend', items: ['React', 'Next.js', 'Angular', 'TypeScript', 'JavaScript', 'HTML', 'CSS/LESS', 'Redux Toolkit', 'TanStack Query', 'Zustand', 'Yup', 'RxJS', 'Storybook'] },
        { title: 'Backend', items: ['Python', 'FastAPI', 'PostgreSQL', 'SQLAlchemy'] },
        { title: 'Web & APIs', items: ['REST APIs', 'WebSockets', 'API Integration', 'Axios'] },
        { title: 'Architecture & Quality', items: ['Reusable UI Components', 'Design Systems', 'Web Accessibility (WCAG)', 'Jest', 'Pytest'] },
        { title: 'Tools & Practices', items: ['Git', 'Docker', 'Vite', 'Webpack', 'Jira', 'Figma', 'Copilot', 'Claude Code'] },
        { title: 'Soft skills', items: ['Agile/Scrum', 'cross-functional teamwork', 'mentoring', 'technical leadership'] }
      ],
      langs: [{ name: 'English', level: 'Upper-intermediate' }, { name: 'Norwegian', level: 'Intermediate' }, { name: 'Ukrainian', level: 'Native' }],
      jobs: [
        { role: 'Software Engineer (Consultant)', org: 'EPAM Systems', orgNote: 'Global digital engineering company, 60,000+ employees in 55+ countries', period: 'Nov 2022 – Jan 2026', current: true,
          projects: [
            { t: 'SaaS Customization', d: 'For a global B2B software leader (Fortune Global 500): rebranded and extended third-party RainFocus portals for registration (in-person and virtual), live broadcasts and in-session chat across an international conference series. Extended platform behaviour through client-side scripting and deep style overrides, fixed vendor defects, enforced brand guidelines. Independently shaped the design and implementation of selected non-customer-facing pages.', tech: ['JavaScript', 'LESS', 'RainFocus', 'Webpack'] },
            { t: 'Enterprise Event Microsite Platform', d: 'Built reusable, accessible React components and design-system tokens inside Adobe Experience Manager for the same conference series (hybrid events in multiple cities; flagship event: 28,000+ attendees in person and online). One of four frontend developers in a cross-functional team of nineteen.', tech: ['React', 'Redux', 'Storybook', 'LESS', 'AEM'] },
            { t: 'Data-Intensive Defense Analytics', d: 'Built search and interactive mapping modules with advanced query-filtering over Elasticsearch APIs, network nodes visualised on maps.', tech: ['React', 'TypeScript', 'React Leaflet', 'react-awesome-query-builder'] },
            { t: 'Internal Assessment Platform', d: 'Developed and maintained EPAM University’s long-running student assessment platform (new features, testing, bug fixing, code improvement); conducted demos and served as Scrum Master for one sprint.', tech: ['Angular'] }
          ],
          internal: [
            { t: 'EPAM IT Marathons (2023 – 2025)', d: 'Progressed from Angular Developer to Angular Team Lead and Technical Expert, building MVPs from scratch; led three frontend developers supporting a public development programme with ~2,000 participants, and gave a technical session on EPAM’s YouTube channel.' },
            { t: 'University Mentorship', d: 'Designed and taught a React fundamentals course for ~40 third-year CS students at Alfred Nobel University (10 lectures and 10 workshops per group, final exam).' }
          ] },
        { role: 'Agency Group Manager / Insurance Specialist', org: 'Universalna Insurance Company (Fairfax Financial Holdings)', orgNote: 'Ukraine', period: 'Dec 2010 – Nov 2021',
          text: ['Led an agency group for the full eleven years and grew personal sales 20×.', 'Trained agents and network partners including a leading fuel retailer and the national postal operator (coaching and group sessions for up to 100 people); expanded the partner network across banks and car dealerships; led tender bids and B2B/B2C client relations.', 'Moved into software engineering in 2021 through full-time retraining.'] }
      ],
      personal: [
        { t: 'Async Contacts REST API', stack: 'FastAPI, PostgreSQL, Docker', d: 'Production-ready async backend service: JWT authentication, email verification, rate limiting (SlowAPI), layered Repository/Service architecture on SQLAlchemy 2.x with Alembic migrations and Pydantic v2 validation, containerized via Docker Compose.', url: 'github.com/Ponomaleks/fastapi-contacts-api' }
      ],
      edu: [
        { t: 'MSc in Computer Science: Software Engineering and AI', o: 'Woolf University, Malta', p: '2025 –', w: 'online' },
        { t: 'Master’s Degree in Process Automation and Control', o: 'Ukrainian State University of Chemical Technology', p: '2004 – 2009', w: 'Ukraine', note: 'Recognized in Norway as equivalent to a Norwegian short master’s degree (HK-dir)' }
      ],
      courses: [
        { p: 'Feb 2026 –', t: 'Norwegian', o: 'Nittedal voksenopplæring', lang: 'no' },
        { p: '2022 – 2023', t: 'Frontend Developer (Angular)', o: 'EPAM University, Ukraine, online' },
        { p: '2021 – 2022', t: 'Full-Stack Development (React, Node.js), certificate', o: 'GoIT, Ukraine, online' }
      ],
      community: ['Elected member of a local municipal council; ran regional youth and community programmes.', 'Organised English courses for displaced children.', 'Animal fostering and welfare initiatives.']
    },
    no: {
      title: 'Frontend-utvikler · backend-erfaring', location: '1482 Nittedal, Norge', permit: 'Arbeidstillatelse i Norge',
      h: { profile: 'Profil', skills: 'Kompetanse', langs: 'Språk', work: 'Arbeidserfaring', personal: 'Personlige prosjekter', edu: 'Utdanning', courses: 'Kurs', community: 'Frivillig arbeid' },
      ui: { dl: 'Last ned PDF', print: 'Skriv ut', updated: 'Sist oppdatert', meta: 'PDF · 2 sider · A4', toc: 'På denne siden', preview: 'Se original-PDF', contact: 'Kontakt', tech: 'Teknologier', internal: 'Interne prosjekter', personalNote: null },
      profile: 'Frontend-utvikler med 3+ års erfaring fra enterprise-team, med backend-erfaring som gjør at jeg kan bidra i hele stacken. Kjernestack: React, Angular og TypeScript. Erfaring med komplekse datagrensesnitt, designsystemer, universell utforming (WCAG) og tilpasning av tredjeparts SaaS-løsninger. Next.js og backend-kompetanse i Python og FastAPI bygget gjennom egne prosjekter. Utforsker for tiden agentic engineering og AI-assistert utvikling. Jeg avklarer hva en funksjon faktisk trenger, samarbeider tett med designere og andre utviklere, og følger den fra design til ferdig implementasjon.',
      skills: [
        { title: 'Frontend', items: ['React', 'Next.js', 'Angular', 'TypeScript', 'JavaScript', 'HTML', 'CSS/LESS', 'Redux Toolkit', 'TanStack Query', 'Zustand', 'Yup', 'RxJS', 'Storybook'] },
        { title: 'Backend', items: ['Python', 'FastAPI', 'PostgreSQL', 'SQLAlchemy'] },
        { title: 'Web og API-er', items: ['REST API-er', 'WebSockets', 'API-integrasjon', 'Axios'] },
        { title: 'Arkitektur og kvalitet', items: ['Gjenbrukbare UI-komponenter', 'designsystemer', 'universell utforming (WCAG)', 'Jest', 'Pytest'] },
        { title: 'Verktøy og metoder', items: ['Git', 'Docker', 'Vite', 'Webpack', 'Jira', 'Figma', 'Copilot', 'Claude Code'] },
        { title: 'Samarbeid og ledelse', items: ['Agile/Scrum', 'tverrfaglig teamarbeid', 'mentoring', 'teknisk ledelse'] }
      ],
      langs: [{ name: 'Engelsk', level: 'Øvre mellomnivå' }, { name: 'Norsk', level: 'Mellomnivå' }, { name: 'Ukrainsk', level: 'Morsmål' }],
      jobs: [
        { role: 'Software Engineer (konsulent)', org: 'EPAM Systems', orgNote: 'Globalt selskap innen programvareutvikling, 60 000+ ansatte i 55+ land', period: 'nov 2022 – jan 2026', current: true,
          projects: [
            { t: 'SaaS-tilpasning', d: 'For en global B2B-programvareleverandør (Fortune Global 500): profilerte om og utvidet tredjeparts RainFocus-portaler for påmelding (fysisk og digitalt), direktesendinger og chat i sesjonene i en internasjonal konferanseserie. Utvidet plattformens funksjonalitet med klientsideskripting og dype stiloverstyringer, rettet leverandørfeil og sikret at merkevareretningslinjene ble fulgt. Utformet og implementerte selvstendig utvalgte sider som ikke var kundevendte.', tech: ['JavaScript', 'LESS', 'RainFocus', 'Webpack'] },
            { t: 'Plattform for event-mikrosider (enterprise)', d: 'Utviklet gjenbrukbare, universelt utformede React-komponenter og design tokens i Adobe Experience Manager for samme konferanseserie (hybride arrangementer i flere byer; hovedarrangementet: 28 000+ deltakere fysisk og digitalt). Én av fire frontend-utviklere i et tverrfaglig team på nitten.', tech: ['React', 'Redux', 'Storybook', 'LESS', 'AEM'] },
            { t: 'Dataintensiv forsvarsanalyse', d: 'Utviklet søkemoduler og interaktive kartmoduler med avansert spørringsfiltrering mot Elasticsearch-API-er, med nettverksnoder visualisert på kart.', tech: ['React', 'TypeScript', 'React Leaflet', 'react-awesome-query-builder'] },
            { t: 'Intern vurderingsplattform', d: 'Videreutviklet og vedlikeholdt EPAM Universitys mangeårige plattform for studentvurdering (ny funksjonalitet, testing, feilretting, kodeforbedringer); holdt demoer og var Scrum Master i én sprint.', tech: ['Angular'] }
          ],
          internal: [
            { t: 'EPAM IT Marathons (2023 – 2025)', d: 'Gikk fra Angular-utvikler til Angular Team Lead og teknisk ekspert og bygde MVP-er fra bunnen av; ledet tre frontend-utviklere i et åpent program med ca. 2 000 deltakere og holdt en teknisk presentasjon på EPAMs YouTube-kanal.' },
            { t: 'Universitetsmentoring', d: 'Utformet og underviste et kurs i grunnleggende React for ca. 40 tredjeårsstudenter i informatikk ved Alfred Nobel University (10 forelesninger og 10 praktiske økter per gruppe, avsluttende eksamen).' }
          ] },
        { role: 'Agenturgruppeleder / forsikringsspesialist', org: 'Universalna Insurance Company (Fairfax Financial Holdings)', orgNote: 'Ukraina', period: 'des 2010 – nov 2021',
          text: ['Lærte opp agenter og nettverkspartnere, blant annet en ledende drivstoffkjede og det nasjonale postvesenet (veiledning og gruppesesjoner for opptil 100 personer); utvidet partnernettverket blant banker og bilforhandlere; ledet anbudsprosesser og B2B/B2C-kunderelasjoner.', 'Gikk over til programvareutvikling i 2021 gjennom omskolering på heltid.'] }
      ],
      personal: [
        { t: 'Bilutleieplattform', stack: 'Next.js, React, TypeScript, TanStack Query', d: 'Webapplikasjon for bilutleie med server-side rendering, bygget med Next.js 16 (App Router) og React 19 mot et eksternt REST-API: TanStack Query for servertilstand, Zustand for skjematilstand, Yup-validering, Axios og CSS Modules.', url: 'github.com/Ponomaleks/car-rental-next-js' },
        { t: 'Async Contacts REST API', stack: 'FastAPI, PostgreSQL, Docker', d: 'Produksjonsklar asynkron backend-tjeneste: JWT-autentisering, e-postverifisering, rate limiting (SlowAPI), lagdelt Repository/Service-arkitektur på SQLAlchemy 2.x med Alembic-migreringer og Pydantic v2-validering, containerisert med Docker Compose.', url: 'github.com/Ponomaleks/fastapi-contacts-api' }
      ],
      edu: [
        { t: 'Master i informatikk: programvareteknikk og kunstig intelligens', o: 'Woolf University, Malta', p: '2025 –', w: 'nettbasert' },
        { t: 'Master i prosessautomatisering og kontrollsystemer', o: 'Ukrainas statlige kjemisk-teknologiske universitet', p: '2004 – 2009', w: 'Ukraina', note: 'Godkjent i Norge som likestilt med en norsk kortere mastergrad (HK-dir)' }
      ],
      courses: [
        { p: 'feb 2026 –', t: 'Norsk', o: 'Nittedal voksenopplæring' },
        { p: '2022 – 2023', t: 'Frontend Developer (Angular)', o: 'EPAM University, Ukraina, nettbasert' },
        { p: '2021 – 2022', t: 'Full-Stack Development (React, Node.js), sertifikat', o: 'GoIT, Ukraina, nettbasert' }
      ],
      community: null
    }
  },
  posts: [
    { slug: 'performance-budget', date: '2026-09-12', title: 'Write the performance budget first', summary: '[Placeholder] Why a two-line JSON file shortened every later decision.', mins: 6 },
    { slug: 'angular-to-react', date: '2026-08-02', title: 'Moving between Angular and React without losing your mind', summary: '[Placeholder] Notes from switching frameworks inside one product.', mins: 9 },
    { slug: 'mentoring-40', date: '2026-06-20', title: 'What 40 students taught me about code review', summary: '[Placeholder] Short, kind, specific. Three rules I still use.', mins: 5 }
  ]
};
