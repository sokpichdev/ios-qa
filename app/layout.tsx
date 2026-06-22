import type { Metadata } from 'next';
import { Poppins, Montserrat, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import AuroraBackground from '@/components/AuroraBackground';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
});
const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-secondary', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' });

export const metadata: Metadata = {
  title: 'iOS QA — Developer Interview Prep',
  description:
    'Browse, filter, and quiz yourself on iOS developer interview questions across Swift, SwiftUI, Concurrency, Architecture and more. Track your progress locally.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${poppins.variable} ${montserrat.variable} ${mono.variable}`}>
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
