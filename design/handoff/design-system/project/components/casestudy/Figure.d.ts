import * as React from 'react';

/** Screenshot in a plain frame (1px, radius 8) with numbered caption; falls back to a terrain. */
export interface FigureProps {
  src?: string;
  alt?: string;
  caption?: string;
  index?: string;
  seed?: string;
  ratio?: string;
  className?: string;
}

export declare function Figure(props: FigureProps): React.JSX.Element | null;
