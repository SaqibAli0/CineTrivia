/**
 * Debug endpoint to check the movie pool status.
 * Hit /api/pool in your browser to see how many movies are stored.
 */

import { NextResponse } from 'next/server';
import { getDevCache } from '@/lib/dev-cache';

interface MoviePool {
  movies: any[];
  isFull: boolean;
}

export async function GET() {
  const pool = getDevCache<MoviePool>('movie_pool_v2');

  if (!pool) {
    return NextResponse.json({
      status: 'empty',
      count: 0,
      isFull: false,
      message: 'Pool has not been created yet. Refresh the homepage to start filling it.',
    });
  }

  return NextResponse.json({
    status: pool.isFull ? 'full' : 'filling',
    count: pool.movies.length,
    target: 100,
    isFull: pool.isFull,
    sampleTitles: pool.movies.slice(0, 10).map((m: any) => m.title),
  });
}
