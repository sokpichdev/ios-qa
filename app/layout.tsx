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

const title = 'iOS Reference & Practice';
const description =
  'Browse, quiz, and track your progress across Swift, SwiftUI, Concurrency, Architecture, Networking, Testing, UIKit and Xcode. Everything saved locally in your browser.';

export const metadata: Metadata = {
  metadataBase: new URL('https://ios.sokpich.dev'),
  title,
  description,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: 'iOS Reference & Practice',
    title,
    description,
    images: [{ url: '/og.png', width: 1200, height: 630, alt: title }],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: ['/og.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${poppins.variable} ${montserrat.variable} ${mono.variable}`}>
      <body className="font-sans flex min-h-screen flex-col">
        <Providers>
          <AuroraBackground />
          <Nav />
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 sm:px-6">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
