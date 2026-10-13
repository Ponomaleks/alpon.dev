import * as React from 'react';

/** Square 44px icon-only button (menu, close, theme); `label` is required for screen readers. */
export interface IconButtonProps {
  icon: string;
  label: string;
  variant?: "ghost" | "secondary";
  size?: "sm" | "md";
  disabled?: boolean;
  onClick?: (e: any) => void;
  className?: string;
  [key: string]: any;
}

export declare function IconButton(props: IconButtonProps): React.JSX.Element | null;
