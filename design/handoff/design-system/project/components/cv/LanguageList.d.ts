import * as React from 'react';

/** Spoken languages with plain descriptive levels (Native / Professional working / Learning). No CEFR codes. */
export interface LanguageListProps {
  items: { name: string;
  level: string;
  note?: string;
  lang?: string }[];
  className?: string;
}

export declare function LanguageList(props: LanguageListProps): React.JSX.Element | null;
