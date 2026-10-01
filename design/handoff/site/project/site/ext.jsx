// alpon.dev · Fjord extensions (new components, documented in Overview › System additions)
const FJX = window.FjordDesignSystem_44c954;

const ThemeCtx = React.createContext('dag');
const useDark = () => React.useContext(ThemeCtx) === 'natt';

function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return false;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 88, behavior: reduce ? 'auto' : 'smooth' });
  el.setAttribute('tabindex', '-1'); el.focus({ preventScroll: true });
  return true;
}

// Mono key/value list used next to the intro and in the CV side column
function QuickFacts({ items }) {
  return <dl className="x-quick">{items.map((r) => <div key={r.k}><dt>{r.k}</dt><dd>{r.v}</dd></div>)}</dl>;
}

// Screenshot placeholder: a quiet wireframe in the brand's hairline language
function ShotPlaceholder({ kind = 'web', label }) {
  if (kind === 'api') return (
    <div className="x-shotph x-shotph--api" aria-hidden="true">
      <div className="x-shotph__code"><i style={{ width: '38%' }}></i><i style={{ width: '62%' }}></i><i style={{ width: '54%' }}></i><i style={{ width: '70%' }}></i><i style={{ width: '46%' }}></i><i style={{ width: '58%' }}></i></div>
      <span className="x-shotph__tag">{label || 'Screenshot · docs'}</span>
    </div>
  );
  return (
    <div className="x-shotph" aria-hidden="true">
      <div className="x-shotph__bar"><i></i><i></i><i></i></div>
      <div className="x-shotph__body"><div className="x-shotph__side"><i></i><i></i><i></i><i></i></div><div className="x-shotph__main"><b></b><div className="x-shotph__grid"><i></i><i></i><i></i><i></i><i></i><i></i></div></div></div>
      <span className="x-shotph__tag">{label || 'Screenshot · 1440 × 900'}</span>
    </div>
  );
}

// ProjectCard + hover cross-fade from generative terrain to screenshot (desktop, fine pointer only)
function ShotCard({ p, tone = 'spruce', variant = 'compact' }) {
  const { ProjectCard } = FJX;
  const ref = React.useRef(null);
  const [host, setHost] = React.useState(null);
  const dark = useDark();
  React.useLayoutEffect(() => { setHost(ref.current && ref.current.querySelector('.fj-pcard__media')); }, []);
  return (
    <div className="x-card" ref={ref}>
      <ProjectCard variant={variant} {...p} tone={dark ? 'auto' : tone} href={'#/projects/' + p.slug}
        liveHref={p.status !== 'archived' && p.type !== 'tool' ? '#live' : undefined} codeHref="#code" />
      {host ? ReactDOM.createPortal(<div className="x-shot"><ShotPlaceholder kind={p.type} /></div>, host) : null}
    </div>
  );
}

function SoonCard() {
  const { StatusBadge } = FJX;
  return (
    <article className="x-soon">
      <div className="x-soon__media"><span className="fjord-mono-small">Next waypoint</span></div>
      <div className="x-soon__body"><div className="x-soon__top"><StatusBadge status="progress">Coming soon</StatusBadge><span>2026</span></div>
        <h3>[Next project]</h3><p>Something I’m sketching now. The write-up lands here when there is code and a number to show.</p></div>
    </article>
  );
}

// Minimal browser frame for an embedded interactive preview
function BrowserFrame({ url, children, href = '#live' }) {
  const { Icon } = FJX;
  return (
    <div className="x-browser">
      <div className="x-browser__bar"><span className="x-browser__dots" aria-hidden="true"><i></i><i></i><i></i></span>
        <span className="x-browser__url"><Icon name="globe" size={14} />{url}</span>
        <a className="x-browser__open" href={href} target="_blank" rel="noopener">Open in new tab<Icon name="arrow-up-right" size={14} /></a></div>
      <div className="x-browser__view">{children}</div>
    </div>
  );
}

// Tiny working stand-in for the Project One app (book a slot)
function BookingDemo() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const slots = ['09:00', '10:30', '13:00', '14:30'];
  const [taken, setTaken] = React.useState({ 'Tue-10:30': 1, 'Thu-13:00': 1 });
  const [mine, setMine] = React.useState(null);
  return (
    <div className="x-demo">
      <div className="x-demo__head"><strong>Book a 30-min call</strong><span className="fjord-mono-small">Week 41 · Europe/Oslo</span></div>
      <div className="x-demo__grid" role="grid" aria-label="Available slots">
        {days.map((d) => <div key={d} className="x-demo__col" role="row"><span className="x-demo__day">{d}</span>
          {slots.map((s) => { const k = d + '-' + s, busy = taken[k], on = mine === k;
            return <button key={s} type="button" className={'x-demo__slot' + (on ? ' is-on' : '')} disabled={!!busy} aria-pressed={on} onClick={() => setMine(on ? null : k)}>{busy ? 'Taken' : s}</button>; })}
        </div>)}
      </div>
      <div className="x-demo__foot" aria-live="polite">{mine ? <span>Selected <b>{mine.replace('-', ' · ')}</b></span> : <span className="x-muted">Pick a slot</span>}
        <button type="button" className="x-demo__btn" disabled={!mine} onClick={() => { setTaken({ ...taken, [mine]: 1 }); setMine(null); }}>Confirm</button></div>
    </div>
  );
}

