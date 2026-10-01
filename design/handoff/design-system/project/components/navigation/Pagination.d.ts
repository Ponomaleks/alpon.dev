import * as React from 'react';

/** Previous / next links with titles, for posts and case studies. */
export interface PaginationProps {
  prev?: { href: string;
  title: string;
  label?: string };
  next?: { href: string;
  title: string;
  label?: string };
  className?: string;
}

export declare function Pagination(props: PaginationProps): React.JSX.Element | null;
