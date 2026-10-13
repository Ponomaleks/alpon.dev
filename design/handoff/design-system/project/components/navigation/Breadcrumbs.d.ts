import * as React from 'react';

/** Mono slash-separated breadcrumbs for case studies and posts. */
export interface BreadcrumbsProps {
  items: { label: string;
  href?: string }[];
  className?: string;
}

export declare function Breadcrumbs(props: BreadcrumbsProps): React.JSX.Element | null;
