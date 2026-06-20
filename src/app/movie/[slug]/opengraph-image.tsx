import { ImageResponse } from 'next/og';
import { fromSlug } from '@/lib/slug';
import { findMovieId, getMovieDetails } from '@/lib/tmdb-details';

export const runtime = 'edge';
export const alt = 'Movie details on CineTrivia';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OGImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const parsed = fromSlug(slug);

  if (!parsed) {
    return new ImageResponse(
      <div style={{ background: '#1a1a2e', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: '#fff', fontSize: '48px' }}>CineTrivia</span>
      </div>,
      { ...size }
    );
  }

  let title = parsed.title;
  let year = parsed.year;
  let rating = 0;
  let genres = '';
  let director = '';

  try {
    const movieId = await findMovieId(parsed.title, parsed.year);
    if (movieId) {
      const movie = await getMovieDetails(movieId);
      if (movie) {
        title = movie.title;
        year = movie.year;
        rating = movie.rating;
        genres = movie.genres.slice(0, 3).join(' • ');
        director = movie.director;
      }
    }
  } catch {
    // Fall through with parsed data
  }

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px',
        }}
      >
        {/* Top: branding */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '28px' }}>🎬</span>
          <span style={{ fontSize: '28px', fontWeight: 'bold', color: '#a0aec0' }}>CineTrivia</span>
        </div>

        {/* Middle: movie info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <span
            style={{
              fontSize: '56px',
              fontWeight: 'bold',
              color: '#ffffff',
              letterSpacing: '-1px',
              lineHeight: 1.1,
              maxWidth: '900px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {title}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <span style={{ fontSize: '28px', color: '#a0aec0' }}>({year})</span>
            {rating > 0 && (
              <span style={{ fontSize: '28px', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '8px' }}>
                ⭐ {rating}/10
              </span>
            )}
          </div>
          {genres && (
            <span style={{ fontSize: '22px', color: '#718096' }}>{genres}</span>
          )}
          {director && director !== 'Unknown' && (
            <span style={{ fontSize: '20px', color: '#718096' }}>Directed by {director}</span>
          )}
        </div>

        {/* Bottom: tagline */}
        <div style={{ display: 'flex', gap: '20px' }}>
          <span
            style={{
              padding: '10px 20px',
              borderRadius: '24px',
              background: 'rgba(255,255,255,0.1)',
              color: '#e2e8f0',
              fontSize: '18px',
            }}
          >
            Fun Facts & Trivia
          </span>
          <span
            style={{
              padding: '10px 20px',
              borderRadius: '24px',
              background: 'rgba(255,255,255,0.1)',
              color: '#e2e8f0',
              fontSize: '18px',
            }}
          >
            Where to Watch
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
