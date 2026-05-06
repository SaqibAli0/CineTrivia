/**
 * Health check endpoint.
 *
 * Verifies that required API keys are configured and
 * external services are reachable. Useful for uptime
 * monitoring tools like UptimeRobot.
 */

import { NextResponse } from 'next/server';

export async function GET() {
  const checks: Record<string, string> = {};
  let healthy = true;

  // Check Gemini API key is set
  if (process.env.GEMINI_API_KEY) {
    checks.gemini = 'configured';
  } else {
    checks.gemini = 'missing';
    healthy = false;
  }

  // Check TMDB API key is set
  if (process.env.TMDB_API_KEY && process.env.TMDB_API_KEY !== 'your_tmdb_api_key_here') {
    checks.tmdb = 'configured';
  } else {
    checks.tmdb = 'missing';
    healthy = false;
  }

  // Check Tavily API key is set
  if (process.env.TAVILY_API_KEY) {
    checks.tavily = 'configured';
  } else {
    checks.tavily = 'missing';
    healthy = false;
  }

  const status = healthy ? 200 : 503;

  return NextResponse.json(
    {
      status: healthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      services: checks,
    },
    { status }
  );
}
