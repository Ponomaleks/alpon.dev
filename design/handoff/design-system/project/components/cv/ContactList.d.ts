import * as React from 'react';

/** Contact block: email (copy), phone, LinkedIn, GitHub, "Oslo, Norge" and a vCard download. */
export interface ContactListProps {
  email?: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  location?: string;
  vcardHref?: string | null;
  onCopied?: (v: string) => void;
  className?: string;
}

export declare function ContactList(props: ContactListProps): React.JSX.Element | null;
