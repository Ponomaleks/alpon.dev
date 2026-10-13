import * as React from 'react';

/** The signature contour ring group from the business card, cropped by its (position:relative) container; one per composition, never centred. */
export interface ContoursProps {
  shape?: "ridge" | "corner";
  anchor?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  tone?: "auto" | "spruce" | "stone";
  scale?: number;
  ambient?: boolean;
  parallax?: boolean;
  strokeWidth?: number;
  className?: string;
  style?: React.CSSProperties;
}

export declare function Contours(props: ContoursProps): React.JSX.Element | null;
