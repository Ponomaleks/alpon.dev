const NSC = window.FjordDesignSystem_44c954;

function CaseStudy({ slug }) {
  const { Breadcrumbs, SectionHeader, MetaRow, Figure, TrailNav, Prose, ArchDiagram, StatRow, Callout, InlineCta, NextProject, StatusBadge, TextLink, Terrain } = NSC;
  const all = window.FJ_DATA.projects;
  const i = Math.max(0, all.findIndex((p) => p.slug === slug));
  const p = all[i], next = all[(i + 1) % all.length];
  const sections = [{ id: 'problem', label: 'Problem' }, { id: 'approach', label: 'Approach' }, { id: 'architecture', label: 'Architecture' }, { id: 'results', label: 'Results' }, { id: 'lessons', label: 'Lessons' }];
  return (
    <>
      <section className="kit-page-head">
        <div className="kit-wrap">
          <Breadcrumbs items={[{ label: 'alpon.dev', href: '#/' }, { label: 'Projects', href: '#/projects' }, { label: p.title }]} />
          <SectionHeader as="h1" size="lg" eyebrow={'Case study · ' + p.year} title={p.title} lead={p.summary} />
          <div className="kit-row" style={{ gap: 20 }}><StatusBadge status={p.status} /><TextLink variant="external" href="#">Live</TextLink><TextLink variant="external" href="#">Code</TextLink></div>
          <MetaRow items={[{ label: 'Role', value: p.role }, { label: 'Year', value: p.year }, { label: 'Stack', value: p.stack.join(', ') }, { label: 'Status', value: { live: 'Live', progress: 'In progress', archived: 'Archived' }[p.status] }]} />
          <div className="fj-media" style={{ aspectRatio: '21 / 9', viewTransitionName: 'project-' + p.slug }}><Terrain seed={p.slug} tone="spruce" aspect="auto" /></div>
        </div>
      </section>
      <div className="kit-wrap">
        <div className="kit-case">
          <aside className="kit-case__trail"><TrailNav sections={sections} /></aside>
          <div className="kit-case__body">
            <section id="problem">
              <SectionHeader index="01" eyebrow="Problem" title="Three tabs to plan one hike" size="sm" />
              <Prose><p>Planning a day trip meant a map app, the hut association’s site and the public transport planner. None of them knew about the others, and the last bus home was the thing people forgot.</p></Prose>
            </section>
            <section id="approach">
              <SectionHeader index="02" eyebrow="Approach" title="One screen, offline first" size="sm" />
              <Prose><p>I cut the scope to one question: <strong>can I get there and back today?</strong> Route, huts on the way and the last departure, on one screen that still works without signal.</p><ul><li>Static pages, generated nightly.</li><li>Only departures are fetched live.</li><li>Tiles and route geometry cached on first visit.</li></ul></Prose>
              <Callout label="Decision">Static export with an edge cache instead of server rendering. Pages come from the CDN; the API only answers departure queries.</Callout>
            </section>
            <section id="architecture">
              <SectionHeader index="03" eyebrow="Architecture" title="Small moving parts" size="sm" />
              <ArchDiagram columns={[{ label: 'Client', nodes: [{ title: 'Next.js', note: 'static export' }, { title: 'Service worker', note: 'offline tiles' }] }, { label: 'Edge', nodes: [{ title: 'API route', note: 'Node 20', accent: true }] }, { label: 'Data', nodes: [{ title: 'PostgreSQL', note: '+ PostGIS' }, { title: 'Entur API', note: 'departures' }] }]} />
              <Figure seed={p.slug + '-fig'} index="Fig. 1" caption="Route view with hut markers on a 360px screen." />
            </section>
            <section id="results">
              <SectionHeader index="04" eyebrow="Results" title="What the numbers say" size="sm" />
              <StatRow compact items={[{ value: 1.1, decimals: 1, suffix: ' s', label: 'Median LCP on 4G', context: 'sample data' }, { value: 38, suffix: ' kB', label: 'JS on first load', context: 'gzip' }, { value: 100, label: 'Lighthouse accessibility', context: 'mobile' }]} />
              <InlineCta />
            </section>
            <section id="lessons">
              <SectionHeader index="05" eyebrow="Lessons" title="What I’d do again" size="sm" />
              <Prose><p>Write the performance budget before the first component. It made every later decision shorter.</p><pre><code><span className="tok-c">// budget.json</span>{'\n'}{'{'} <span className="tok-s">"js"</span>: <span className="tok-k">50</span>, <span className="tok-s">"lcp"</span>: <span className="tok-k">1500</span> {'}'}</code></pre></Prose>
            </section>
            <NextProject title={next.title} slug={next.slug} summary={next.summary} href={'#/projects/' + next.slug} />
          </div>
        </div>
      </div>
    </>
  );
}
window.CaseStudy = CaseStudy;
