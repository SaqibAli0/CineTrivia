import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'CineTrivia — Movie Recommendations, Fun Facts & Where to Watch';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '30px',
          }}
        >
          <span style={{ fontSize: '48px' }}>🎬</span>
          <span
            style={{
              fontSize: '64px',
              fontWeight: 'bold',
              color: '#ffffff',
              letterSpacing: '-2px',
            }}
          >
            CineTrivia
          </span>
        </div>
        <p
          style={{
            fontSize: '32px',
            color: '#a0aec0',
            textAlign: 'center',
            maxWidth: '800px',
            lineHeight: 1.4,
          }}
        >
          Movie Recommendations, Fun Facts & Where to Watch
        </p>
        <div
          style={{
            display: 'flex',
            gap: '20px',
            marginTop: '40px',
          }}
        >
          <span
            style={{
              padding: '12px 24px',
              borderRadius: '30px',
              background: 'rgba(255,255,255,0.1)',
              color: '#e2e8f0',
              fontSize: '20px',
            }}
          >
            🎭 Personalized Picks
          </span>
          <span
            style={{
              padding: '12px 24px',
              borderRadius: '30px',
              background: 'rgba(255,255,255,0.1)',
              color: '#e2e8f0',
              fontSize: '20px',
            }}
          >
            ⭐ Ratings & Reviews
          </span>
          <span
            style={{
              padding: '12px 24px',
              borderRadius: '30px',
              background: 'rgba(255,255,255,0.1)',
              color: '#e2e8f0',
              fontSize: '20px',
            }}
          >
            📺 Where to Watch
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
