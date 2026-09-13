import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'CineTrivia — Movie Recommendations, Fun Facts & Where to Watch';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Brand palette (matches the dark theme in globals.css)
const BG = '#1e1b1a'; // hsl(30 6% 11%)
const SURFACE = '#262220'; // hsl(30 6% 14%)
const PRIMARY = '#d67a5c'; // hsl(14 60% 60%)  terracotta accent
const PRIMARY_SOFT = '#e0a58f';
const TEXT = '#f6f4f2'; // hsl(30 10% 96%)
const MUTED = '#928c86'; // hsl(30 5% 55%)

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px',
          background: `radial-gradient(1200px 600px at 15% 0%, #2a2320 0%, ${BG} 55%)`,
          position: 'relative',
        }}
      >
        {/* Accent glow blob */}
        <div
          style={{
            position: 'absolute',
            top: '-160px',
            right: '-120px',
            width: '520px',
            height: '520px',
            borderRadius: '9999px',
            background: 'rgba(214,122,92,0.22)',
            filter: 'blur(40px)',
          }}
        />

        {/* Top: brand wordmark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* Clapperboard mark in a rounded tile */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '84px',
              height: '84px',
              borderRadius: '20px',
              background: PRIMARY,
            }}
          >
            <svg
              width="52"
              height="52"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3Z" />
              <path d="m6.2 5.3 3.1 3.9" />
              <path d="m12.4 3.4 3.1 4" />
              <path d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
            </svg>
          </div>
          <span
            style={{
              fontSize: '60px',
              fontWeight: 800,
              color: TEXT,
              letterSpacing: '-2px',
              fontFamily: 'Georgia, "Times New Roman", serif',
            }}
          >
            CineTrivia<span style={{ color: PRIMARY }}>.</span>
          </span>
        </div>

        {/* Middle: headline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '900px' }}>
          <span
            style={{
              fontSize: '76px',
              fontWeight: 800,
              color: TEXT,
              letterSpacing: '-2px',
              lineHeight: 1.05,
              fontFamily: 'Georgia, "Times New Roman", serif',
            }}
          >
            Find What to Watch
          </span>
          <span style={{ fontSize: '30px', color: MUTED, lineHeight: 1.4 }}>
            Personalized movie recommendations, fun facts, and where to stream — pick a genre, set a vibe, discover your next film.
          </span>
        </div>

        {/* Bottom: feature pills */}
        <div style={{ display: 'flex', gap: '18px' }}>
          {['Personalized Picks', 'Ratings & Trivia', 'Where to Watch'].map((label) => (
            <span
              key={label}
              style={{
                padding: '14px 26px',
                borderRadius: '9999px',
                background: SURFACE,
                border: `1px solid rgba(214,122,92,0.35)`,
                color: PRIMARY_SOFT,
                fontSize: '22px',
                fontWeight: 600,
              }}
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
