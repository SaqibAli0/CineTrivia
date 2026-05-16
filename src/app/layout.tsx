import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://classy-bublanina-aba3cc.netlify.app';

export const metadata: Metadata = {
  title: {
    default: 'CineTrivia — Movie Recommendations & Fun Facts',
    template: '%s',
  },
  description: 'Discover movies with personalized recommendations, fun facts, and trivia. Find where to watch, explore similar films, and get suggestions based on your mood.',
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: 'website',
    siteName: 'CineTrivia',
    title: 'CineTrivia — Movie Recommendations & Fun Facts',
    description: 'Discover movies with personalized recommendations, fun facts, and trivia.',
    url: SITE_URL,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CineTrivia — Movie Recommendations & Fun Facts',
    description: 'Discover movies with personalized recommendations, fun facts, and trivia.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const adsenseClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-body antialiased">
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
        {/* Google AdSense — only loads when configured */}
        {adsenseClientId && (
          <Script
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}`}
            strategy="afterInteractive"
            crossOrigin="anonymous"
          />
        )}
      </body>
    </html>
  );
}
