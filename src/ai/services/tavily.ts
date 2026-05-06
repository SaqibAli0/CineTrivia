/**
 * Tavily Search Service
 *
 * Used as a fallback for poster lookups and for providing
 * real-time movie context to the recommendation flow.
 */

const TAVILY_API_URL = 'https://api.tavily.com/search';

interface TavilySearchOptions {
  query: string;
  maxResults?: number;
  includeImages?: boolean;
  searchDepth?: 'basic' | 'advanced';
}

interface TavilyImage {
  url: string;
  description?: string;
}

export interface TavilyResult {
  title: string;
  content: string;
  url: string;
  img_url?: string;
}

interface TavilyResponse {
  results: TavilyResult[];
  images?: TavilyImage[];
  answer?: string;
}

function getApiKey(): string {
  const key = process.env.TAVILY_API_KEY;
  if (!key) {
    throw new Error('TAVILY_API_KEY is not configured');
  }
  return key;
}

async function tavilySearch(options: TavilySearchOptions): Promise<TavilyResponse> {
  const response = await fetch(TAVILY_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: getApiKey(),
      query: options.query,
      search_depth: options.searchDepth || 'basic',
      include_images: options.includeImages || false,
      include_image_descriptions: options.includeImages || false,
      max_results: options.maxResults || 5,
    }),
  });

  if (!response.ok) {
    throw new Error(`Tavily search failed: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Search for a movie poster image URL.
 * Single attempt — no fallback search to save API calls.
 */
export async function searchMoviePoster(movieTitle: string): Promise<string> {
  const data = await tavilySearch({
    query: `${movieTitle} movie poster official`,
    maxResults: 5,
    includeImages: true,
    searchDepth: 'basic',
  });

  const url = extractPosterUrl(data);
  if (!url) {
    throw new Error('No poster found in Tavily results');
  }

  return url;
}

/**
 * Search for movies by mood/genre to provide context for recommendations.
 */
export async function searchMoviesByGenre(moodOrGenre: string): Promise<TavilyResult[]> {
  const data = await tavilySearch({
    query: `best ${moodOrGenre} movies highly rated recommendations`,
    maxResults: 5,
    searchDepth: 'basic',
  });

  return data.results || [];
}

function extractPosterUrl(data: TavilyResponse): string {
  // Check images array first
  if (data.images && data.images.length > 0) {
    for (const image of data.images) {
      const url = image.url || '';
      const desc = (url + ' ' + (image.description || '')).toLowerCase();

      if (desc.includes('poster') && !desc.includes('behind the scenes')) {
        return url;
      }
    }

    // Use first image if nothing poster-specific
    if (data.images[0]?.url) {
      return data.images[0].url;
    }
  }

  // Check result thumbnails
  for (const result of data.results || []) {
    if (result.img_url) return result.img_url;
  }

  return '';
}
