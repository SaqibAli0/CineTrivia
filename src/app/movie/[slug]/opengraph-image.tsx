import { ImageResponse } from 'next/og';
import { fromSlug } from '@/lib/slug';
import { findMovieId, getMovieDetails } from '@/lib/tmdb-details';

// Use the Node.js runtime (NOT edge). The movie page itself runs on Node and
// its TMDB fetches work reliably; the edge sandbox fails locally with
// ECONNRESET. Keeping this on Node makes the poster fetch behave the same.
export const alt = 'Movie details on CineTrivia';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Brand palette (matches the dark theme in globals.css)
const BG = '#1e1b1a'; // hsl(30 6% 11%)
const SURFACE = '#262220'; // hsl(30 6% 14%)
const PRIMARY = '#d67a5c'; // hsl(14 60% 60%)  terracotta accent
const PRIMARY_SOFT = '#e0a58f';
const TEXT = '#f6f4f2'; // hsl(30 10% 96%)
const MUTED = '#928c86'; // hsl(30 5% 55%)
const STAR = '#f5c14e';

function ClapperMark({ tile = 52, icon = 32 }: { tile?: number; icon?: number }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: tile,
        height: tile,
        borderRadius: Math.round(tile * 0.27),
        background: PRIMARY,
      }}
    >
      <svg width={icon} height={icon} viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3Z" />
        <path d="m6.2 5.3 3.1 3.9" />
        <path d="m12.4 3.4 3.1 4" />
        <path d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
      </svg>
    </div>
  );
}

function Wordmark({ fontSize = 34 }: { fontSize?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
      <ClapperMark />
      <span
        style={{
          fontSize,
          fontWeight: 800,
          color: TEXT,
          letterSpacing: '-1px',
          fontFamily: 'Georgia, "Times New Roman", serif',
        }}
      >
        CineTrivia<span style={{ color: PRIMARY }}>.</span>
      </span>
    </div>
  );
}

/** Branded card used when we have no poster / TMDB data. */
function fallbackCard() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '20px',
          background: `radial-gradient(1100px 560px at 50% 0%, #2a2320 0%, ${BG} 60%)`,
        }}
      >
        <Wordmark fontSize={64} />
        <span style={{ fontSize: '28px', color: MUTED }}>Movie Facts, Trivia & Where to Watch</span>
      </div>
    ),
    { ...size }
  );
}

/**
 * Fetch the poster and return it as a data URI so Satori (next/og) renders it
 * reliably. Returns null on any failure so the caller can degrade gracefully.
 */
async function fetchPosterDataUri(posterUrl: string): Promise<string | null> {
  if (!posterUrl) return null;
  try {
    const res = await fetch(posterUrl, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const contentType = res.headers.get('content-type') || 'image/jpeg';
    const buf = Buffer.from(await res.arrayBuffer());
    return `data:${contentType};base64,${buf.toString('base64')}`;
  } catch {
    return null;
  }
}

export default async function OGImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const parsed = fromSlug(slug);
  if (!parsed) return fallbackCard();

  let title = parsed.title;
  let year = parsed.year;
  let rating = 0;
  let genres = '';
  let director = '';
  let overview = '';
  let posterUrl = '';

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
        overview = movie.overview;
        posterUrl = movie.posterUrl;
      }
    }
  } catch {
    // Fall through with parsed data; poster stays empty.
  }

  const poster = await fetchPosterDataUri(posterUrl);

  // No poster available → use the clean branded fallback rather than an
  // awkward empty gap.
  if (!poster) return fallbackCard();

  const shortOverview =
    overview.length > 220 ? `${overview.slice(0, 217).trimEnd()}…` : overview;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'row',
          background: `radial-gradient(900px 560px at 0% 0%, #2a2320 0%, ${BG} 55%)`,
          position: 'relative',
        }}
      >
        {/* Accent glow */}
        <div
          style={{
            position: 'absolute',
            top: '-140px',
            left: '-120px',
            width: '460px',
            height: '460px',
            borderRadius: '9999px',
            background: 'rgba(214,122,92,0.18)',
            filter: 'blur(40px)',
          }}
        />

        {/* Left: text content fills the space */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '60px',
            width: '760px',
          }}
        >
          <Wordmark />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <span
              style={{
                fontSize: '60px',
                fontWeight: 800,
                color: TEXT,
                letterSpacing: '-2px',
                lineHeight: 1.05,
                fontFamily: 'Georgia, "Times New Roman", serif',
              }}
            >
              {title}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '22px' }}>
              <span style={{ fontSize: '28px', color: MUTED }}>({year})</span>
              {rating > 0 && (
                <span style={{ fontSize: '28px', color: STAR, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill={STAR} stroke={STAR} strokeWidth="1.5" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  {rating}/10
                </span>
              )}
            </div>
            {genres && <span style={{ fontSize: '22px', color: MUTED }}>{genres}</span>}
            {director && director !== 'Unknown' && (
              <span style={{ fontSize: '20px', color: MUTED }}>Directed by {director}</span>
            )}
            {shortOverview && (
              <span style={{ fontSize: '20px', color: '#b8b0a9', lineHeight: 1.4, maxWidth: '620px' }}>
                {shortOverview}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            {['Fun Facts & Trivia', 'Where to Watch'].map((label) => (
              <span
                key={label}
                style={{
                  padding: '12px 22px',
                  borderRadius: '9999px',
                  background: SURFACE,
                  border: '1px solid rgba(214,122,92,0.35)',
                  color: PRIMARY_SOFT,
                  fontSize: '19px',
                  fontWeight: 600,
                }}
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Right: poster fills the previously empty space, full bleed */}
        <div
          style={{
            display: 'flex',
            width: '440px',
            height: '100%',
            position: 'relative',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={poster}
            alt=""
            width={440}
            height={630}
            style={{ width: '440px', height: '630px', objectFit: 'cover' }}
          />
          {/* Soft fade (rendered AFTER the img so it paints on top — next/og
              ignores z-index, so source order is what controls layering). */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(90deg, ${BG} 0%, rgba(30,27,26,0) 22%)`,
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  );
}
