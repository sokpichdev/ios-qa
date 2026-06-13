'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import Icon from './Icon';

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      aria-label="Toggle color theme"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="glass grid h-9 w-9 place-items-center rounded-lg glass-hover"
    >
      {mounted ? (
        <Icon name={isDark ? 'sun' : 'moon'} size={17} />
      ) : (
        <span className="h-[17px] w-[17px]" />
      )}
    </button>
  );
}
