import * as React from 'react';

/** Links: inline (underlined in prose), standalone (arrow, underline draws in), external (↗, new tab). */
export interface TextLinkProps {
  href?: string;
  variant?: "inline" | "standalone" | "external";
  mono?: boolean;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
  [key: string]: any;
}

export declare function TextLink(props: TextLinkProps): React.JSX.Element | null;
