import * as React from 'react';

/** Site footer: slogan, contacts in mono, "Oslo, Norge", coordinates, "Last updated" date. */
export interface FooterProps {
  email?: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  updated?: string;
  year?: number;
  className?: string;
}

export declare function Footer(props: FooterProps): React.JSX.Element | null;
