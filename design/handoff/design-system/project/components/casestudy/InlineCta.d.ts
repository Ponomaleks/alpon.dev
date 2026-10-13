import * as React from 'react';

/** Quiet inline CTA mid-case-study: "Want something like this? Let’s talk." with a secondary button. */
export interface InlineCtaProps {
  title?: string;
  body?: string;
  action?: string;
  href?: string;
  className?: string;
}

export declare function InlineCta(props: InlineCtaProps): React.JSX.Element | null;
