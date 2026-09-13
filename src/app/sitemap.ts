import { MetadataRoute } from 'next';
import { getPopularMoviesList } from '@/lib/tmdb-details';
import { getPopularShowsList } from '@/lib/tvmaze';
import { getPopularAnimatedFilmsList } from '@/lib/tmdb-tv';
import { getAllPosts } from '@/lib/blog';
import { GENRES } from '@/lib/genres';
import { SITE_URL } from '@/lib/site';

export const revalidate = 86400; // revalidate once per day

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/genre`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/tv`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/animation`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];

  // Blog posts
  const blogPages: MetadataRoute.Sitemap = getAllPosts().map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt || post.publishedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Genre pages
  const genrePages: MetadataRoute.Sitemap = GENRES.map((genre) => ({
    url: `${SITE_URL}/genre/${genre.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  // Dynamic movie pages from TMDB popular movies
  let moviePages: MetadataRoute.Sitemap = [];

  try {
    const movies = await getPopularMoviesList(5); // 5 pages = ~100 movies — limits crawler-driven function calls
    moviePages = movies.map((movie) => ({
      url: `${SITE_URL}/movie/${movie.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.warn('[sitemap] movies unavailable:', error instanceof Error ? error.name : 'error');
  }

  // Dynamic TV pages from TVmaze popular shows (non-animation).
  let tvPages: MetadataRoute.Sitemap = [];
  try {
    const shows = await getPopularShowsList(3, false);
    tvPages = shows.map((s) => ({
      url: `${SITE_URL}/tv/${s.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.warn('[sitemap] tv shows unavailable:', error instanceof Error ? error.name : 'error');
  }

  // Dynamic animation pages: animated series (TVmaze) + animated films (TMDB).
  let animationPages: MetadataRoute.Sitemap = [];
  try {
    const [series, films] = await Promise.all([
      getPopularShowsList(3, true).catch(() => []),
      getPopularAnimatedFilmsList(2).catch(() => []),
    ]);
    const seen = new Set<string>();
    animationPages = [...series, ...films]
      .filter((s) => (seen.has(s.slug) ? false : (seen.add(s.slug), true)))
      .map((s) => ({
        url: `${SITE_URL}/animation/${s.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));
  } catch (error) {
    console.warn('[sitemap] animation unavailable:', error instanceof Error ? error.name : 'error');
  }

  return [...staticPages, ...blogPages, ...genrePages, ...moviePages, ...tvPages, ...animationPages];
}
