// src/components/Icon.tsx
import type { CSSProperties } from 'react';
import { ICONS, type IconName } from '../lib/icons';

interface Props {
  name: IconName;
  size?: number;
  filled?: boolean;
  className?: string;
  style?: CSSProperties;
}

export default function Icon({ name, size = 16, filled = false, className, style }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      style={{ flexShrink: 0, ...style }}
      dangerouslySetInnerHTML={{ __html: ICONS[name] }}
    />
  );
}
