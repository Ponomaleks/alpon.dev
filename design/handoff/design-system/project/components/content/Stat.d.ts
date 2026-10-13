import * as React from 'react';

/** One honest number + short label + source line ("4 yrs · EPAM Systems"). Counts up once in view. */
export interface StatProps {
  value: number | string;
  prefix?: string;
  suffix?: string;
  unit?: string;
  label?: string;
  context?: string;
  decimals?: number;
  countUp?: boolean;
  duration?: number;
  as?: string;
  className?: string;
}

export declare function Stat(props: StatProps): React.JSX.Element | null;
