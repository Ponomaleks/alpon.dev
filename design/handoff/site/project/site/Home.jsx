const FJH = window.FjordDesignSystem_44c954;

function Home({ t, onCopied, formSubmit }) {
  const { Contours, Portrait, AvailabilityBadge, Button, StatRow, SectionHeader, TextLink, ContactList, QrTile, ContactForm, Eyebrow, ExperienceList, ExperienceItem, Testimonial } = FJH;
  const D = window.AP, P = D.person;
  const feat = D.projects.filter((p) => p.featured);
  const quotes = t.testimonials ? D.testimonials : [];
  const dark = useDark();
  return (
    <>
      <section className={'x-hero' + (dark ? ' x-hero--natt' : ' fjord-on-spruce') + (t.portrait ? ' x-hero--portrait' : '')} data-hero="">
        <Contours shape="corner" anchor="bottom-right" tone={dark ? 'auto' : 'spruce'} scale={t.portrait ? 1.15 : 1.35} ambient parallax />
        <div className="x-wrap x-hero__in">
          <div className="x-hero__text">
            <AvailabilityBadge status="open" />
            <Eyebrow><span lang="no">Hei.</span>{' / '}<span lang="no">Oslo, Norge</span>{' · '}{P.coords}</Eyebrow>
            <h1 className="x-hero__name">{P.name}</h1>
            <p className="x-hero__role"><span>{P.role}</span><span>{P.role2}</span></p>
            <p className="x-hero__lead">Good products are built together.</p>
            <div className="x-row x-hero__actions">
              <Button size="lg" href="#/cv" icon="file-text">View CV</Button>
              <Button size="lg" variant="secondary" href="#/projects" arrow>See projects</Button>
            </div>
            <p className="x-hero__now fjord-mono-small"><span className="x-now-dot" aria-hidden="true"></span><span lang="no">Nå:</span> {P.now} · MSc Computer Science at Woolf University</p>
          </div>
          {t.portrait ? <div className="x-hero__media"><div className="x-orb"><Portrait src="assets/portrait.png" alt={P.name} width="100%" ratio="1 / 1" contours={false} /></div></div> : null}
        </div>
      </section>

      <section className="x-facts" aria-label="Key facts">
        <div className="x-wrap"><div className="x-facts__panel"><StatRow items={D.facts} label="Key facts" /></div></div>
      </section>

      <section className="x-section fjord-reveal" aria-labelledby="about">
        <div className="x-wrap x-split">
          <div className="x-stack">
            <SectionHeader index="01" eyebrow="About" title="Frontend-focused, full stack." id="about" />
            <p className="x-intro">{D.intro}</p>
          </div>
          <QuickFacts items={D.quick} />
        </div>
      </section>

      <section className="x-section fjord-reveal" aria-labelledby="selected">
        <div className="x-wrap x-stack x-stack--lg">
          <div className="x-row x-row--between x-row--end">
            <SectionHeader index="02" eyebrow="Projects" title="Selected projects" id="selected" lead="Small products I built and run. Each has a write-up with the problem, the decisions and the numbers." />
            <TextLink variant="standalone" href="#/projects">All projects</TextLink>
          </div>
          <ShotCard p={feat[0]} variant="featured" />
          <div className="x-grid2">{feat.slice(1, 3).map((p, i) => <ShotCard key={p.slug} p={p} tone={i ? 'spruce' : 'stone'} />)}</div>
        </div>
      </section>

      <section className="x-section fjord-reveal" aria-labelledby="xp">
        <div className="x-wrap x-split">
          <div className="x-stack">
            <SectionHeader index="03" eyebrow="Experience" title="Where I’ve worked" id="xp" />
            <TextLink variant="standalone" href="#/cv">Full CV</TextLink>
          </div>
          <ExperienceList>{D.timeline.map((x, i) => <ExperienceItem key={i} {...x} defaultOpen={i === 0} />)}</ExperienceList>
        </div>
      </section>

      {quotes.length ? (
        <section className="x-section fjord-reveal" aria-labelledby="recs">
          <div className="x-wrap x-stack x-stack--lg">
            <SectionHeader index="04" eyebrow="Recommendations" title="From people I’ve worked with" id="recs" size="md" />
            <div className="x-grid2">{quotes.map((q, i) => <Testimonial key={i} {...q} href={'https://www.' + P.linkedin} linkLabel="On LinkedIn" />)}</div>
          </div>
        </section>
      ) : null}

      <section className="x-section fjord-reveal" aria-labelledby="contact" id="contact">
        <div className="x-wrap x-stack x-stack--lg">
          <SectionHeader index={quotes.length ? '05' : '04'} eyebrow="Contact" title="Get in touch" id="contact-h" lead="Email is fastest. Phone and LinkedIn work too." />
          <div className="x-split x-split--contact">
            <div className="x-stack">
              <ContactList email={P.email} phone={P.phone} linkedin={P.linkedin} github={P.github} location={P.location} onCopied={onCopied} vcardHref={VCARD} />
              <div className="x-qr"><QrTile size={132} caption="Skann meg" /><p className="fjord-small x-muted">Point your phone’s camera here to open my contact card.</p></div>
            </div>
            <div className="x-stack"><h3 className="fjord-h4">Or send a short message</h3><ContactForm key={t.formOutcome} email={P.email} onSubmit={formSubmit} status={t.formState} /></div>
          </div>
        </div>
      </section>
    </>
  );
}

function Projects({ t }) {
  const { SectionHeader, FilterChips, EmptyState, Button, Breadcrumbs } = FJH;
  const all = t.catalog === '3' ? window.AP.projects.slice(0, 3) : window.AP.projects;
  const [sel, setSel] = React.useState([new URLSearchParams(location.search).get('filter') || 'all']);
  const f = sel[0] || 'all';
  const n = (k) => all.filter((p) => p.type === k).length;
  const list = f === 'all' ? all : f === 'client' ? [] : all.filter((p) => p.type === f);
  const opts = [{ value: 'all', label: 'All', count: all.length }, { value: 'web', label: 'Web apps', count: n('web') }, { value: 'api', label: 'APIs', count: n('api') }, { value: 'tool', label: 'Tools', count: n('tool') }, { value: 'client', label: 'Client work', count: 0 }];
  return (
    <>
      <section className="x-head">
        <div className="x-wrap x-stack">
          <Breadcrumbs items={[{ label: 'alpon.dev', href: '#/' }, { label: 'Projects' }]} />
          <SectionHeader as="h1" size="lg" eyebrow="Projects" title="Things I built and run" lead="Web apps, APIs and small tools. Every project links to live code and a short write-up." />
          <FilterChips label="Filter by type" multi={false} options={opts} selected={sel} onChange={(v) => setSel(v.length ? v : ['all'])} />
        </div>
      </section>
      <section className="x-section x-section--tight">
        <div className="x-wrap">
          {list.length ? (
            <div className="x-grid3">
              {list.map((p, i) => <ShotCard key={p.slug} p={p} tone={i % 3 === 1 ? 'stone' : 'spruce'} />)}
              {f === 'all' ? <SoonCard /> : null}
            </div>
          ) : (
            <EmptyState eyebrow="No results" title="No projects with this filter yet" body="Client work is under NDA. Ask me about it in a call." action={<Button variant="secondary" onClick={() => setSel(['all'])}>Show all projects</Button>} />
          )}
        </div>
      </section>
    </>
  );
}
Object.assign(window, { Home, Projects });
