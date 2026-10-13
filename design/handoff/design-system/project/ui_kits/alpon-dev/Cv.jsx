const NSV = window.FjordDesignSystem_44c954;

const CV_T = {
  en: { title: 'CV', lead: 'Software Engineer · Full Stack Developer. Based in the Oslo area.', xp: 'Experience', skills: 'Skills', langs: 'Languages', dl: 'Download PDF', open: 'Open PDF', meta: 'PDF · 2 pages · A4' },
  no: { title: 'CV', lead: 'Programvareutvikler · Fullstack-utvikler. Bor i Oslo-området.', xp: 'Erfaring', skills: 'Ferdigheter', langs: 'Språk', dl: 'Last ned PDF', open: 'Åpne PDF', meta: 'PDF · 2 sider · A4' }
};

function Cv() {
  const { Breadcrumbs, SectionHeader, SegmentedControl, Button, ExperienceList, ExperienceItem, SkillGroup, LanguageList } = NSV;
  const D = window.FJ_DATA;
  const [lang, setLang] = React.useState('en');
  const t = CV_T[lang];
  return (
    <div lang={lang === 'no' ? 'no' : 'en'}>
      <section className="kit-page-head">
        <div className="kit-wrap">
          <Breadcrumbs items={[{ label: 'alpon.dev', href: '#/' }, { label: 'CV' }]} />
          <SectionHeader as="h1" size="lg" eyebrow={lang === 'no' ? 'Norsk' : 'English'} title={t.title} lead={t.lead} />
          <div className="kit-row kit-row--between">
            <SegmentedControl size="lg" label="CV language" value={lang} onChange={setLang} options={[{ value: 'en', label: 'EN' }, { value: 'no', label: 'NO', lang: 'no' }]} />
            <div className="kit-row">
              <Button variant="ghost" href="#" icon="eye">{t.open}</Button>
              <Button variant="secondary" href="#" icon="file-down">{t.dl}</Button>
              <span className="fjord-mono-small" style={{ color: 'var(--fjord-color-text-muted)' }}>{t.meta}</span>
            </div>
          </div>
        </div>
      </section>
      <section className="kit-section" style={{ paddingTop: 56 }}>
        <div className="kit-wrap">
          <div className="kit-two">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <SectionHeader index="01" title={t.xp} size="sm" />
              <ExperienceList>
                {D.experience.map((x, i) => <ExperienceItem key={i} role={x.role} org={x.org} period={x.period} location={x.location} current={x.current} defaultOpen={i === 0} summary={x.summary[lang]} points={x.points[lang]} stack={x.stack} />)}
              </ExperienceList>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              <SectionHeader index="02" title={t.skills} size="sm" />
              {D.skills.map((s) => <SkillGroup key={s.title.en} title={s.title[lang]} items={s.items} />)}
              <SectionHeader index="03" title={t.langs} size="sm" />
              <LanguageList items={D.languages[lang]} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
window.Cv = Cv;
