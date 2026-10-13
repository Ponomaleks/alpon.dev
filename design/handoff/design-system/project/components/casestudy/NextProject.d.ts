import * as React from 'react';

/** "Next project" link block at the end of a case study, with the next project’s terrain. */
export interface NextProjectProps {
  title: string;
  summary?: string;
  href?: string;
  slug?: string;
  image?: string;
  label?: string;
  className?: string;
}

export declare function NextProject(props: NextProjectProps): React.JSX.Element | null;
