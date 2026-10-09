// Norwegian CV data (AC-02, AC-03, AC-26). Text is from the design's data.js (cv.no) with the Owner's
// decisions of owner-inputs.md table 1.2 (NO-01..NO-13, C-26..C-33) applied, so the page has the
// eight sections of the current Norwegian CV PDF.
// Contact facts are not copied here: the page reads src/data/contact.ts.
import type { Cv, CvLabels } from './types.ts';

/** Labels the Norwegian page needs beyond `CvLabels` (C-28 to C-32); the page reads them by name. */
export interface CvNoExtraLabels {
  contactCta: string;
  copy: string;
  copied: string;
  langGroup: string;
  breadcrumbName: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  residence: string;
  copyRefused: string;
  pageImage1: string;
  pageImage2: string;
  newTabHint: string;
}

export const cvNoLabels: CvLabels & CvNoExtraLabels = {
  pageName: 'CV',
  contents: 'På denne siden',
  downloadCv: 'Last ned PDF',
  print: 'Skriv ut',
  viewOriginalPdf: 'Se original-PDF',
  hideOriginalPdf: 'Skjul original-PDF',
  lastUpdated: 'Sist oppdatert',
  meta: 'PDF · 2 sider · A4',
  contact: 'Kontakt',
  appliedTechnologies: 'Teknologier',
  internalProjects: 'Interne prosjekter',
  contactCta: 'Ta kontakt',
  copy: 'Kopier',
  copied: 'Kopiert',
  langGroup: 'CV-språk',
  breadcrumbName: 'Brødsmulesti',
  email: 'E-post',
  phone: 'Telefon',
  linkedin: 'LinkedIn',
  github: 'GitHub',
  residence: 'Bosted',
  copyRefused: 'Kunne ikke kopiere. Marker adressen for å kopiere den.',
  pageImage1: 'CV, side 1 av 2, norsk, PDF, åpnes i ny fane',
  pageImage2: 'CV, side 2 av 2, norsk, PDF, åpnes i ny fane',
  newTabHint: 'åpnes i ny fane',
};

