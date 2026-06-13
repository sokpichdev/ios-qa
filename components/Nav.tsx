'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import Icon, { type IconName } from './Icon';
import ThemeToggle from './ThemeToggle';

const LINKS: { href: string; label: string; icon: IconName }[] = [
  { href: '/', label: 'Home', icon: 'home' },
  { href: '/browse', label: 'Browse', icon: 'list' },
  { href: '/quiz', label: 'Quiz', icon: 'play' },
  { href: '/progress', label: 'Progress', icon: 'bar-chart' },
  { href: '/spin', label: 'Spin', icon: 'shuffle' },
  { href: '/bookmarks', label: 'Bookmarks', icon: 'bookmark' },
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-app bg-[var(--bg)]/70 backdrop-blur-xl">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 text-white">
            <Icon name="sparkles" size={15} />
          </span>
          <span className="heading-gradient text-base tracking-tight">iOS QA</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                isActive(l.href) ? 'text-[var(--text)]' : 'text-muted hover:text-[var(--text)]'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setOpen((o) => !o)}
            className="glass grid h-9 w-9 place-items-center rounded-lg md:hidden"
          >
            <Icon name={open ? 'x' : 'menu'} size={17} />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-app md:hidden">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-1 px-4 py-3">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
                  isActive(l.href) ? 'chip-active' : 'text-muted'
                }`}
              >
                <Icon name={l.icon} size={16} />
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
