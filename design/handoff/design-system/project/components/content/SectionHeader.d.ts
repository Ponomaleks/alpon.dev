import * as React from 'react';

/** Numbered mono eyebrow ("01 / Projects") + heading + optional lead; starts every section. */
export interface SectionHeaderProps {
  index?: string;
  eyebrow?: string;
  title: React.ReactNode;
  lead?: string;
  size?: "sm" | "md" | "lg";
  as?: "h1" | "h2" | "h3";
  id?: string;
  className?: string;
}

export declare function SectionHeader(props: SectionHeaderProps): React.JSX.Element | null;
