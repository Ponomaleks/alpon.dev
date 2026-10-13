import * as React from 'react';

/**
 * Sticky site header: mono wordmark, Projects / CV / Contact, ⌘K hint, Light/Dark toggle, persistent "Get in touch" CTA.
 */
export interface HeaderProps {
  current?: "projects" | "cv" | "contact" | string;
  links?: { id: string;
  label: string;
  href: string }[];
  theme?: "dag" | "natt";
  onThemeChange?: (t: string) => void;
  onOpenPalette?: () => void;
  onOpenMenu?: () => void;
  ctaHref?: string;
  /** "secondary" while a hero primary CTA is on screen, so only one solid button shows. */
  ctaVariant?: "primary" | "secondary";
  compact?: boolean;
  className?: string;
}

export declare function Header(props: HeaderProps): React.JSX.Element | null;
