const FJC = window.FjordDesignSystem_44c954;

const CASE_COPY = {
  web: {
    sections: [
      { id: 'problem', label: 'Problem', title: 'Booking a call took five emails', body: <p>[Placeholder] Small teams I talked to booked client calls by email. Each booking took several messages, and double bookings happened every week. Existing tools were built for large companies and priced that way.</p> },
      { id: 'approach', label: 'Approach', title: 'One link, one screen', body: <><p>[Placeholder] I cut the scope to one question: <strong>can a client pick a time without writing to anyone?</strong></p><ul><li>A public booking page per team, no account needed.</li><li>Shared calendars read from existing providers.</li><li>Email reminders, nothing else.</li></ul></> },
      { id: 'architecture', label: 'Architecture', title: 'Small moving parts', diagram: [{ label: 'Client', nodes: [{ title: 'React SPA', note: 'Vite · static' }, { title: 'Booking page', note: 'pre-rendered' }] }, { label: 'API', nodes: [{ title: 'FastAPI', note: 'Python 3.12', accent: true }, { title: 'Worker', note: 'reminders' }] }, { label: 'Data', nodes: [{ title: 'PostgreSQL', note: 'bookings' }, { title: 'Calendar APIs', note: 'read-only' }] }] },
      { id: 'challenges', label: 'Challenges', title: 'Time zones and race conditions', body: <><p>[Placeholder] Two people clicking the same slot at the same second was the hard part. A unique constraint on (team, start) in PostgreSQL made the second request fail cleanly instead of silently.</p><pre><code><span className="tok-c">-- one booking per slot</span>{'\n'}<span className="tok-k">create unique index</span> on bookings (team_id, starts_at);</code></pre></> },
      { id: 'learned', label: 'What I learned', title: 'What I’d do again', body: <p>[Placeholder] Write the performance budget before the first component. Test with real calendars early; the edge cases live there.</p> }
    ],
    results: [{ value: 1.2, decimals: 1, suffix: ' s', label: 'Median load on 4G', context: '[placeholder] · WebPageTest' }, { value: 100, label: 'Lighthouse accessibility', context: '[placeholder] · mobile' }, { value: 38, suffix: ' kB', label: 'JS on first load', context: '[placeholder] · gzip' }, { value: 12, label: 'Teams using it', context: '[placeholder]' }]
  },
  api: {
    sections: [
      { id: 'problem', label: 'Problem', title: 'Departure data, but not in a shape apps want', body: <p>[Placeholder] The public transit data is complete but verbose. Small apps needed three fields and got three hundred, with rate limits that hurt during rush hour.</p> },
      { id: 'approach', label: 'Approach', title: 'A thin, typed layer with a cache', body: <><p>[Placeholder] A small FastAPI service that answers two questions well: <strong>what leaves from this stop next</strong>, and <strong>where is this stop</strong>.</p><ul><li>Pydantic models generate the OpenAPI docs.</li><li>Redis caches each stop for 20 seconds.</li><li>Errors are plain JSON with a stable code.</li></ul></> },
      { id: 'architecture', label: 'Architecture', title: 'Request path', diagram: [{ label: 'Client', nodes: [{ title: 'Any HTTP client', note: 'JSON' }] }, { label: 'Service', nodes: [{ title: 'FastAPI', note: 'uvicorn', accent: true }, { title: 'Redis', note: 'TTL 20 s' }] }, { label: 'Upstream', nodes: [{ title: 'Transit GraphQL', note: 'public' }] }] },
      { id: 'challenges', label: 'Challenges', title: 'Cache stampedes at 07:59', body: <p>[Placeholder] When a popular stop expired, dozens of requests hit upstream at once. A short lock per key made one request refresh while others waited a few milliseconds.</p> },
      { id: 'learned', label: 'What I learned', title: 'Docs are the product', body: <p>[Placeholder] For an API without a UI, the docs page is the first impression. Examples you can run beat paragraphs.</p> }
    ],
    results: [{ value: 42, suffix: ' ms', label: 'p95 cached response', context: '[placeholder] · k6' }, { value: 99.9, decimals: 1, suffix: '%', label: 'Uptime, 90 days', context: '[placeholder] · status page' }, { value: 2, label: 'Endpoints, fully typed', context: 'OpenAPI 3.1' }]
  }
};
CASE_COPY.tool = CASE_COPY.web;

