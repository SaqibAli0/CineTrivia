import { ImageResponse } from 'next/og';
import { fromSlug } from '@/lib/slug';
import { getShowDetailsBySlug } from '@/lib/tvmaze';

export const alt = 'TV show details on CineTrivia';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const BG = '#1e1b1a';
const SURFACE = '#262220';
const PRIMARY = '#d67a5c';
const PRIMARY_SOFT = '#e0a58f';
const TEXT = '#f6f4f2';
const MUTED = '#928c86';
const STAR = '#f5c14e';

function Wordmark({ fontSize = 34 }: { fontSize?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 52, height: 52, borderRadius: 14, background: PRIMARY }}>
        <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="20" height="15" x="2" y="7" rx="2" ry="2" />
          <polyline points="17 2 12 7 7 2" />
        </svg>
      </div>
      <span style={{ fontSize, fontWeight: 800, color: TEXT, letterSpacing: '-1px', fontFamily: 'Georgia, serif' }}>
        CineTrivia<span style={{ color: PRIMARY }}>.</span>
      </span>
    </div>
  );
}

function fallbackCard() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '20px', background: `radial-gradient(1100px 560px at 50% 0%, #2a2320 0%, ${BG} 60%)` }}>
        <Wordmark fontSize={64} />
        <span style={{ fontSize: '28px', color: MUTED }}>TV Shows, Facts & Where to Watch</span>
      </div>
    ),
    { ...size }
  );
}

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
  let overview = '';
  let posterUrl = '';

  try {
    const show = await getShowDetailsBySlug(parsed.title, parsed.year);
    if (show) {
      title = show.title;
      year = show.year;
      rating = show.rating;
      genres = show.genres.slice(0, 3).join(' • ');
      overview = show.overview;
      posterUrl = show.posterUrl;
    }
  } catch {
    /* fall through with parsed data */
  }

  const poster = await fetchPosterDataUri(posterUrl);
  if (!poster) return fallbackCard();

  const shortOverview = overview.length > 220 ? `${overview.slice(0, 217).trimEnd()}…` : overview;

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'row', background: `radial-gradient(900px 560px at 0% 0%, #2a2320 0%, ${BG} 55%)`, position: 'relative' }}>
        <div style={{ position: 'absolute', top: '-140px', left: '-120px', width: '460px', height: '460px', borderRadius: '9999px', background: 'rgba(214,122,92,0.18)', filter: 'blur(40px)' }} />
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '60px', width: '760px' }}>
          <Wordmark />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <span style={{ fontSize: '60px', fontWeight: 800, color: TEXT, letterSpacing: '-2px', lineHeight: 1.05, fontFamily: 'Georgia, serif' }}>{title}</span>
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
            {shortOverview && <span style={{ fontSize: '20px', color: '#b8b0a9', lineHeight: 1.4, maxWidth: '620px' }}>{shortOverview}</span>}
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            {['Seasons & Episodes', 'Where to Watch'].map((label) => (
              <span key={label} style={{ padding: '12px 22px', borderRadius: '9999px', background: SURFACE, border: '1px solid rgba(214,122,92,0.35)', color: PRIMARY_SOFT, fontSize: '19px', fontWeight: 600 }}>{label}</span>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', width: '440px', height: '100%', position: 'relative' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={poster} alt="" width={440} height={630} style={{ width: '440px', height: '630px', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(90deg, ${BG} 0%, rgba(30,27,26,0) 22%)` }} />
        </div>
      </div>
    ),
    { ...size }
  );
}
