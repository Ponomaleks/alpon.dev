import * as React from 'react';

/** The brand QR for https://alpon.dev on a stone plate (radius 6% of width, round dots, rounded finders). */
export interface QrTileProps {
  size?: number | string;
  caption?: string;
  label?: string;
  className?: string;
  style?: React.CSSProperties;
}

export declare function QrTile(props: QrTileProps): React.JSX.Element | null;
