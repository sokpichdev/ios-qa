'use client';

import { useCallback, useEffect, useState } from 'react';
import type { ProgressMap, ProgressEntry, SelfRating } from '@/lib/types';

const KEY = 'ios-qa-progress';

function read(): ProgressMap {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}');
  } catch {
    return {};
  }
}

// Module-level listeners so multiple components stay in sync within a tab.
const listeners = new Set<(p: ProgressMap) => void>();
function broadcast(p: ProgressMap) {
  listeners.forEach((fn) => fn(p));
}

export function useProgress() {
  const [progress, setProgress] = useState<ProgressMap>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setProgress(read());
    setHydrated(true);
    const fn = (p: ProgressMap) => setProgress(p);
    listeners.add(fn);
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) setProgress(read());
    };
    window.addEventListener('storage', onStorage);
    return () => {
      listeners.delete(fn);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const persist = useCallback((next: ProgressMap) => {
    localStorage.setItem(KEY, JSON.stringify(next));
    broadcast(next);
  }, []);

  const recordMcq = useCallback(
    (id: string, correct: boolean) => {
      const next = { ...read(), [id]: { answered: true, correct, answeredAt: Date.now() } as ProgressEntry };
      persist(next);
    },
    [persist]
  );

  const recordOpen = useCallback(
    (id: string, selfRating: SelfRating) => {
      const next = { ...read(), [id]: { answered: true, selfRating, answeredAt: Date.now() } as ProgressEntry };
      persist(next);
    },
    [persist]
  );

  const reset = useCallback(() => {
    persist({});
  }, [persist]);

  return { progress, hydrated, recordMcq, recordOpen, reset };
}
