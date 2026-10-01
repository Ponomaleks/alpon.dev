import * as React from 'react';

/** Full-screen mobile menu sheet on spruce with contours, numbered links, contacts, theme toggle and the CTA. */
export interface MobileMenuProps {
  open?: boolean;
  onClose?: () => void;
  current?: string;
  links?: { id: string;
  label: string;
  href: string }[];
  theme?: "dag" | "natt";
  onThemeChange?: (t: string) => void;
  inline?: boolean;
  email?: string;
  phone?: string;
}

export declare function MobileMenu(props: MobileMenuProps): React.JSX.Element | null;
