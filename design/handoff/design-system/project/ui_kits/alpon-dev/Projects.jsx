const NSP = window.FjordDesignSystem_44c954;

function Projects() {
  const { SectionHeader, FilterChips, ProjectCard, EmptyState, Button, Breadcrumbs } = NSP;
  const all = window.FJ_DATA.projects;
  const [sel, setSel] = React.useState([]);
  const count = (s) => all.filter((p) => p.status === s).length;
  const list = sel.length ? all.filter((p) => sel.includes(p.status)) : all;
  const opts = [{ value: 'live', label: 'Live', count: count('live') }, { value: 'progress', label: 'In progress', count: count('progress') }, { value: 'archived', label: 'Archived', count: count('archived') }, { value: 'client', label: 'Client work', count: 0 }];
  return (
    <>
      <section className="kit-page-head">
        <div className="kit-wrap">
          <Breadcrumbs items={[{ label: 'alpon.dev', href: '#/' }, { label: 'Projects' }]} />
          <SectionHeader as="h1" size="lg" index="02" eyebrow="Projects" title="Projects" lead="Small products I built and run myself. Each page covers the problem, the decisions and what the numbers say." />
          <FilterChips label="Filter by status" options={opts} selected={sel} onChange={setSel} />
        </div>
      </section>
      <section className="kit-section" style={{ paddingTop: 48 }}>
        <div className="kit-wrap">
          {list.length ? (
            <div className="kit-projects kit-projects--grid">
              {list.map((p, i) => <ProjectCard key={p.slug} {...p} tone={i % 3 === 1 ? 'stone' : 'spruce'} href={'#/projects/' + p.slug} liveHref={p.status === 'live' ? '#' : undefined} codeHref="#" />)}
            </div>
          ) : (
            <EmptyState eyebrow="No results" title="No projects with this filter yet" body="Client work is under NDA. Ask me about it in a call." action={<Button variant="ghost" onClick={() => setSel([])}>Clear filters</Button>} />
          )}
        </div>
      </section>
    </>
  );
}
window.Projects = Projects;
