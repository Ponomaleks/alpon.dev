const NSA = window.FjordDesignSystem_44c954;

function parse() {
  const h = location.hash.replace(/^#\/?/, '');
  const [a, b] = h.split('/');
  if (!a) return { page: 'home' };
  if (a === 'projects' && b) return { page: 'case', slug: b };
  if (['projects', 'cv', 'contact'].includes(a)) return { page: a };
  return { page: '404' };
}

function App() {
  const { Header, MobileMenu, Footer, CtaBand, CommandPalette, ToastRegion, StickyActionBar, ScrollProgress, Button, applyTheme } = NSA;
  const [route, setRoute] = React.useState(parse());
  const [theme, setTheme] = React.useState(() => document.documentElement.getAttribute('data-theme') || 'dag');
  const [menu, setMenu] = React.useState(false);
  const [palette, setPalette] = React.useState(false);
  const [toasts, setToasts] = React.useState([]);
  const [pastHero, setPastHero] = React.useState(false);

  React.useEffect(() => { document.documentElement.setAttribute('data-theme', theme); }, []);
  React.useEffect(() => {
    const on = () => { const go = () => { setRoute(parse()); window.scrollTo(0, 0); }; document.startViewTransition ? document.startViewTransition(go) : go(); };
    window.addEventListener('hashchange', on); return () => window.removeEventListener('hashchange', on);
  }, []);
  React.useEffect(() => {
    const on = () => setPastHero(window.scrollY > 520);
    on(); window.addEventListener('scroll', on, { passive: true }); return () => window.removeEventListener('scroll', on);
  }, []);

  const setT = (t) => { setTheme(t); applyTheme(t); };
  const toast = (message, meta) => setToasts((x) => [...x, { id: Date.now() + Math.random(), message, meta }]);
  const onCopied = (v) => toast('Copied', v);
  const nav = (h) => () => { location.hash = h; };
  const items = [
    { group: 'Go to', label: 'Home', icon: 'house', onSelect: nav('#/') },
    { group: 'Go to', label: 'Projects', icon: 'layers', onSelect: nav('#/projects') },
    { group: 'Go to', label: 'CV', icon: 'file-text', onSelect: nav('#/cv') },
    { group: 'Go to', label: 'Contact', icon: 'mail', onSelect: nav('#/contact') },
    ...window.FJ_DATA.projects.map((p) => ({ group: 'Projects', label: p.title, icon: 'map', hint: String(p.year), keywords: p.stack.join(' '), onSelect: nav('#/projects/' + p.slug) })),
    { group: 'Actions', label: 'Copy email', icon: 'copy', hint: 'ponomaleks@gmail.com', onSelect: () => { try { navigator.clipboard.writeText('ponomaleks@gmail.com'); } catch (e) {} onCopied('ponomaleks@gmail.com'); } },
    { group: 'Actions', label: 'Open CV (EN)', icon: 'file-down', onSelect: nav('#/cv') },
    { group: 'Actions', label: 'Open CV (NO)', icon: 'file-down', keywords: 'norsk', onSelect: nav('#/cv') },
    { group: 'Actions', label: theme === 'dag' ? 'Switch to dark theme' : 'Switch to light theme', icon: theme === 'dag' ? 'moon' : 'sun', keywords: 'theme dark light', onSelect: () => setT(theme === 'dag' ? 'natt' : 'dag') }
  ];
  const current = route.page === 'case' ? 'projects' : route.page;
  const Page = { home: window.Home, projects: window.Projects, case: window.CaseStudy, cv: window.Cv, contact: window.Contact, '404': window.Lost }[route.page];
  const heroCta = route.page === 'home' && !pastHero;

  return (
    <>
      <a className="fjord-visually-hidden" href="#main">Skip to content</a>
      {route.page === 'case' ? <ScrollProgress /> : null}
      <Header current={current} theme={theme} onThemeChange={setT} onOpenPalette={() => setPalette(true)} onOpenMenu={() => setMenu(true)}
        ctaHref="#/contact" ctaVariant={heroCta ? 'secondary' : 'primary'}
        links={[{ id: 'projects', label: 'Projects', href: '#/projects' }, { id: 'cv', label: 'CV', href: '#/cv' }, { id: 'contact', label: 'Contact', href: '#/contact' }]} />
      <main id="main" className="kit-main" data-page={route.page} key={route.page + (route.slug || '')}>
        <Page slug={route.slug} onCopied={onCopied} />
      </main>
      {route.page !== 'contact' && route.page !== '404' ? (
        <div className="kit-end"><CtaBand title="Good products are built together." body="If your team is hiring in the Oslo area, I’d like to hear about it." primary={{ label: 'Get in touch', href: '#/contact' }} secondary={{ label: 'View CV', href: '#/cv' }} /></div>
      ) : <div style={{ height: 96 }}></div>}
      <Footer />
      <MobileMenu open={menu} onClose={() => setMenu(false)} current={current} theme={theme} onThemeChange={setT}
        links={[{ id: 'projects', label: 'Projects', href: '#/projects' }, { id: 'cv', label: 'CV', href: '#/cv' }, { id: 'contact', label: 'Contact', href: '#/contact' }]} />
      <CommandPalette open={palette} onOpen={() => setPalette(true)} onClose={() => setPalette(false)} items={items} />
      {route.page !== 'contact' ? (
        <StickyActionBar><Button variant="secondary" href="#/cv">View CV</Button><Button href="#/contact">Get in touch</Button></StickyActionBar>
      ) : null}
      <ToastRegion toasts={toasts} onExpire={(id) => setToasts((x) => x.filter((t) => t.id !== id))} />
    </>
  );
}
window.App = App;
