import * as React from 'react';

/** Action button; `primary` is the one solid CTA per screen, everything else is secondary or ghost. */
export interface ButtonProps {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  href?: string;
  external?: boolean;
  arrow?: boolean;
  icon?: string;
  iconEnd?: string;
  disabled?: boolean;
  loading?: boolean;
  block?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: (e: any) => void;
  className?: string;
  children?: React.ReactNode;
  [key: string]: any;
}

export declare function Button(props: ButtonProps): React.JSX.Element | null;
