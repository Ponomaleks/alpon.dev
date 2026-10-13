import * as React from 'react';

/** Mono micro-label on hover/focus for icon buttons and shortcuts. */
export interface TooltipProps {
  label: string;
  shortcut?: string;
  placement?: "top" | "bottom";
  open?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export declare function Tooltip(props: TooltipProps): React.JSX.Element | null;
