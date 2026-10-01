import React from 'react';

export function Footer({ email = 'ponomaleks@gmail.com', phone = '+47 405 94 584', linkedin = 'linkedin.com/in/ponomalex', github = 'github.com/ponomaleks', updated = '2026-09-30', year = 2026, className = '' }) {
  return (
    <footer className={'fj-footer ' + className}>
      <div className="fj-footer__in">
        <p className="fj-footer__slogan">Good products <span>are built together.</span></p>
        <div className="fj-footer__col">
          <span className="fj-footer__label">Contact</span>
          <a href={'mailto:' + email}>{email}</a>
          <a href={'tel:' + phone.replace(/\s/g, '')}>{phone}</a>
        </div>
        <div className="fj-footer__col">
          <span className="fj-footer__label">Elsewhere</span>
          <a href={'https://' + linkedin}>{linkedin}</a>
          <a href={'https://' + github}>{github}</a>
        </div>
        <div className="fj-footer__col">
          <span className="fj-footer__label">Based in</span>
          <span lang="no">Oslo, Norge</span>
          <span>59.91° N, 10.75° E</span>
        </div>
        <div className="fj-footer__base">
          <span>© {year} Alexander Ponomarenko</span>
          <span>Last updated <time dateTime={updated}>{updated}</time></span>
        </div>
      </div>
    </footer>
  );
}
