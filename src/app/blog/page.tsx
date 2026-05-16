import { Metadata } from 'next';
import Link from 'next/link';
import { Film, ArrowLeft, Calendar, Tag } from 'lucide-react';
import { getAllPosts } from '@/lib/blog';
import { Footer } from '@/components/footer';
import { Navbar } from '@/components/navbar';

export const metadata: Metadata = {
  title: 'Blog — Movie Lists, Recommendations & Trivia | CineTrivia',
  description: 'Discover curated movie lists, AI-powered recommendations, and film trivia. Find your next favorite movie with our expert guides.',
  openGraph: {
    title: 'CineTrivia Blog — Movie Lists & Recommendations',
    description: 'Curated movie lists, recommendations, and trivia from CineTrivia.',
    type: 'website',
  },
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="bg-background min-h-screen text-foreground pt-16">
      <div className="container mx-auto px-4 sm:px-6 md:px-8">
        <Navbar />
        <main className="py-8 sm:py-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <div className="mb-10">
            <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl text-foreground mb-3">
              CineTrivia Blog
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base max-w-2xl">
              Curated movie lists, AI-powered recommendations, and film trivia to help you find your next favorite movie.
            </p>
          </div>

          <div className="grid gap-6 sm:gap-8">
            {posts.map((post) => (
              <article key={post.slug} className="group">
                <Link
                  href={`/blog/${post.slug}`}
                  className="block p-5 sm:p-6 rounded-xl bg-card border border-border hover:border-primary/40 transition-all duration-200"
                >
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-medium">
                      <Tag className="w-3 h-3" />
                      {post.category}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(post.publishedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <h2 className="font-headline text-lg sm:text-xl text-foreground group-hover:text-primary transition-colors mb-2">
                    {post.title}
                  </h2>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {post.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {post.tags.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
