const FJM = window.FjordDesignSystem_44c954;

function Lost({ path }) {
  const { NotFound, Button } = FJM;
  return <div className="x-wrap"><NotFound path={path} actions={<><Button href="#/" arrow>Back to home</Button><Button variant="secondary" href="#/projects">See projects</Button></>} /></div>;
}

function Thoughts() {
  const { Breadcrumbs, SectionHeader } = FJM;
  return (
    <>
      <section className="x-head"><div className="x-wrap x-stack">
        <Breadcrumbs items={[{ label: 'alpon.dev', href: '#/' }, { label: 'Thoughts' }]} />
        <SectionHeader as="h1" size="lg" eyebrow="Thoughts · low fidelity" title="Notes from work" lead="Short posts on frontend, backend and working in teams. [Placeholder posts.]" />
      </div></section>
      <section className="x-section x-section--tight"><div className="x-wrap">
        <ol className="x-posts">{window.AP.posts.map((p) => <li key={p.slug}><a href={'#/thoughts/' + p.slug}><time className="fjord-mono-small" dateTime={p.date}>{p.date}</time><span className="x-posts__t">{p.title}</span><span className="x-posts__s">{p.summary}</span><span className="fjord-mono-small x-muted">{p.mins} min read</span></a></li>)}</ol>
      </div></section>
    </>
  );
}

function Article({ slug }) {
  const { Breadcrumbs, Eyebrow, Prose, Callout, Pagination } = FJM;
  const posts = window.AP.posts, i = Math.max(0, posts.findIndex((p) => p.slug === slug)), p = posts[i];
  return (
    <>
      <section className="x-head"><div className="x-wrap x-article">
        <Breadcrumbs items={[{ label: 'alpon.dev', href: '#/' }, { label: 'Thoughts', href: '#/thoughts' }, { label: p.title }]} />
        <Eyebrow><time dateTime={p.date}>{p.date}</time>{' · '}{p.mins} min read</Eyebrow>
        <h1 className="fjord-h1">{p.title}</h1>
        <p className="fjord-lead">{p.summary}</p>
      </div></section>
      <section className="x-section x-section--tight"><div className="x-wrap x-article">
        <Prose>
          <p>[Placeholder article text.] On the first day of a new project I write two numbers into a file: how much JavaScript the first page may load, and how fast the largest element must appear on a mid-range phone.</p>
          <h2>Why a file, not a meeting</h2>
          <p>A number in the repository is checked by CI on every pull request. A number in a meeting is remembered by whoever was there.</p>
          <pre><code><span className="tok-c">// budget.json</span>{'\n'}{'{'} <span className="tok-s">"js"</span>: <span className="tok-k">50</span>, <span className="tok-s">"lcp"</span>: <span className="tok-k">1500</span> {'}'}</code></pre>
          <h3>What changes</h3>
          <ul><li>Dependency discussions get shorter.</li><li>Design reviews include the phone, not just the laptop.</li><li>Regressions show up the day they happen.</li></ul>
          <blockquote>Good products are built together, and the budget is something the whole team can read.</blockquote>
        </Prose>
        <Callout label="Note">Article typography uses the same Prose component as case studies. Measure 66ch, body 16→18px.</Callout>
        <Pagination prev={i > 0 ? { href: '#/thoughts/' + posts[i - 1].slug, title: posts[i - 1].title, label: 'Newer' } : null} next={i < posts.length - 1 ? { href: '#/thoughts/' + posts[i + 1].slug, title: posts[i + 1].title, label: 'Older' } : null} />
      </div></section>
    </>
  );
}
Object.assign(window, { Lost, Thoughts, Article });
