import * as React from 'react';

/** Small pill with status dot stating job-search status, e.g. "Open to work · Oslo area". */
export interface AvailabilityBadgeProps {
  status?: "open" | "talking" | "employed";
  label?: string;
  detail?: string | null;
  className?: string;
}

export declare function AvailabilityBadge(props: AvailabilityBadgeProps): React.JSX.Element | null;