function CaseStudy({ slug, onCopied }) {
  const { Breadcrumbs, Eyebrow, SectionHeader, MetaRow, TrailNav, Prose, ArchDiagram, StatRow, InlineCta, Pagination, Button, Terrain, Figure } = FJC;
  const all = window.AP.projects;
  const i = all.findIndex((p) => p.slug === slug);
  const p = all[i], prev = all[(i - 1 + all.length) % all.length], next = all[(i + 1) % all.length];
  const C = CASE_COPY[p.type];
  const api = p.type === 'api';
  const dark = useDark();
  const typeLabel = { web: 'Web app', api: 'API · backend', tool: 'Tool · library' }[p.type];
  const trail = C.sections.map((s) => ({ id: s.id, label: s.label }));
  return (
    <>
      <section className={'x-chero' + (dark ? ' x-chero--natt' : ' fjord-on-spruce')} data-hero="">
        <div className="x-chero__bg" style={{ viewTransitionName: 'project-' + p.slug }}><Terrain seed={p.slug} tone={dark ? 'auto' : 'spruce'} aspect="auto" ambient /></div>
        <div className="x-wrap x-chero__in">
          <Breadcrumbs items={[{ label: 'alpon.dev', href: '#/' }, { label: 'Projects', href: '#/projects' }, { label: p.title }]} />
          <div className="x-stack">
            <Eyebrow>Case study{' · '}{typeLabel}{' · '}{p.year}</Eyebrow>
            <h1 className="fjord-display x-chero__title">{p.title}</h1>
            <p className="x-chero__lead">{p.summary}</p>
          </div>
          <div className="x-row">
            {p.status === 'progress' ? <Button size="lg" href="#code" icon="github">View code on GitHub</Button> : <>
              <Button size="lg" href="#live" iconEnd="arrow-up-right">{api ? 'Open API docs' : 'Open live app'}</Button>
              <Button size="lg" variant="secondary" href="#code" icon="github">View code on GitHub</Button></>}
          </div>
          <MetaRow items={[{ label: 'Role', value: p.role }, { label: 'Year', value: p.year }, { label: 'Stack', value: p.stack.join(', ') }, { label: 'Status', value: { live: 'Live', progress: 'In progress', archived: 'Archived' }[p.status] + (p.sub ? ' · ' + p.sub : '') }]} />
        </div>
      </section>

      <div className="x-case-mtrail"><MobileTrail sections={trail} /></div>

      <section className="x-section x-section--tight" aria-label={api ? 'Try the API' : 'Live preview'}>
        <div className="x-wrap x-stack">
          <Eyebrow>{api ? 'Try it' : p.type === 'tool' ? 'Example run' : 'Live preview'}{' / '}{p.sub || 'alpon.dev'}</Eyebrow>
          {api ? <ApiConsole onCopied={onCopied} /> : p.type === 'tool' ? <Prose><pre><code><span className="tok-c">$ npx [tool-name] check https://alpon.dev</span>{'\n'}  js        <span className="tok-k">38 kB</span>  / 50 kB   ok{'\n'}  lcp       <span className="tok-k">1.1 s</span>  / 1.5 s   ok{'\n'}  requests  <span className="tok-s">24</span>     / 20      over by 4{'\n'}<span className="tok-c">[placeholder output]</span></code></pre></Prose> : <>
            <div className="x-only-desk"><BrowserFrame url={'https://' + (p.sub || 'one.alpon.dev')}><BookingDemo /></BrowserFrame></div>
            <div className="x-only-mob"><Figure seed={p.slug + '-shot'} index="Fig. 0" caption="Booking page on a 390px screen. The interactive preview runs on larger screens." ratio="4 / 5" /></div></>}
        </div>
      </section>

      <section className="x-section x-section--tight" aria-labelledby="results">
        <div className="x-wrap x-stack x-stack--lg">
          <SectionHeader eyebrow="Results" title="What the numbers say" size="sm" id="results" />
          <StatRow compact items={C.results} label="Project results" />
          <InlineCta title="Need something like this on your team?" body="I’m open to full-time roles in the Oslo area." action="Get in touch" href="#/contact" />
        </div>
      </section>

      <div className="x-wrap">
        <div className="x-case">
          <aside className="x-case__trail"><TrailNav sections={trail} /></aside>
          <div className="x-case__body">
            {C.sections.map((s, n) => (
              <section key={s.id} id={s.id} className="x-case__sec">
                <SectionHeader index={String(n + 1).padStart(2, '0')} eyebrow={s.label} title={s.title} size="sm" />
                {s.body ? <Prose>{s.body}</Prose> : null}
                {s.diagram ? <><ArchDiagram columns={s.diagram} label={p.title + ' architecture'} /><p className="fjord-caption"><b className="fjord-mono-small">Fig. 1</b> · [Placeholder] Request path from browser to database.</p></> : null}
              </section>
            ))}
            <InlineCta title="That’s the project. Want to talk about yours?" body="Email is fastest. I answer within a day." action="Get in touch" href="#/contact" />
            <Pagination prev={{ href: '#/projects/' + prev.slug, title: prev.title, label: 'Previous project' }} next={{ href: '#/projects/' + next.slug, title: next.title, label: 'Next project' }} />
          </div>
        </div>
      </div>
    </>
  );
}
window.CaseStudy = CaseStudy;
