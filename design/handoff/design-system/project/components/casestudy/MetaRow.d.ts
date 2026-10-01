import * as React from 'react';

/** Case-study meta row: Role, Year, Stack, Status as a definition list. */
export interface MetaRowProps {
  items: { label: string;
  value: React.ReactNode }[];
  className?: string;
}

export declare function MetaRow(props: MetaRowProps): React.JSX.Element | null;
