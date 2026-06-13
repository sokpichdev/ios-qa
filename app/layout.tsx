import type { Metadata } from 'next';
import { Sora, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import AuroraBackground from '@/components/AuroraBackground';

const sora = Sora({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' });

export const metadata: Metadata = {
  title: 'iOS QA — Developer Interview Prep',
  description:
    'Browse, filter, and quiz yourself on iOS developer interview questions across Swift, SwiftUI, Concurrency, Architecture and more. Track your progress locally.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${sora.variable} ${mono.variable}`}>
      <body className="font-sans">
        <Providers>
          <AuroraBackground />
          <Nav />
          <main className="mx-auto w-full max-w-6xl px-4 sm:px-6">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
