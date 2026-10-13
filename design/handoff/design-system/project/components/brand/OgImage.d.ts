import * as React from 'react';

/** 1200×630 Open Graph image template: title, subtitle, contour motif, "alpon.dev" in mono. */
export interface OgImageProps {
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  seed?: string;
  meta?: string;
  theme?: "spruce" | "stone";
}

export declare function OgImage(props: OgImageProps): React.JSX.Element | null;
