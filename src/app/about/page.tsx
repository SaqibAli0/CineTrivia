import { Metadata } from 'next';
import Link from 'next/link';
import { Film, ArrowLeft, Sparkles, Clapperboard, Heart } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About CineTrivia — AI-Powered Movie Discovery',
  description: 'CineTrivia uses AI to help you discover movies, get personalized recommendations, and learn fun facts about your favorite films.',
};

export default function AboutPage() {
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

          <h1 className="font-headline text-3xl sm:text-4xl text-foreground mb-4">
            About CineTrivia
          </h1>
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl">
            Your AI-powered companion for discovering movies, uncovering trivia, and finding
            your next favorite film.
          </p>

          <div className="space-y-10">
            {/* What We Do */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Clapperboard className="w-5 h-5 text-primary" />
                </div>
                <h2 className="font-headline text-xl text-foreground">What We Do</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                CineTrivia helps you explore the world of cinema. Browse our curated collection
                of movies spanning every genre and era. Each movie page features detailed
                information, ratings, and links to where you can watch.
              </p>
            </section>

            {/* AI-Powered Features */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <h2 className="font-headline text-xl text-foreground">AI-Powered Features</h2>
              </div>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>
                    <strong className="text-foreground">Smart Recommendations:</strong> Tell us
                    your mood or favorite genre, and our AI suggests the perfect movie for you.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>
                    <strong className="text-foreground">Fun Facts & Trivia:</strong> Discover
                    fascinating behind-the-scenes stories and trivia about every movie in our
                    collection.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>
                    <strong className="text-foreground">Similar Movies:</strong> Found something
                    you love? We&apos;ll show you related films you might enjoy.
                  </span>
                </li>
              </ul>
            </section>

            {/* Our Mission */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-primary" />
                </div>
                <h2 className="font-headline text-xl text-foreground">Our Mission</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                We believe everyone deserves to find movies they&apos;ll love. Whether you&apos;re
                looking for a classic drama, an underrated indie gem, or the latest blockbuster,
                CineTrivia makes discovery effortless and fun.
              </p>
            </section>

            {/* Credits */}
            <section className="space-y-4 pt-6 border-t border-border/40">
              <h2 className="font-headline text-xl text-foreground">Credits</h2>
              <p className="text-sm text-muted-foreground">
                CineTrivia uses publicly available movie data and AI technology to deliver
                recommendations and trivia. All movie posters and metadata are sourced from
                third-party databases under their respective terms of use.
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
