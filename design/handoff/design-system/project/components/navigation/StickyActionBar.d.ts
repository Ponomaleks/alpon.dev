import * as React from 'react';

/** Mobile bottom bar with two actions; hides on scroll down, returns on scroll up. */
export interface StickyActionBarProps {
  children?: React.ReactNode;
  visible?: boolean;
  inline?: boolean;
  scrollRoot?: HTMLElement;
  threshold?: number;
  className?: string;
}

export declare function StickyActionBar(props: StickyActionBarProps): React.JSX.Element | null;
