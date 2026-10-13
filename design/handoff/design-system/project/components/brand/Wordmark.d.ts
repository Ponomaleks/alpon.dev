import * as React from 'react';

/** "alpon.dev" set in JetBrains Mono 500 — the only brand mark; there is no logo glyph. */
export interface WordmarkProps {
  href?: string | null;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export declare function Wordmark(props: WordmarkProps): React.JSX.Element | null;
