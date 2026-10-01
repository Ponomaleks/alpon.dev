import * as React from 'react';

/** Pill radiogroup for 2–3 mutually exclusive options: EN / NO on the CV, Light / Dark theme. */
export interface SegmentedControlProps {
  options: (string | { value: string;
  label: string;
  lang?: string })[];
  value?: string;
  onChange?: (v: string) => void;
  label?: string;
  size?: "md" | "lg";
  disabled?: boolean;
  className?: string;
}

export declare function SegmentedControl(props: SegmentedControlProps): React.JSX.Element | null;
