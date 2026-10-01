import * as React from 'react';

/** Short floating confirmation ("Copied"); the only elevated element besides menus and sticky bars. */
export interface ToastProps {
  tone?: "success" | "error" | "info";
  message?: string;
  meta?: string;
  className?: string;
}

export declare function Toast(props: ToastProps): React.JSX.Element | null;
