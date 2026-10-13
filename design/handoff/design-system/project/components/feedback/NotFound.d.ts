import * as React from 'react';

/** 404 block "Page not found" — off-the-map copy, contour motif, a way back. */
export interface NotFoundProps {
  title?: string;
  body?: string;
  path?: string;
  actions?: React.ReactNode;
  className?: string;
}

export declare function NotFound(props: NotFoundProps): React.JSX.Element | null;
