import { NextRequest, NextResponse } from 'next/server';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q');

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ results: [] });
  }

  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ results: [] });
  }

  try {
    const url = new URL(`${TMDB_BASE_URL}/search/movie`);
    url.searchParams.set('api_key', apiKey);
    url.searchParams.set('query', query.trim());
    url.searchParams.set('language', 'en-US');
    url.searchParams.set('page', '1');

    const response = await fetch(url.toString(), {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      return NextResponse.json({ results: [] });
    }

    const data = await response.json();
    const movies = (data.results || []).slice(0, 3); // Only return 3 results max

    const results = movies.map((movie: any) => ({
      id: movie.id,
      title: movie.title,
      year: movie.release_date ? parseInt(movie.release_date.split('-')[0], 10) : 0,
      posterUrl: movie.poster_path
        ? `https://image.tmdb.org/t/p/w92${movie.poster_path}`
        : '',
    }));

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ results: [] });
  }
}
