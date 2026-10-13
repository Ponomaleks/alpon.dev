import * as React from 'react';

/** Architecture diagram style: labelled columns of hairline nodes joined by arrows on a faint dot grid. */
export interface ArchDiagramProps {
  columns: { label: string;
  nodes: { title: string;
  note?: string;
  accent?: boolean }[] }[];
  label?: string;
  className?: string;
}

export declare function ArchDiagram(props: ArchDiagramProps): React.JSX.Element | null;
