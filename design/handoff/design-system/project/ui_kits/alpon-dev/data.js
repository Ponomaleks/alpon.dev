// Sample content for the alpon.dev UI kit.
// Name, role, contacts and "4 yrs · EPAM Systems" are real (brand pack + alpon.dev).
// Projects, metrics and CV details are PLACEHOLDERS to show the layout; replace before shipping.
window.FJ_DATA = {
  person: {
    name: 'Alexander Ponomarenko', role: 'Software Engineer', role2: 'Full Stack Developer',
    email: 'ponomaleks@gmail.com', phone: '+47 405 94 584',
    linkedin: 'linkedin.com/in/ponomalex', github: 'github.com/ponomaleks',
    location: 'Oslo, Norge', coords: '59.91° N, 10.75° E', updated: '2026-09-30'
  },
  facts: [
    { value: 4, unit: 'yrs', label: 'Full-stack engineering', context: 'EPAM Systems' },
    { value: 3, label: 'Live projects with public code', context: 'alpon.dev/projects' },
    { value: 100, label: 'Lighthouse performance, this site', context: 'Mobile · sample' },
    { value: 'EN · NO', label: 'CV in English and Norwegian', countUp: false }
  ],
  projects: [
    { slug: 'turplan', title: 'Turplan', year: 2026, status: 'live', summary: 'Trip planner for Nordmarka: routes, huts and last-bus times on one screen.', result: { value: '1.1 s', label: 'median LCP on 4G' }, stack: ['TypeScript', 'Next.js', 'PostGIS'], role: 'Solo, full stack' },
    { slug: 'kvittering', title: 'Kvittering', year: 2025, status: 'live', summary: 'Receipt scanner that files expenses by project and exports to CSV.', result: { value: '3 min', label: 'per monthly expense report' }, stack: ['React', 'Node.js', 'SQLite'], role: 'Solo, full stack' },
    { slug: 'bysykkel-status', title: 'Bysykkel status', year: 2025, status: 'live', summary: 'Live map of city-bike docks with a five-minute availability forecast.', result: { value: '0 kB', label: 'client JS on first load' }, stack: ['Astro', 'Cloudflare Workers'], role: 'Solo' },
    { slug: 'nordlys-api', title: 'Nordlys API', year: 2026, status: 'progress', summary: 'Small typed API for aurora forecasts, built to learn edge caching.', result: { value: 'p95 42 ms', label: 'cached response' }, stack: ['Go', 'Redis'], role: 'Solo' },
    { slug: 'cv-2024', title: 'Old portfolio', year: 2024, status: 'archived', summary: 'The previous personal site. Kept for reference.', stack: ['Gatsby'], role: 'Solo' }
  ],
  experience: [
    { role: 'Software Engineer', org: 'EPAM Systems', period: '4 yrs', location: 'Remote', current: true,
      summary: { en: 'Full-stack development on client products.', no: 'Fullstack-utvikling på kundeprodukter.' },
      points: { en: ['Built and maintained React front ends and Node.js services.', 'Worked in cross-functional teams from estimate to release.', 'Reviewed code and onboarded new developers.'], no: ['Utviklet og vedlikeholdt React-frontender og Node.js-tjenester.', 'Jobbet i tverrfaglige team fra estimat til lansering.', 'Gjennomgikk kode og tok imot nye utviklere.'] },
      stack: ['TypeScript', 'React', 'Node.js', 'PostgreSQL'] },
    { role: 'Earlier role', org: 'Company name', period: 'Year – Year', location: 'City',
      summary: { en: 'Placeholder entry. Replace with real history.', no: 'Plassholder. Erstatt med ekte historikk.' }, points: { en: [], no: [] }, stack: [] }
  ],
  skills: [
    { title: { en: 'Frontend', no: 'Frontend' }, items: ['TypeScript', 'React', 'Next.js', 'HTML', 'CSS', 'Accessibility'] },
    { title: { en: 'Backend', no: 'Backend' }, items: ['Node.js', 'REST', 'PostgreSQL', 'Redis'] },
    { title: { en: 'Practice', no: 'Arbeidsmåte' }, items: ['Code review', 'Testing', 'CI/CD', 'Performance budgets'] }
  ],
  languages: {
    en: [{ name: 'English', level: 'Professional working' }, { name: 'Norsk', level: 'Learning', lang: 'no', note: 'Daily practice' }],
    no: [{ name: 'Engelsk', level: 'Profesjonelt arbeidsnivå' }, { name: 'Norsk', level: 'Lærer', note: 'Daglig praksis' }]
  }
};
