import Link from 'next/link';
import { STATS } from '@/lib/questions';

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-app">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-muted sm:flex-row sm:px-6">
        <p>
          iOS QA — {STATS.total} interview questions. Progress saved locally in your browser.
        </p>
        <div className="flex items-center gap-4">
          <Link href="/browse" className="hover:text-[var(--text)]">Browse</Link>
          <Link href="/quiz" className="hover:text-[var(--text)]">Quiz</Link>
          <Link href="/contribute" className="hover:text-[var(--text)]">Contribute</Link>
        </div>
      </div>
    </footer>
  );
}
