const NSH = window.FjordDesignSystem_44c954;

function Home({ go, onCopied }) {
  const { Contours, Portrait, AvailabilityBadge, Button, StatRow, SectionHeader, ProjectCard, TextLink, ContactList, QrTile, ContactForm, Eyebrow } = NSH;
  const D = window.FJ_DATA, P = D.person;
  const [featured, ...rest] = D.projects.filter((p) => p.status !== 'archived');
  return (
    <>
      <section className="kit-hero" id="hero">
        <Contours shape="corner" anchor="top-right" scale={1.25} ambient parallax />
        <div className="kit-wrap">
          <div className="kit-hero__text">
            <Eyebrow><span lang="no">Hei</span> · {P.coords}</Eyebrow>
            <h1>Alexander<br />Ponomarenko</h1>
            <div className="kit-hero__role"><span>{P.role}</span><span>{P.role2}</span></div>
            <p className="kit-hero__lead">I build calm, fast web products end to end, from database to the last pixel. Looking for a team in the Oslo area.</p>
            <AvailabilityBadge status="open" />
            <div className="kit-hero__actions">
              <Button size="lg" href="#/contact" arrow>Get in touch</Button>
              <Button size="lg" variant="secondary" href="#/cv" icon="file-text">View CV</Button>
            </div>
          </div>
          <div className="kit-hero__media"><Portrait src="../../assets/photo/portrait.png" width={300} /></div>
        </div>
      </section>

      <section className="kit-section" aria-labelledby="facts">
        <div className="kit-wrap">
          <SectionHeader index="01" eyebrow="Facts" title="In short" id="facts" size="sm" />
          <StatRow items={D.facts} />
        </div>
      </section>

      <section className="kit-section" aria-labelledby="projects">
        <div className="kit-wrap">
          <div className="kit-row kit-row--between" style={{ alignItems: 'flex-end' }}>
            <SectionHeader index="02" eyebrow="Projects" title="Live work, with numbers" id="projects" lead="Each project is in production, has public code and a short write-up." />
            <TextLink variant="standalone" href="#/projects">All projects</TextLink>
          </div>
          <ProjectCard variant="featured" {...featured} href={'#/projects/' + featured.slug} liveHref="#" codeHref="#" />
          <div className="kit-projects kit-projects--grid">
            {rest.slice(0, 2).map((p, i) => <ProjectCard key={p.slug} {...p} tone={i % 2 ? 'spruce' : 'stone'} href={'#/projects/' + p.slug} liveHref={p.status === 'live' ? '#' : undefined} codeHref="#" />)}
          </div>
        </div>
      </section>

      <section className="kit-section" aria-labelledby="contact">
        <div className="kit-wrap">
          <SectionHeader index="03" eyebrow="Contact" title="Get in touch" id="contact" lead="Email is fastest. Phone and LinkedIn work too." />
          <div className="kit-two">
            <ContactList onCopied={onCopied} vcardHref="#" />
            <div className="kit-contact-side">
              <QrTile size={148} caption="Skann meg · alpon.dev" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
window.Home = Home;
