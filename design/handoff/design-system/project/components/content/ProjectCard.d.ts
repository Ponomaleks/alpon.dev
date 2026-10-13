import * as React from 'react';

/**
 * Project card with screenshot or seeded terrain, status, one-line summary, one key result, stack, Live/Code links.
 */
export interface ProjectCardProps {
  variant?: "featured" | "compact";
  title: string;
  slug?: string;
  summary?: string;
  result?: { value: string;
  label: string };
  stack?: string[];
  status?: "live" | "progress" | "archived";
  year?: string | number;
  image?: string;
  imageAlt?: string;
  href?: string;
  liveHref?: string;
  codeHref?: string;
  tone?: "spruce" | "stone" | "auto";
  className?: string;
}

export declare function ProjectCard(props: ProjectCardProps): React.JSX.Element | null;
