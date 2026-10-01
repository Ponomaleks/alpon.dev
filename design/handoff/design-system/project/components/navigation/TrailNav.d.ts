import * as React from 'react';

/** Vertical case-study "trail": a hairline with waypoints that fills while you scroll. */
export interface TrailNavProps {
  sections: { id: string;
  label: string }[];
  active?: number;
  progress?: number;
  label?: string;
  className?: string;
}

export declare function TrailNav(props: TrailNavProps): React.JSX.Element | null;
