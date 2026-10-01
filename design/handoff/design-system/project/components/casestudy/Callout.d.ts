import * as React from 'react';

/** Soft-tinted aside with a mono label for a key decision or lesson inside a case study. */
export interface CalloutProps {
  label?: string;
  icon?: string;
  tone?: "note" | "warning" | "plain";
  children?: React.ReactNode;
  className?: string;
}

export declare function Callout(props: CalloutProps): React.JSX.Element | null;
