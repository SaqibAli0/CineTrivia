import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, User, Tag, Film } from 'lucide-react';
import { getPostBySlug, getAllPosts } from '@/lib/blog';
import { Footer } from '@/components/footer';
import { Navbar } from '@/components/navbar';
import { SocialShare } from '@/components/social-share';
import { AdSenseSlot } from '@/components/adsense-slot';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: 'Post Not Found' };

  return {
    title: `${post.title}`,
    description: post.description,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author],
      tags: post.tags,
      siteName: 'CineTrivia',
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
  };
}

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL  ;

  return (
    <div className="bg-background min-h-screen text-foreground pt-16">
      <div className="container mx-auto px-4 sm:px-6 md:px-8">
        <Navbar />
        <main className="py-8 sm:py-12 max-w-3xl mx-auto">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>

          {/* Article Header */}
          <header className="mb-8">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-medium">
                <Tag className="w-3 h-3" />
                {post.category}
              </span>
              <span className="inline-flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(post.publishedAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
              <span className="inline-flex items-center gap-1">
                <User className="w-3 h-3" />
                {post.author}
              </span>
            </div>
            <h1 className="font-headline text-2xl sm:text-3xl md:text-4xl text-foreground mb-4 leading-tight">
              {post.title}
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              {post.description}
            </p>
            <div className="mt-4">
              <SocialShare
                title={post.title}
                url={`${siteUrl}/blog/${post.slug}`}
                description={post.description}
              />
            </div>
          </header>

          {/* Article Content */}
          <article className="prose prose-neutral dark:prose-invert max-w-none">
            {post.content.map((section, i) => (
              <div key={i} className="mb-6">
                {section.heading && (
                  <h2 className="font-headline text-xl text-foreground mt-8 mb-3">
                    {section.heading}
                  </h2>
                )}
                <p className="text-sm sm:text-[15px] leading-relaxed text-muted-foreground">
                  {section.body}
                </p>
              </div>
            ))}
          </article>

          {/* Ad placement between content and related movies */}
          <AdSenseSlot slot={process.env.NEXT_PUBLIC_ADSENSE_BLOG_SLOT || ''} format="horizontal" className="my-8" />

          {/* Related Movie Links (Internal SEO Linking) */}
          {post.relatedMovies.length > 0 && (
            <section className="mt-10 pt-8 border-t border-border">
              <h2 className="font-headline text-xl text-foreground mb-4 flex items-center gap-2">
                <Film className="w-5 h-5 text-primary" />
                Movies Mentioned in This Article
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {post.relatedMovies.map((movieSlug) => {
                  const title = movieSlug
                    .replace(/-\d{4}$/, '')
                    .replace(/-/g, ' ')
                    .replace(/\b\w/g, (c) => c.toUpperCase());
                  return (
                    <Link
                      key={movieSlug}
                      href={`/movie/${movieSlug}`}
                      className="text-sm px-3 py-2 rounded-lg bg-card border border-border hover:border-primary/40 hover:text-primary transition-all text-center truncate"
                    >
                      {title}
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* CTA */}
          <section className="mt-10 text-center py-10 rounded-2xl bg-card border border-border">
            <Film className="w-8 h-8 text-primary mx-auto mb-4" />
            <h3 className="font-headline text-xl text-foreground mb-2">Want personalized picks?</h3>
            <p className="text-muted-foreground text-sm mb-5 max-w-sm mx-auto">
              Tell us your mood and get a perfect movie recommendation.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
            >
              Get a Recommendation
            </Link>
          </section>
        </main>
        <Footer />
      </div>

      {/* JSON-LD for blog post */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.title,
            description: post.description,
            datePublished: post.publishedAt,
            dateModified: post.updatedAt || post.publishedAt,
            author: { '@type': 'Organization', name: post.author },
            publisher: { '@type': 'Organization', name: 'CineTrivia' },
            mainEntityOfPage: `${siteUrl}/blog/${post.slug}`,
          }),
        }}
      />
      {/* Breadcrumb schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
              { '@type': 'ListItem', position: 2, name: 'Blog', item: `${siteUrl}/blog` },
              { '@type': 'ListItem', position: 3, name: post.title },
            ],
          }),
        }}
      />
    </div>
  );
}
