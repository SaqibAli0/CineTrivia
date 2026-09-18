import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fromSlug } from '@/lib/slug';
import { TVmazeUnreachableError } from '@/lib/tvmaze-client';
import { TMDBUnreachableError } from '@/lib/tmdb-client';
import { getShowDetailsBySlug } from '@/lib/tvmaze';
import { getTvGapFill } from '@/lib/tmdb-tv';
import { findMovieId, getMovieDetails, getSimilarMovies, getWatchProviders, getMovieTrailer } from '@/lib/tmdb-details';
import { MediaDetailBody } from '@/components/media-detail-body';
import { AnimatedFilmBody } from '@/components/animated-film-body';
import { MediaUnavailable } from '@/components/media-unavailable';
import { isAnime, buildMetaCopy } from '@/lib/media-classify';

// Pre-generate a small batch of popular animation pages (series + films).
export async function generateStaticParams() {
  try {
    const params: { slug: string }[] = [];

    const { shouldPrerenderTvmazePages } = await import('@/lib/tvmaze-client');
    if (await shouldPrerenderTvmazePages()) {
      const { getPopularShowsList } = await import('@/lib/tvmaze');
      const series = await getPopularShowsList(4, true); // animation only
      params.push(...series.map((s) => ({ slug: s.slug })));
    }

    const { shouldPrerenderTmdbPages } = await import('@/lib/tmdb-client');
    if (await shouldPrerenderTmdbPages()) {
      const { getPopularAnimatedFilmsList } = await import('@/lib/tmdb-tv');
      const films = await getPopularAnimatedFilmsList(2);
      params.push(...films.map((f) => ({ slug: f.slug })));
    }

    // Dedupe by slug.
    const seen = new Set<string>();
    return params.filter((p) => (seen.has(p.slug) ? false : (seen.add(p.slug), true)));
  } catch {
    return [];
  }
}

export const dynamicParams = true;
export const revalidate = 86400;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const parsed = fromSlug(slug);
  if (!parsed) return { title: 'Animation Not Found' };

  try {
    // Series first, then film.
    const show = await getShowDetailsBySlug(parsed.title, parsed.year);
    if (show && show.isAnimation) {
      // Anime series → "anime" wording; other animated series → "animation".
      const { title, description } = buildMetaCopy({
        kind: show.isAnime ? 'anime-series' : 'animated-film',
        title: show.title,
        year: show.year,
        overview: show.overview,
      });
      return {
        title,
        description,
        alternates: { canonical: `/animation/${slug}` },
        openGraph: { title: `${title} | CineTrivia`, description, type: 'video.tv_show', siteName: 'CineTrivia' },
        twitter: { card: 'summary_large_image', title: `${show.title} (${show.year}) | CineTrivia`, description },
      };
    }

    const movieId = await findMovieId(parsed.title, parsed.year);
    if (movieId) {
      const movie = await getMovieDetails(movieId);
      if (movie) {
        // Derive anime-ness for films from language + production companies.
        const animeFilm = isAnime({
          isAnimation: true,
          language: movie.language,
          genres: movie.genres,
          studios: movie.productionCompanies,
        });
        const { title, description } = buildMetaCopy({
          kind: animeFilm ? 'anime-film' : 'animated-film',
          title: movie.title,
          year: movie.year,
          overview: movie.overview,
        });
        return {
          title,
          description,
          alternates: { canonical: `/animation/${slug}` },
          openGraph: { title: `${title} | CineTrivia`, description, type: 'video.movie', siteName: 'CineTrivia' },
          twitter: { card: 'summary_large_image', title: `${movie.title} (${movie.year}) | CineTrivia`, description },
        };
      }
    }
    return { title: 'Animation' };
  } catch {
    return { title: 'Animation' };
  }
}

export default async function AnimationPage({ params }: PageProps) {
  const { slug } = await params;
  const path = `/animation/${slug}`;
  const parsed = fromSlug(slug);
  if (!parsed) notFound();

  // 1) Try an animated SERIES via TVmaze.
  try {
    const show = await getShowDetailsBySlug(parsed.title, parsed.year);
    if (show && show.isAnimation) {
      const gap = await getTvGapFill(show.imdbId);
      return <MediaDetailBody show={show} gap={gap} path={path} sectionLabel="Animation" />;
    }
    // A TVmaze show that ISN'T animation shouldn't live under /animation.
  } catch (error) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
    if (error instanceof TVmazeUnreachableError) {
      return <MediaUnavailable title={parsed.title} year={parsed.year} path={path} label="title" />;
    }
    // Any other TVmaze error — fall through to the film path.
    console.warn(`[AnimationPage] series lookup failed for "${slug}":`, error instanceof Error ? error.name : 'error');
  }

  // 2) Fall back to an animated FILM via TMDB.
  try {
    const movieId = await findMovieId(parsed.title, parsed.year);
    if (!movieId) notFound();

    const movie = await getMovieDetails(movieId);
    if (!movie) return <MediaUnavailable title={parsed.title} year={parsed.year} path={path} label="title" />;

    const [similarR, providersR, trailerR] = await Promise.allSettled([
      getSimilarMovies(movieId, 8),
      getWatchProviders(movieId),
      getMovieTrailer(movieId),
    ]);

    const animeFilm = isAnime({
      isAnimation: true,
      language: movie.language,
      genres: movie.genres,
      studios: movie.productionCompanies,
    });

    return (
      <AnimatedFilmBody
        movie={movie}
        similar={similarR.status === 'fulfilled' ? similarR.value : []}
        providers={providersR.status === 'fulfilled' ? providersR.value : []}
        trailer={trailerR.status === 'fulfilled' ? trailerR.value : null}
        path={path}
        isAnime={animeFilm}
      />
    );
  } catch (error) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
    if (error instanceof TMDBUnreachableError) {
      return <MediaUnavailable title={parsed.title} year={parsed.year} path={path} label="title" />;
    }
    console.warn(`[AnimationPage] film lookup failed for "${slug}":`, error instanceof Error ? error.name : 'error');
    return <MediaUnavailable title={parsed.title} year={parsed.year} path={path} label="title" />;
  }
}
