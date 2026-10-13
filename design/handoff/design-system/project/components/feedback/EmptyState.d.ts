import * as React from 'react';

/** Dashed-hairline empty block with a corner contour; for empty filters or "blog coming soon". */
export interface EmptyStateProps {
  eyebrow?: string;
  title?: string;
  body?: string;
  action?: React.ReactNode;
  className?: string;
}

export declare function EmptyState(props: EmptyStateProps): React.JSX.Element | null;
