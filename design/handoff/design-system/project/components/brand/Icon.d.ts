import * as React from 'react';

/** Lucide-derived line icon at 1.5px stroke; use for UI affordances only, never as decoration or emoji substitutes. */
export interface IconProps {
  name: string;
  size?: 16 | 20 | 24 | number;
  strokeWidth?: number;
  label?: string;
  className?: string;
  style?: React.CSSProperties;
}

export declare function Icon(props: IconProps): React.JSX.Element | null;
