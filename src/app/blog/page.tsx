import { Metadata } from 'next';
import Link from 'next/link';
import { Calendar, Tag } from 'lucide-react';
import { getAllPosts } from '@/lib/blog';
import { Footer } from '@/components/footer';
import { Navbar } from '@/components/navbar';

export const metadata: Metadata = {
  title: 'Blog — Movie Lists, Recommendations & Trivia',
  description: 'Discover curated movie lists, personalized recommendations, and film trivia.',
  alternates: { canonical: '/blog' },
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="relative flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow w-full max-w-[1600px] mx-auto px-6 py-12 pt-24 flex flex-col gap-16">
        <section className="flex flex-col gap-6">
          <div className="flex items-end justify-between border-b border-bordercolor pb-4">
            <div>
              <h1 className="display-font text-4xl text-parchment">SYSTEM LOG</h1>
              <div className="mono-font text-terracotta mt-1">BLOG_ENTRIES // TOTAL: {posts.length}</div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {posts.map((post, i) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="spec-card p-5 group cursor-pointer block"
              >
                <div className="flex justify-between mb-3 mono-font text-parchment/50 border-b border-bordercolor pb-2">
                  <span>LOG_{String(i + 1).padStart(3, '0')}</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="mono-font text-terracotta border border-terracotta/40 px-2 py-0.5 flex items-center gap-1">
                    <Tag className="w-2.5 h-2.5" />
                    {post.category.toUpperCase()}
                  </span>
                </div>
                <h2 className="display-font text-2xl text-parchment group-hover:text-terracotta transition-colors mb-2">
                  {post.title.toUpperCase()}
                </h2>
                <p className="mono-font text-parchment/60 text-[11px] leading-relaxed line-clamp-2">
                  {post.description.toUpperCase()}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
