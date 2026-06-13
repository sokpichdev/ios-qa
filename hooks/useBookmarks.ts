'use client';

import { useCallback, useEffect, useState } from 'react';

const KEY = 'ios-qa-bookmarks';

function read(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

const listeners = new Set<(b: string[]) => void>();
function broadcast(b: string[]) {
  listeners.forEach((fn) => fn(b));
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setBookmarks(read());
    setHydrated(true);
    const fn = (b: string[]) => setBookmarks(b);
    listeners.add(fn);
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) setBookmarks(read());
    };
    window.addEventListener('storage', onStorage);
    return () => {
      listeners.delete(fn);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const toggle = useCallback((id: string) => {
    const current = read();
    const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
    localStorage.setItem(KEY, JSON.stringify(next));
    broadcast(next);
  }, []);

  const isBookmarked = useCallback((id: string) => bookmarks.includes(id), [bookmarks]);

  return { bookmarks, hydrated, toggle, isBookmarked };
}
