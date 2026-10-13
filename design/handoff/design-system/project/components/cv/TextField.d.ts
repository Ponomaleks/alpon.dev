import * as React from 'react';

/** Labelled input / textarea with hint and error text; 44px min height, 16px text (no iOS zoom). */
export interface TextFieldProps {
  label: string;
  hint?: string;
  error?: string;
  multiline?: boolean;
  optional?: boolean;
  id?: string;
  className?: string;
  [key: string]: any;
}

export declare function TextField(props: TextFieldProps): React.JSX.Element | null;
