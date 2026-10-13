import * as React from 'react';

/** Expandable CV timeline entry: period, role, company; expands to summary, points and stack. */
export interface ExperienceItemProps {
  role: string;
  org: string;
  period: string;
  location?: string;
  summary?: string;
  points?: string[];
  stack?: string[];
  current?: boolean;
  defaultOpen?: boolean;
  className?: string;
}

export declare function ExperienceItem(props: ExperienceItemProps): React.JSX.Element | null;
