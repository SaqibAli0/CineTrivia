import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fromSlug } from '@/lib/slug';
import { TVmazeUnreachableError } from '@/lib/tvmaze-client';
import { getShowDetailsBySlug } from '@/lib/tvmaze';
import { getTvGapFill } from '@/lib/tmdb-tv';
import { MediaDetailBody } from '@/components/media-detail-body';
import { MediaUnavailable } from '@/components/media-unavailable';
import { buildMetaCopy } from '@/lib/media-classify';

// Pre-generate a small batch of popular TV pages; the rest render on-demand.
export async function generateStaticParams() {
  try {
    const { shouldPrerenderTvmazePages } = await import('@/lib/tvmaze-client');
    if (!(await shouldPrerenderTvmazePages())) return [];
    const { getPopularShowsList } = await import('@/lib/tvmaze');
    const shows = await getPopularShowsList(3, false);
    return shows.map((s) => ({ slug: s.slug }));
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
  if (!parsed) return { title: 'TV Show Not Found' };

  try {
    const show = await getShowDetailsBySlug(parsed.title, parsed.year);
    if (!show) return { title: 'TV Show' };
    // An anime series reached via /tv should still read as anime; otherwise a
    // regular TV series. Routed through the shared, type-adaptive copy builder.
    const { title, description } = buildMetaCopy({
      kind: show.isAnime ? 'anime-series' : 'tv',
      title: show.title,
      year: show.year,
      overview: show.overview,
    });
    return {
      title,
      description,
      alternates: { canonical: `/tv/${slug}` },
      openGraph: { title: `${title} | CineTrivia`, description, type: 'video.tv_show', siteName: 'CineTrivia' },
      twitter: { card: 'summary_large_image', title: `${show.title} (${show.year}) | CineTrivia`, description },
    };
  } catch {
    return { title: 'TV Show' };
  }
}

export default async function TvPage({ params }: PageProps) {
  const { slug } = await params;
  const path = `/tv/${slug}`;
  const parsed = fromSlug(slug);
  if (!parsed) notFound();

  try {
    const show = await getShowDetailsBySlug(parsed.title, parsed.year);
    // Reachable search that returned nothing → genuine 404.
    if (!show) notFound();

    // Best-effort TMDB enrichment via the show's IMDB id.
    const gap = await getTvGapFill(show.imdbId);

    return <MediaDetailBody show={show} gap={gap} path={path} sectionLabel="TV Show" />;
  } catch (error) {
    // notFound() throws internally — let it propagate as a real 404.
    if (error && typeof error === 'object' && 'digest' in error) throw error;
    // TVmaze unreachable → auto-retrying unavailable page, not a 404.
    if (error instanceof TVmazeUnreachableError) {
      return <MediaUnavailable title={parsed.title} year={parsed.year} path={path} label="TV show" />;
    }
    console.warn(`[TvPage] error for "${slug}":`, error instanceof Error ? error.name : 'error');
    return <MediaUnavailable title={parsed.title} year={parsed.year} path={path} label="TV show" />;
  }
}
