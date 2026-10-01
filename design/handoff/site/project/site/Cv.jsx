const FJV = window.FjordDesignSystem_44c954;

// CV-specific: one employer with several client projects (extension, see Overview › System additions)
function CvJob({ job, ui }) {
  const { TagList } = FJV;
  return (
    <article className={'x-job' + (job.current ? ' x-job--current' : '')}>
      <header className="x-job__head">
        <div><h3 className="x-job__role">{job.role}</h3><p className="x-job__org"><strong>{job.org}</strong>{job.orgNote ? <span> · {job.orgNote}</span> : null}</p></div>
        <span className="x-job__when fjord-mono-small">{job.period}</span>
      </header>
      {job.projects ? <ol className="x-job__projects">{job.projects.map((p) => <li key={p.t}><h4>{p.t}</h4><p>{p.d}</p><div className="x-job__tech"><span className="fjord-mono-small x-muted">{ui.tech}</span><TagList items={p.tech} /></div></li>)}</ol> : null}
      {job.internal ? <div className="x-job__internal"><span className="fj-eyebrow">{ui.internal}</span><ul>{job.internal.map((p) => <li key={p.t}><h4>{p.t}</h4><p>{p.d}</p></li>)}</ul></div> : null}
      {job.text ? <div className="x-job__text">{job.text.map((t, i) => <p key={i}>{t}</p>)}</div> : null}
    </article>
  );
}

