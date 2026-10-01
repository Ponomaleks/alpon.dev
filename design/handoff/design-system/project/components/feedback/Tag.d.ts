import * as React from 'react';

/** Text-only mono tech tag (no logos). Use TagList for a stack. */
export interface TagProps {
  children?: React.ReactNode;
  className?: string;
}

export declare function Tag(props: TagProps): React.JSX.Element | null;
