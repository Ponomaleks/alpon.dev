const FJA = window.FjordDesignSystem_44c954;
const Q = new URLSearchParams(location.search);

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "portrait": true,
  "testimonials": true,
  "catalog": "8+",
  "formOutcome": "success"
}/*EDITMODE-END*/;

// #live / #code stay prototype placeholders until the pet projects exist. CV PDFs and the vCard are real files.
const PLACEHOLDER_LINKS = { '#live': ['Opens the live app', 'name.alpon.dev · new tab'], '#code': ['Opens the repository', window.AP.person.github] };
const cvPdf = (lang) => 'cv/alexander-ponomarenko-cv-' + (lang === 'no' ? 'no' : 'en') + '.pdf';
const VCARD = 'alexander-ponomarenko.vcf';
function downloadFile(href) { const a = document.createElement('a'); a.href = href; a.download = ''; document.body.appendChild(a); a.click(); a.remove(); }
Object.assign(window, { cvPdf, VCARD });

function parseRoute() {
  const h = decodeURIComponent(location.hash.replace(/^#\/?/, ''));
  const [a, b] = h.split('/');
  if (!a) return { page: 'home' };
  if (a === 'contact') return { page: 'home', anchor: 'contact' };
  if (a === 'projects') return b ? (window.AP.projects.some((p) => p.slug === b) ? { page: 'case', slug: b } : { page: '404', path: '/' + h }) : { page: 'projects' };
  if (a === 'cv') return { page: 'cv', lang: b === 'no' ? 'no' : 'en' };
  if (a === 'thoughts') return b ? { page: 'article', slug: b } : { page: 'thoughts' };
  return { page: '404', path: '/' + h };
}
const keyOf = (r) => r.page + (r.slug || '');

function App() {
  const { Header, MobileMenu, Footer, CtaBand, CommandPalette, ToastRegion, StickyActionBar, Button } = FJA;
  const [tw, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const t = { ...tw };
  if (Q.has('portrait')) t.portrait = Q.get('portrait') !== '0';
  if (Q.has('catalog')) t.catalog = Q.get('catalog');
  if (Q.has('recs')) t.testimonials = Q.get('recs') !== '0';
  if (Q.has('form')) t.formOutcome = Q.get('form');
  t.formState = Q.get('fstate') || undefined;
  const [route, setRoute] = React.useState(parseRoute);
  const [theme, setTheme] = React.useState(() => document.documentElement.getAttribute('data-theme') || 'dag');
  const [menu, setMenu] = React.useState(Q.get('open') === 'menu');
  const [palette, setPalette] = React.useState(Q.get('open') === 'palette');
  const [toasts, setToasts] = React.useState([]);
  const [onHero, setOnHero] = React.useState(true);
  const routeRef = React.useRef(route);
  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const toast = (message, meta, tone = 'success', lang) => setToasts((x) => [...x, { id: Date.now() + Math.random(), message, meta, tone, lang }]);
  const onCopied = (v) => toast('Kopiert', v, 'success', 'no');

  React.useEffect(() => {
    const on = () => {
      const next = parseRoute();
      const same = keyOf(next) === keyOf(routeRef.current);
      const go = () => { ReactDOM.flushSync(() => setRoute(next)); routeRef.current = next; if (!same && !next.anchor) window.scrollTo(0, 0); };
      if (!same && document.startViewTransition && !reduce()) document.startViewTransition(go); else go();
    };
    addEventListener('hashchange', on); return () => removeEventListener('hashchange', on);
  }, []);
  React.useEffect(() => { if (Q.has('y')) setTimeout(() => window.scrollTo(0, +Q.get('y')), 900); if (Q.has('at')) setTimeout(() => scrollToId(Q.get('at')), 900); }, []);
  React.useEffect(() => { if (route.anchor) setTimeout(() => scrollToId(route.anchor), 60); }, [route]);
  React.useEffect(() => {
    const on = () => { const h = document.querySelector('[data-hero]'); setOnHero(!!h && h.getBoundingClientRect().bottom > 72); };
    on(); addEventListener('scroll', on, { passive: true }); return () => removeEventListener('scroll', on);
  }, [route.page]);
  React.useEffect(() => {
    const els = document.querySelectorAll('.fjord-reveal:not(.is-in)');
    if (!('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('is-in')); return; }
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
    els.forEach((e) => io.observe(e)); return () => io.disconnect();
  }, [route, t.testimonials]);
  React.useEffect(() => {
    const on = (e) => {
      const a = e.target.closest && e.target.closest('a[href]'); if (!a) return;
      const href = a.getAttribute('href');
      if (PLACEHOLDER_LINKS[href]) { e.preventDefault(); const [m, meta] = PLACEHOLDER_LINKS[href]; toast(m, meta + ' · prototype', 'info'); return; }
      if (href === '/') { e.preventDefault(); location.hash = '#/'; return; }
      if (href.startsWith('#') && !href.startsWith('#/') && href.length > 1 && document.getElementById(href.slice(1))) { e.preventDefault(); scrollToId(href.slice(1)); }
    };
    document.addEventListener('click', on, true); return () => document.removeEventListener('click', on, true);
  }, []);

  // Same rule as Fjord applyTheme (View Transition cross-fade, skipped under reduced motion), plus a synchronous React update inside the transition
  const setT = (v) => {
    const set = () => { ReactDOM.flushSync(() => setTheme(v)); document.documentElement.setAttribute('data-theme', v); try { localStorage.setItem('fjord-theme', v); } catch (e) {} };
    if (document.startViewTransition && !reduce()) document.startViewTransition(set); else set();
  };
  const nav = (h) => () => { location.hash = h; };
  const copy = (v) => () => { try { navigator.clipboard.writeText(v); } catch (e) {} onCopied(v); };
  const P = window.AP.person;
  const items = [
    { group: 'Go to', label: 'Home', icon: 'house', onSelect: nav('#/') },
    { group: 'Go to', label: 'Projects', icon: 'layers', onSelect: nav('#/projects') },
    { group: 'Go to', label: 'CV (English)', icon: 'file-text', onSelect: nav('#/cv/en') },
    { group: 'Go to', label: 'CV (Norsk)', icon: 'languages', keywords: 'norwegian norsk', onSelect: nav('#/cv/no') },
    { group: 'Go to', label: 'Contact', icon: 'mail', onSelect: nav('#/contact') },
    { group: 'Go to', label: 'Thoughts', icon: 'compass', keywords: 'blog', onSelect: nav('#/thoughts') },
    ...window.AP.projects.slice(0, t.catalog === '3' ? 3 : 99).map((p) => ({ group: 'Projects', label: p.title, icon: 'map', hint: p.type.toUpperCase() + ' · ' + p.year, keywords: p.stack.join(' '), onSelect: nav('#/projects/' + p.slug) })),
    { group: 'Actions', label: 'Copy email', icon: 'copy', hint: P.email, onSelect: copy(P.email) },
    { group: 'Actions', label: 'Copy phone', icon: 'phone', hint: P.phone, onSelect: copy(P.phone) },
    { group: 'Actions', label: 'Download CV (PDF)', icon: 'file-down', keywords: 'pdf resume', onSelect: () => downloadFile(cvPdf(route.page === 'cv' ? route.lang : 'en')) },
    { group: 'Actions', label: theme === 'dag' ? 'Switch to dark theme' : 'Switch to light theme', icon: theme === 'dag' ? 'moon' : 'sun', keywords: 'theme dark light natt dag', onSelect: () => setT(theme === 'dag' ? 'natt' : 'dag') }
  ];
  const current = { case: 'projects', projects: 'projects', cv: 'cv' }[route.page] || (route.anchor ? 'contact' : '');
  const hero = (route.page === 'home' || route.page === 'case') && onHero && theme === 'dag';
  const links = [{ id: 'projects', label: 'Projects', href: '#/projects' }, { id: 'cv', label: 'CV', href: '#/cv' }, { id: 'contact', label: 'Contact', href: '#/contact' }];
  const formSubmit = () => new Promise((res, rej) => setTimeout(t.formOutcome === 'error' ? rej : res, 1200));
  let page;
  switch (route.page) {
    case 'home': page = <Home t={t} onCopied={onCopied} formSubmit={formSubmit} />; break;
    case 'projects': page = <Projects t={t} />; break;
    case 'case': page = <CaseStudy slug={route.slug} onCopied={onCopied} />; break;
    case 'cv': page = <Cv lang={route.lang} onCopied={onCopied} />; break;
    case 'thoughts': page = <Thoughts />; break;
    case 'article': page = <Article slug={route.slug} />; break;
    default: page = <Lost path={route.path} />;
  }
  return (
    <ThemeCtx.Provider value={theme}>
      <a className="x-skip" href="#main">Skip to content</a>
      <Header className={hero ? 'fjord-on-spruce x-header--hero' : ''} current={current} theme={theme} onThemeChange={setT} onOpenPalette={() => setPalette(true)} onOpenMenu={() => setMenu(true)}
        ctaHref="#/contact" ctaVariant={route.page === 'home' && onHero ? 'secondary' : 'primary'} links={links} />
      <main id="main" tabIndex="-1" className="x-main" data-page={route.page} key={keyOf(route) + (route.lang || '')}>{page}</main>
      {route.page !== '404' ? <div className="x-end"><CtaBand ambient title="Let’s build something good together." body="If your team is hiring in the Oslo area, I’d like to hear about it." primary={{ label: 'Get in touch', href: '#/contact' }} secondary={{ label: 'Download CV', href: cvPdf(route.page === 'cv' ? route.lang : 'en'), download: true }} /></div> : null}
      <Footer email={P.email} phone={P.phone} linkedin={P.linkedin} github={P.github} location={P.location} coords={P.coords} updated={P.updated} />
      <MobileMenu open={menu} onClose={() => setMenu(false)} current={current} theme={theme} onThemeChange={setT} links={links} email={P.email} phone={P.phone} location={P.location} ctaHref="#/contact" />
      <CommandPalette open={palette} onOpen={() => setPalette(true)} onClose={() => setPalette(false)} items={items} placeholder="Search pages, projects, actions…" />
      {route.page !== 'cv' ? <StickyActionBar><Button variant="secondary" href="#/cv" icon="file-text">View CV</Button><Button href="#/contact">Get in touch</Button></StickyActionBar> : null}
      <BackToTop />
      <ToastRegion toasts={toasts} onExpire={(id) => setToasts((x) => x.filter((z) => z.id !== id))} />
      <TweaksPanel>
        <TweakSection label="Home" />
        <TweakToggle label="Hero portrait" value={tw.portrait} onChange={(v) => setTweak('portrait', v)} />
        <TweakToggle label="Recommendations block" value={tw.testimonials} onChange={(v) => setTweak('testimonials', v)} />
        <TweakRadio label="Contact form result" value={tw.formOutcome} options={['success', 'error']} onChange={(v) => setTweak('formOutcome', v)} />
        <TweakSection label="Projects" />
        <TweakRadio label="Catalog size" value={tw.catalog} options={['3', '8+']} onChange={(v) => setTweak('catalog', v)} />
        <TweakSection label="Theme" />
        <TweakRadio label="Theme" value={theme} options={[{ value: 'dag', label: 'Light' }, { value: 'natt', label: 'Dark' }]} onChange={setT} />
        <TweakSection label="Jump to" />
        <TweakSelect label="Screen" value={location.hash || '#/'} options={[{ value: '#/', label: 'Home' }, { value: '#/projects', label: 'Projects' }, { value: '#/projects/project-one', label: 'Case · web app' }, { value: '#/projects/project-two', label: 'Case · API' }, { value: '#/cv/en', label: 'CV · EN' }, { value: '#/cv/no', label: 'CV · NO' }, { value: '#/thoughts', label: 'Thoughts' }, { value: '#/nowhere', label: '404' }]} onChange={(v) => { location.hash = v; }} />
      </TweaksPanel>
    </ThemeCtx.Provider>
  );
}
window.App = App;
