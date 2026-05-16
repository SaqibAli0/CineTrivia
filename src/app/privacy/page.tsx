import { Metadata } from 'next';
import Link from 'next/link';
import { Film, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | CineTrivia',
  description: 'CineTrivia privacy policy — how we handle your data and protect your privacy.',
};

export default function PrivacyPage() {
  return (
    <div className="bg-background min-h-screen text-foreground">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 max-w-3xl">
        {/* Navigation */}
        <nav className="flex items-center justify-between py-5 border-b border-border/40">
          <Link href="/" className="flex items-center gap-2">
            <Film className="w-5 h-5 text-primary" />
            <span className="font-headline text-xl text-foreground">CineTrivia.</span>
          </Link>
        </nav>

        <main className="py-8 sm:py-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <h1 className="font-headline text-3xl sm:text-4xl text-foreground mb-8">
            Privacy Policy
          </h1>

          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6 text-muted-foreground">
            <p className="text-sm">Last updated: May 2025</p>

            <section className="space-y-3">
              <h2 className="font-headline text-xl text-foreground">Overview</h2>
              <p>
                CineTrivia is a free movie discovery platform. We respect your privacy and are
                committed to protecting any information you share with us. This policy explains
                what data we collect and how we use it.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-headline text-xl text-foreground">Information We Collect</h2>
              <p>We collect minimal information to provide our service:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Usage Data:</strong> Anonymous analytics about page views and feature
                  usage to improve the site. No personally identifiable information is collected.
                </li>
                <li>
                  <strong>Local Storage:</strong> We store movie preferences in your browser&apos;s
                  local storage (IndexedDB) to provide a faster experience. This data never leaves
                  your device.
                </li>
                <li>
                  <strong>Recommendation Interactions:</strong> When you use our recommendation or fun fact
                  features, your input (mood/genre preferences) is sent to our service to
                  generate results. We do not store these inputs permanently.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-headline text-xl text-foreground">Third-Party Services</h2>
              <p>We use the following third-party services:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Movie Data Providers:</strong> Movie information, posters, and ratings
                  are sourced from third-party databases subject to their own privacy policies.
                </li>
                <li>
                  <strong>Recommendation Services:</strong> Powers our recommendation engine and fun facts.
                  Your input (mood/genre preferences) is processed to generate results.
                </li>
                <li>
                  <strong>Affiliate Links:</strong> We may include links to streaming platforms
                  (Amazon Prime Video, Apple TV+, etc.) that contain affiliate tracking. Clicking
                  these links is optional and subject to those platforms&apos; privacy policies.
                </li>
                <li>
                  <strong>Google AdSense:</strong> We may display ads powered by Google. Google
                  uses cookies to serve ads based on your browsing history. You can opt out at{' '}
                  <a
                    href="https://adssettings.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Google Ad Settings
                  </a>.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-headline text-xl text-foreground">Cookies</h2>
              <p>
                We use minimal cookies for theme preferences and analytics. Third-party services
                (like Google AdSense) may set their own cookies. You can control cookies through
                your browser settings.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-headline text-xl text-foreground">Data Security</h2>
              <p>
                We do not collect personal data such as names, emails, or payment information.
                All communication with our servers uses HTTPS encryption.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-headline text-xl text-foreground">Children&apos;s Privacy</h2>
              <p>
                CineTrivia is a general audience site. We do not knowingly collect information
                from children under 13.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-headline text-xl text-foreground">Changes to This Policy</h2>
              <p>
                We may update this policy from time to time. Changes will be posted on this page
                with an updated date.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-headline text-xl text-foreground">Contact</h2>
              <p>
                If you have questions about this privacy policy, please reach out through our
                website.
              </p>
            </section>
          </div>
        </main>

        <footer className="border-t border-border/40 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-muted-foreground">
            <p>© 2025 CineTrivia. All rights reserved.</p>
            <div className="flex gap-4">
              <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
              <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
