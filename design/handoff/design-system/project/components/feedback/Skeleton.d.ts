import * as React from 'react';

/** Quiet loading placeholder (slow opacity breathe, static under reduced motion). */
export interface SkeletonProps {
  variant?: "text" | "block";
  width?: number | string;
  height?: number | string;
  lines?: number;
  className?: string;
  style?: React.CSSProperties;
}

export declare function Skeleton(props: SkeletonProps): React.JSX.Element | null;
