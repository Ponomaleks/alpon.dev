import * as React from 'react';

/**
 * Full-width spruce block with contours, one heading, one primary + one secondary action; ends every page.
 */
export interface CtaBandProps {
  title?: string;
  body?: string;
  primary?: { label: string;
  href?: string;
  onClick?: () => void } | null;
  secondary?: { label: string;
  href?: string;
  onClick?: () => void } | null;
  compact?: boolean;
  ambient?: boolean;
  className?: string;
}

export declare function CtaBand(props: CtaBandProps): React.JSX.Element | null;
