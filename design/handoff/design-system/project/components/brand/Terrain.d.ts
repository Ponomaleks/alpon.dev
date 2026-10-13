import * as React from 'react';

/** Deterministic generative contour map from a seed (e.g. project slug); the placeholder whenever a project has no screenshot. */
export interface TerrainProps {
  seed?: string;
  tone?: "spruce" | "stone" | "auto";
  levels?: number;
  aspect?: string;
  ambient?: boolean;
  label?: string;
  className?: string;
  style?: React.CSSProperties;
}

export declare function Terrain(props: TerrainProps): React.JSX.Element | null;
