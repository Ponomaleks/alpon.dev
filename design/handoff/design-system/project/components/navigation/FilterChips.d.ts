import * as React from 'react';

/** Pill toggle chips to filter the project list. */
export interface FilterChipsProps {
  options: (string | { value: string;
  label: string;
  count?: number;
  disabled?: boolean })[];
  selected?: string[];
  onChange?: (v: string[]) => void;
  label?: string;
  multi?: boolean;
  className?: string;
}

export declare function FilterChips(props: FilterChipsProps): React.JSX.Element | null;
