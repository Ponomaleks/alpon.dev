import React from 'react';
import { CopyButton } from './CopyButton.jsx';
import { Button } from '../actions/Button.jsx';

export function ContactList({ email = 'ponomaleks@gmail.com', phone = '+47 405 94 584', linkedin = 'linkedin.com/in/ponomalex', github = 'github.com/ponomaleks', location = 'Oslo, Norge', vcardHref = '/alexander-ponomarenko.vcf', onCopied, className = '' }) {
  const rows = [
    { k: 'Email', v: email, href: 'mailto:' + email, copy: true },
    { k: 'Phone', v: phone, href: 'tel:' + phone.replace(/\s/g, '') },
    { k: 'LinkedIn', v: linkedin, href: 'https://www.' + linkedin },
    { k: 'GitHub', v: github, href: 'https://' + github },
    { k: 'Based in', v: location, lang: 'no' },
  ];
  return (
    <div className={className}>
      <ul className="fj-contacts">
        {rows.map((r) => (
          <li key={r.k}>
            <span className="fj-contacts__k">{r.k}</span>
            {r.href ? <a className="fj-contacts__v" href={r.href}>{r.v}</a> : <span className="fj-contacts__v" lang={r.lang}>{r.v}</span>}
            {r.copy ? <CopyButton value={r.v} onCopied={onCopied} /> : <span></span>}
          </li>
        ))}
      </ul>
      {vcardHref ? (
        <div className="fj-contact-actions">
          <Button variant="secondary" href={vcardHref} icon="user-plus" download>Save contact (.vcf)</Button>
        </div>
      ) : null}
    </div>
  );
}
