import * as React from 'react';

/** Small mono copy button that flips to "Copied"; pair with a Toast via onCopied. */
export interface CopyButtonProps {
  value: string;
  label?: string;
  done?: string;
  onCopied?: (v: string) => void;
  className?: string;
}

export declare function CopyButton(props: CopyButtonProps): React.JSX.Element | null;
