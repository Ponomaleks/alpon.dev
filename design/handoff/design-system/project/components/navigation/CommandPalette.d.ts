import * as React from 'react';

/** Ctrl/Cmd+K palette: go to pages/projects, copy email, open CV EN/NO, toggle theme. */
export interface CommandPaletteProps {
  open?: boolean;
  onClose?: () => void;
  onOpen?: () => void;
  items?: { id?: string;
  group?: string;
  label: string;
  icon?: string;
  hint?: string;
  keywords?: string;
  onSelect?: () => void }[];
  placeholder?: string;
  inline?: boolean;
  hotkey?: boolean;
}

export declare function CommandPalette(props: CommandPaletteProps): React.JSX.Element | null;