function Cv({ lang, onCopied }) {
  const { Breadcrumbs, SectionHeader, SegmentedControl, Button, SkillGroup, LanguageList, ContactList, StickyActionBar, Eyebrow, Prose, TextLink } = FJV;
  const P = window.AP.person, C = window.AP.cv[lang], H = C.h, U = C.ui;
  const [pdf, setPdf] = React.useState(false);
  const [noImg, setNoImg] = React.useState(false); // page images cv/cv-{lang}-{1,2}.webp; falls back to the embedded PDF if missing
  const setLang = (l) => { location.hash = '#/cv/' + l; };
  const secs = [['profile', H.profile], ['skills', H.skills], ['langs', H.langs], ['work', H.work], ['personal', H.personal], ['edu', H.edu], ['courses', H.courses]].concat(C.community ? [['community', H.community]] : []);
  const idx = (id) => String(secs.findIndex((s) => s[0] === id) + 1).padStart(2, '0');
  const Seg = (props) => <SegmentedControl label={lang === 'no' ? 'CV-språk' : 'CV language'} value={lang} onChange={setLang} options={[{ value: 'en', label: 'EN' }, { value: 'no', label: 'NO', lang: 'no' }]} {...props} />;
  const Sec = ({ id, children }) => <section id={id} className="x-cvsec"><SectionHeader index={idx(id)} title={H[{ 'profile': 'profile', skills: 'skills', langs: 'langs', work: 'work', personal: 'personal', edu: 'edu', courses: 'courses', community: 'community' }[id]]} size="sm" />{children}</section>;
  return (
    <div lang={lang === 'no' ? 'no' : 'en'} className="x-cv">
      <section className="x-head">
        <div className="x-wrap x-stack">
          <Breadcrumbs items={[{ label: 'alpon.dev', href: '#/' }, { label: 'CV' }]} />
          <div className="x-cvbar">
            <div className="x-stack x-stack--sm">
              <h1 className="fjord-h1">{P.name}</h1>
              <p className="x-cvbar__role">{C.title}</p>
              <p className="x-cvbar__meta fjord-mono-small"><span>{C.location} · {C.permit}</span></p>
            </div>
            <div className="x-cvbar__tools">
              <Seg size="lg" />
              <div className="x-row">
                <Button href={cvPdf(lang)} download icon="file-down">{U.dl}</Button>
                <Button variant="secondary" href="#/contact" lang="en">Get in touch</Button>
                <Button variant="ghost" icon="file-text" onClick={() => window.print()}>{U.print}</Button>
              </div>
              <span className="fjord-mono-small x-muted">{U.updated} {P.updated} · {U.meta}</span>
            </div>
          </div>
          <div><Button variant="ghost" size="sm" icon={pdf ? 'x' : 'eye'} onClick={() => setPdf(!pdf)} aria-expanded={pdf}>{U.preview}</Button></div>
          {pdf ? <div className="x-pdf" role="group" aria-label={U.preview}>{noImg ? <iframe className="x-pdf__embed" src={cvPdf(lang)} title={U.preview}></iframe> : [1, 2].map((n) => <a key={n} className="x-pdf__page" href={cvPdf(lang)} target="_blank" rel="noopener"><img src={'cv/cv-' + lang + '-' + n + '.webp'} alt={(lang === 'no' ? 'CV, side ' : 'CV, page ') + n + ' / 2'} loading="lazy" width="595" height="842" onError={() => setNoImg(true)} /></a>)}<p className="fjord-caption">{U.meta}</p></div> : null}
        </div>
      </section>

      <section className="x-section x-section--tight">
        <div className="x-wrap x-cvgrid">
          <article className="x-cvmain">
            <Sec id="profile"><Prose><p>{C.profile}</p></Prose></Sec>
            <Sec id="skills"><div className="x-grid2 x-grid2--tight">{C.skills.map((s) => <SkillGroup key={s.title} title={s.title} items={s.items} />)}</div></Sec>
            <Sec id="langs"><LanguageList items={C.langs} /></Sec>
            <Sec id="work"><div className="x-jobs">{C.jobs.map((j) => <CvJob key={j.role} job={j} ui={U} />)}</div></Sec>
            <Sec id="personal">
              {U.personalNote ? <p className="x-muted x-cvnote">{U.personalNote}</p> : null}
              <ul className="x-cvlist">{C.personal.map((p) => <li key={p.t}><div className="x-cvlist__head"><h3 className="fjord-h4">{p.t}</h3><span className="fjord-mono-small x-muted">{p.stack}</span></div><p>{p.d}</p><TextLink variant="external" mono href={'https://' + p.url}>{p.url}</TextLink></li>)}</ul>
            </Sec>
            <Sec id="edu"><ul className="x-rows">{C.edu.map((e) => <li key={e.t}><span className="x-rows__when fjord-mono-small">{e.p}<br />{e.w}</span><div><strong>{e.t}</strong><span>{e.o}</span>{e.note ? <small>{e.note}</small> : null}</div></li>)}</ul></Sec>
            <Sec id="courses"><ul className="x-rows">{C.courses.map((e) => <li key={e.t}><span className="x-rows__when fjord-mono-small">{e.p}</span><div><strong lang={e.lang}>{e.t}</strong><span lang={e.lang ? 'no' : undefined}>{e.o}</span></div></li>)}</ul></Sec>
            {C.community ? <Sec id="community"><Prose><ul>{C.community.map((c, i) => <li key={i}>{c}</li>)}</ul></Prose></Sec> : null}
          </article>
          <aside className="x-cvside">
            <nav aria-label={U.toc}><Eyebrow>{U.toc}</Eyebrow><ol className="x-toc">{secs.map(([id, l], i) => <li key={id}><a href={'#' + id}><span>{String(i + 1).padStart(2, '0')}</span>{l}</a></li>)}</ol></nav>
            <div className="x-stack x-stack--sm"><Eyebrow>{U.contact}</Eyebrow><ContactList email={P.email} phone={P.phone} linkedin={P.linkedin} github={P.github} location={P.location} onCopied={onCopied} vcardHref={null} /></div>
            <Button href={cvPdf(lang)} download icon="file-down" block>{U.dl}</Button>
          </aside>
        </div>
      </section>
      <StickyActionBar><Seg /><Button href={cvPdf(lang)} download icon="file-down" size="sm">{U.dl}</Button></StickyActionBar>
    </div>
  );
}
window.Cv = Cv;