// Interactive request / response panel for API projects
const API_EX = [
  { id: 'dep', method: 'GET', path: '/v1/departures?stop=NSR:3990&limit=3', ms: 38, body: { stop: 'Jernbanetorget', updated: '2026-09-30T08:14:02Z', departures: [{ line: '17', to: 'Rikshospitalet', in_min: 2 }, { line: '31', to: 'Fornebu', in_min: 5 }, { line: 'T4', to: 'Vestli', in_min: 7 }] } },
  { id: 'stop', method: 'GET', path: '/v1/stops/NSR:3990', ms: 21, body: { id: 'NSR:3990', name: 'Jernbanetorget', lat: 59.9115, lon: 10.7496, modes: ['bus', 'tram', 'metro'] } },
  { id: 'err', method: 'GET', path: '/v1/stops/unknown', ms: 12, status: 404, body: { error: 'not_found', detail: 'No stop with id “unknown”.' } }
];
function ApiConsole({ base = 'https://api.alpon.dev', onCopied }) {
  const { Button, CopyButton, Icon } = FJX;
  const [sel, setSel] = React.useState(API_EX[0]);
  const [state, setState] = React.useState('idle');
  const send = () => { setState('loading'); setTimeout(() => setState('done'), matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 420); };
  const curl = `curl ${base}${sel.path}`;
  const json = JSON.stringify(sel.body, null, 2);
  return (
    <div className="x-api">
      <div className="x-api__req">
        <div className="x-api__eps" role="radiogroup" aria-label="Example requests">
          {API_EX.map((e) => <button key={e.id} type="button" role="radio" aria-checked={sel.id === e.id} onClick={() => { setSel(e); setState('idle'); }}><b>{e.method}</b>{e.path}</button>)}
        </div>
        <div className="x-api__curl"><code>{curl}</code><CopyButton value={curl} onCopied={onCopied} /></div>
        <div className="x-row x-api__row"><Button variant="secondary" icon="send" onClick={send} loading={state === 'loading'}>Send request</Button><span className="fjord-mono-small x-muted">Sandbox · sample data</span></div>
      </div>
      <div className="x-api__res" aria-live="polite">
        <div className="x-api__meta">{state === 'done' ? <><span className={'x-api__code' + (sel.status ? ' is-err' : '')}>{sel.status || 200} {sel.status ? 'Not Found' : 'OK'}</span><span>{sel.ms} ms</span><span>application/json</span></> : <span>Response</span>}</div>
        <pre className="x-api__body">{state === 'done' ? json : state === 'loading' ? '…' : '// Press “Send request”'}</pre>
      </div>
    </div>
  );
}

// Mobile / tablet version of TrailNav: thin progress line + section dropdown
function MobileTrail({ sections }) {
  const { Icon } = FJX;
  const [a, setA] = React.useState(0);
  const [p, setP] = React.useState(0);
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => {
    const on = () => {
      const els = sections.map((s) => document.getElementById(s.id)).filter(Boolean);
      if (!els.length) return;
      const mid = innerHeight * 0.35; let n = 0;
      els.forEach((el, i) => { if (el.getBoundingClientRect().top < mid) n = i; });
      const f = els[0].getBoundingClientRect().top + scrollY, l = els[els.length - 1].getBoundingClientRect().bottom + scrollY;
      setA(n); setP(Math.min(1, Math.max(0, (scrollY + mid - f) / (l - f))));
    };
    on(); addEventListener('scroll', on, { passive: true }); return () => removeEventListener('scroll', on);
  }, []);
  React.useEffect(() => { if (!open) return; const k = (e) => e.key === 'Escape' && setOpen(false); addEventListener('keydown', k); return () => removeEventListener('keydown', k); }, [open]);
  return (
    <div className="x-mtrail">
      <span className="x-mtrail__line" aria-hidden="true"><span style={{ transform: `scaleX(${p})` }}></span></span>
      <button type="button" className="x-mtrail__btn" aria-expanded={open} aria-controls="x-mtrail-list" onClick={() => setOpen(!open)}>
        <span className="fjord-mono-small x-muted">{String(a + 1).padStart(2, '0')} / {String(sections.length).padStart(2, '0')}</span><span>{sections[a].label}</span><Icon name="chevron-down" size={16} /></button>
      {open ? <ol id="x-mtrail-list" className="x-mtrail__list">{sections.map((s, i) => <li key={s.id}><button type="button" aria-current={i === a ? 'location' : undefined} onClick={() => { setOpen(false); scrollToId(s.id); }}><span>{String(i + 1).padStart(2, '0')}</span>{s.label}</button></li>)}</ol> : null}
    </div>
  );
}

// Back to top: appears after 1.5 viewports of scrolling; sits above the mobile action bar
function BackToTop() {
  const { IconButton } = FJX;
  const [on, setOn] = React.useState(false);
  React.useEffect(() => { const f = () => setOn(scrollY > innerHeight * 1.5); f(); addEventListener('scroll', f, { passive: true }); return () => removeEventListener('scroll', f); }, []);
  const up = () => { window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); const m = document.getElementById('main'); m && m.focus({ preventScroll: true }); };
  return <div className={'x-top' + (on ? ' is-on' : '')} aria-hidden={!on}><IconButton icon="arrow-up" label="Back to top" variant="secondary" onClick={up} tabIndex={on ? 0 : -1} /></div>;
}

Object.assign(window, { BackToTop, ThemeCtx, useDark, scrollToId, QuickFacts, ShotPlaceholder, ShotCard, SoonCard, BrowserFrame, BookingDemo, ApiConsole, MobileTrail });
