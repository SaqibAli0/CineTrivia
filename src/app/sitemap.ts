import { MetadataRoute } from 'next';
import { getPopularMoviesList } from '@/lib/tmdb-details';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://classy-bublanina-aba3cc.netlify.app';

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
  ];

  // Dynamic movie pages from TMDB popular movies
  let moviePages: MetadataRoute.Sitemap = [];

  try {
    const movies = await getPopularMoviesList(5); // 5 pages = ~100 movies
    moviePages = movies.map((movie) => ({
      url: `${SITE_URL}/movie/${movie.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error('Sitemap: Failed to fetch movies:', error);
  }

  return [...staticPages, ...moviePages];
}