export const cvNo: Cv = {
  lang: 'no',
  title: 'CV (norsk) · Alexander Ponomarenko',
  description:
    'CV for Alexander Ponomarenko, frontend-utvikler med backend-erfaring: kompetanse, arbeidserfaring og utdanning. Les den her eller last ned PDF-en.',
  location: '1482 Nittedal, Norge',
  permit: 'Arbeidstillatelse i Norge',
  labels: cvNoLabels,
  sections: [
    {
      id: 'profile',
      heading: 'Profil',
      paragraphs: [
        'Frontend-utvikler med 3+ års erfaring fra enterprise-team, med backend-erfaring som gjør at jeg kan bidra i hele stacken. Kjernestack: React, Angular og TypeScript. Erfaring med komplekse datagrensesnitt, designsystemer, universell utforming (WCAG) og tilpasning av tredjeparts SaaS-løsninger. Next.js og backend-kompetanse i Python og FastAPI bygget gjennom egne prosjekter. Utforsker for tiden agentic engineering og AI-assistert utvikling. Jeg avklarer hva en funksjon faktisk trenger, samarbeider tett med designere og andre utviklere, og følger den fra design til ferdig implementasjon.',
      ],
    },
    {
      id: 'skills',
      heading: 'Kompetanse',
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
        {
          label: 'Web og API-er',
          items: ['REST API-er', 'WebSockets', 'API-integrasjon', 'Axios'],
        },
        {
          label: 'Arkitektur og kvalitet',
          items: [
            'Gjenbrukbare UI-komponenter',
            'designsystemer',
            'universell utforming (WCAG)',
            'Jest',
            'Pytest',
          ],
        },
        {
          label: 'Verktøy og metoder',
          items: ['Git', 'Docker', 'Vite', 'Webpack', 'Jira', 'Figma', 'Copilot', 'Claude Code'],
        },
        {
          label: 'Samarbeid og ledelse',
          items: ['Agile/Scrum', 'tverrfaglig teamarbeid', 'mentoring', 'teknisk ledelse'],
        },
      ],
    },
    {
      id: 'languages',
      heading: 'Språk',
      languages: [
        { language: 'Engelsk', level: 'Øvre mellomnivå' },
        { language: 'Norsk', level: 'Mellomnivå' },
        { language: 'Ukrainsk', level: 'Morsmål' },
      ],
    },
    {
      id: 'experience',
      heading: 'Arbeidserfaring',
      jobs: [
        {
          role: 'Software Engineer (konsulent)',
          employer: 'EPAM Systems',
          employerNote: 'Globalt selskap innen programvareutvikling, 60 000+ ansatte i 55+ land',
          period: 'nov 2022 – jan 2026',
          clientProjects: [
            {
              name: 'SaaS-tilpasning',
              description:
                'For en global B2B-programvareleverandør (Fortune Global 500): profilerte om og utvidet tredjeparts RainFocus-portaler for påmelding (fysisk og digitalt), direktesendinger og chat i sesjonene i en internasjonal konferanseserie. Utvidet plattformens funksjonalitet med klientsideskripting og dype stiloverstyringer, rettet leverandørfeil og sikret at merkevareretningslinjene ble fulgt. Utformet og implementerte selvstendig utvalgte sider som ikke var kundevendte.',
              stack: ['JavaScript', 'LESS', 'RainFocus', 'Webpack'],
            },
            {
              name: 'Plattform for event-mikrosider (enterprise)',
              description:
                'Utviklet gjenbrukbare, universelt utformede React-komponenter og design tokens i Adobe Experience Manager for samme konferanseserie (hybride arrangementer i flere byer; hovedarrangementet: 28 000+ deltakere fysisk og digitalt). Én av fire frontend-utviklere i et tverrfaglig team på nitten.',
              stack: ['React', 'Redux', 'Storybook', 'LESS', 'AEM'],
            },
            {
              name: 'Dataintensiv forsvarsanalyse',
              description:
                'Utviklet søkemoduler og interaktive kartmoduler med avansert spørringsfiltrering mot Elasticsearch-API-er, med nettverksnoder visualisert på kart.',
              stack: ['React', 'TypeScript', 'React Leaflet', 'react-awesome-query-builder'],
            },
            {
              name: 'Intern vurderingsplattform',
              description:
                'Videreutviklet og vedlikeholdt EPAM Universitys mangeårige plattform for studentvurdering (ny funksjonalitet, testing, feilretting, kodeforbedringer); holdt demoer og var Scrum Master i én sprint.',
              stack: ['Angular'],
            },
          ],
          internalProjects: [
            {
              name: 'EPAM IT Marathons (2023 – 2025)',
              description:
                'Gikk fra Angular-utvikler til Angular Team Lead og teknisk ekspert og bygde MVP-er fra bunnen av; ledet tre frontend-utviklere i et åpent program med ca. 2 000 deltakere og holdt en teknisk presentasjon på EPAMs YouTube-kanal.',
            },
            {
              name: 'Universitetsmentoring',
              description:
                'Utformet og underviste et kurs i grunnleggende React for ca. 40 tredjeårsstudenter i informatikk ved Alfred Nobel University (10 forelesninger og 10 praktiske økter per gruppe, avsluttende eksamen).',
            },
          ],
        },
        {
          role: 'Agenturgruppeleder / forsikringsspesialist',
          employer: 'Universalna Insurance Company (Fairfax Financial Holdings)',
          employerNote: 'Ukraina',
          period: 'des 2010 – nov 2021',
          paragraphs: [
            'Ledet en agenturgruppe gjennom alle de elleve årene og økte eget salg 20 ganger.',
            'Lærte opp agenter og nettverkspartnere, blant annet en ledende drivstoffkjede og det nasjonale postvesenet (veiledning og gruppesesjoner for opptil 100 personer); utvidet partnernettverket blant banker og bilforhandlere; ledet anbudsprosesser og B2B/B2C-kunderelasjoner.',
            'Gikk over til programvareutvikling i 2021 gjennom omskolering på heltid.',
          ],
        },
      ],
    },
    {
      id: 'projects',
      heading: 'Personlige prosjekter',
      note: 'Backend-praksis ved siden av frontendarbeid',
      projects: [
        {
          title: 'Async Contacts REST API',
          stack: 'FastAPI, PostgreSQL, Docker',
          text: 'Produksjonsklar asynkron backend-tjeneste: JWT-autentisering, e-postverifisering, rate limiting (SlowAPI), lagdelt Repository/Service-arkitektur på SQLAlchemy 2.x med Alembic-migreringer og Pydantic v2-validering, containerisert med Docker Compose.',
          href: 'https://github.com/Ponomaleks/fastapi-contacts-api',
        },
      ],
    },
    {
      id: 'education',
      heading: 'Utdanning',
      rows: [
        {
          period: '2025 –\nnettbasert',
          title: 'Master i informatikk: programvareteknikk og kunstig intelligens',
          organisation: 'Woolf University, Malta',
        },
        {
          period: '2004 – 2009\nUkraina',
          title: 'Master i prosessautomatisering og kontrollsystemer',
          organisation: 'Ukrainas statlige kjemisk-teknologiske universitet',
          note: 'Godkjent i Norge som likestilt med en norsk kortere mastergrad (HK-dir)',
        },
      ],
    },
    {
      id: 'courses',
      heading: 'Kurs',
      rows: [
        { period: 'feb 2026 –', title: 'Norsk', organisation: 'Nittedal voksenopplæring' },
        {
          period: '2022 – 2023',
          title: 'Frontend Developer (Angular)',
          organisation: 'EPAM University, Ukraina, nettbasert',
        },
        {
          period: '2021 – 2022',
          title: 'Full-Stack Development (React, Node.js), sertifikat',
          organisation: 'GoIT, Ukraina, nettbasert',
        },
      ],
    },
    {
      id: 'community',
      heading: 'Samfunnsengasjement og frivillig arbeid',
      paragraphs: [
        'Valgt medlem av et lokalt kommunestyre; drev regionale ungdoms- og samfunnsprogrammer.',
        'Organiserte engelskkurs for fordrevne barn.',
        'Fosterhjem for dyr og dyrevelferdsarbeid.',
      ],
    },
  ],
};
