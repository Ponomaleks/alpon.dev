import React from 'react';
import { iconData } from './iconData.js';

export function Icon({ name, size = 20, strokeWidth = 1.5, label, className = '', style }) {
  const d = iconData[name];
  if (!d) return null;
  return (
    <svg className={'fj-icon ' + className} width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
      role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}
      style={style} dangerouslySetInnerHTML={{ __html: d }} />
  );
}
export const iconNames = Object.keys(iconData);
