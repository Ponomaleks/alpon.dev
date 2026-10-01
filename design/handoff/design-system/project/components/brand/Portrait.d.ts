import * as React from 'react';

/** Calm portrait in a hairline frame with a contour group overlapping behind it; optional use, works in both themes. */
export interface PortraitProps {
  src?: string;
  alt?: string;
  width?: number | string;
  ratio?: string;
  contours?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export declare function Portrait(props: PortraitProps): React.JSX.Element | null;
