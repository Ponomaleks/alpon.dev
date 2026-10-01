import * as React from 'react';

/** Project status: Live / In progress / Archived — outline pill, shape-coded dot so colour is not the only signal. */
export interface StatusBadgeProps {
  status?: "live" | "progress" | "archived";
  children?: React.ReactNode;
  className?: string;
}

export declare function StatusBadge(props: StatusBadgeProps): React.JSX.Element | null;
