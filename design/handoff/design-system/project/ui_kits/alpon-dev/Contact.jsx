const NSK = window.FjordDesignSystem_44c954;

function Contact({ onCopied }) {
  const { Breadcrumbs, SectionHeader, ContactList, ContactForm, QrTile, AvailabilityBadge } = NSK;
  return (
    <>
      <section className="kit-page-head">
        <div className="kit-wrap">
          <Breadcrumbs items={[{ label: 'alpon.dev', href: '#/' }, { label: 'Contact' }]} />
          <SectionHeader as="h1" size="lg" index="04" eyebrow="Contact" title="Get in touch" lead="A role, a team, or a project you want to talk through. Email is fastest." />
          <AvailabilityBadge status="open" />
        </div>
      </section>
      <section className="kit-section" style={{ paddingTop: 56 }}>
        <div className="kit-wrap">
          <div className="kit-two">
            <ContactForm />
            <div className="kit-contact-side">
              <ContactList onCopied={onCopied} vcardHref="#" />
              <QrTile size={132} caption="Skann meg" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Lost() {
  const { NotFound, Button } = NSK;
  return <div className="kit-wrap"><NotFound path={location.hash.slice(1)} actions={<><Button href="#/" arrow>Back to start</Button><Button variant="secondary" href="#/projects">Projects</Button></>} /></div>;
}
window.Contact = Contact;
window.Lost = Lost;
