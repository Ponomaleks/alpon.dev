import React from 'react';
import { Terrain } from '../brand/Terrain.jsx';
import { StatusBadge } from '../feedback/StatusBadge.jsx';
import { TagList } from '../feedback/Tag.jsx';
import { TextLink } from '../actions/TextLink.jsx';

export function ProjectCard({ variant = 'compact', title, slug, summary, result, stack = [], status = 'live', year, image, imageAlt = '', href = '#', liveHref, codeHref, tone = 'spruce', className = '' }) {
  return (
    <article className={`fj-pcard fj-pcard--${variant} ${className}`} style={{ viewTransitionName: slug ? 'project-' + slug : undefined }}>
      <div className="fj-media fj-pcard__media">
        {image ? <img src={image} alt={imageAlt} loading="lazy" decoding="async" /> : <Terrain seed={slug || title} tone={tone} aspect="auto" label={slug} />}
      </div>
      <div className="fj-pcard__body">
        <div className="fj-pcard__top"><StatusBadge status={status} />{year ? <span>{year}</span> : null}</div>
        <h3 className="fj-pcard__title"><a href={href}>{title}</a></h3>
        {summary ? <p className="fj-pcard__summary">{summary}</p> : null}
        {result ? <div className="fj-pcard__result"><strong>{result.value}</strong><span>{result.label}</span></div> : null}
        {stack.length ? <TagList items={stack} plain={variant === 'featured'} /> : null}
        {(liveHref || codeHref) ? (
          <div className="fj-pcard__links">
            {liveHref ? <TextLink variant="external" href={liveHref}>Live</TextLink> : null}
            {codeHref ? <TextLink variant="external" href={codeHref}>Code</TextLink> : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}
