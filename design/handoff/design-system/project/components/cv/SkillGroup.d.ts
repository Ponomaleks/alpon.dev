import * as React from 'react';

/** Skills as a plain comma-separated text list under a mono heading. Never bars, percentages or logos. */
export interface SkillGroupProps {
  title: string;
  items: string[];
  className?: string;
}

export declare function SkillGroup(props: SkillGroupProps): React.JSX.Element | null;
