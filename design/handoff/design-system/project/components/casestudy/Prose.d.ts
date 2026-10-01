import * as React from 'react';

/** Article typography wrapper for blog posts and long case-study text (headings, lists, quotes, code, figures). */
export interface ProseProps {
  children?: React.ReactNode;
  className?: string;
}

export declare function Prose(props: ProseProps): React.JSX.Element | null;
