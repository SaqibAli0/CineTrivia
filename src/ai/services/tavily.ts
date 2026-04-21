/**
 * Tavily Search Service
 * Handles all interactions with Tavily Search API
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

/**
 * Search using Tavily API
 */
export async function tavilySearch(options: TavilySearchOptions): Promise<TavilyResponse> {
  const apiKey = process.env.TAVILY_API_KEY;
  
  if (!apiKey) {
    throw new Error('TAVILY_API_KEY environment variable is not configured');
  }

  const response = await fetch(TAVILY_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      api_key: apiKey,
      query: options.query,
      search_depth: options.searchDepth || 'basic',
      include_images: options.includeImages || false,
      include_image_descriptions: options.includeImages || false,
      include_image_url: options.includeImages || false,
      max_results: options.maxResults || 5,
    }),
  });

  if (!response.ok) {
    throw new Error(`Tavily search failed: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Search for movie posters
 */
export async function searchMoviePoster(movieTitle: string): Promise<string> {
  console.log('Searching for movie poster:', movieTitle);

  // Primary search
  const searchData = await tavilySearch({
    query: `${movieTitle} movie poster official`,
    maxResults: 10,
    includeImages: true,
    searchDepth: 'basic',
  });

  let posterUrl = extractPosterUrl(searchData);

  // Fallback search if no poster found
  if (!posterUrl) {
    console.log('No poster found in primary search, trying fallback...');
    const fallbackData = await tavilySearch({
      query: `${movieTitle} film poster image`,
      maxResults: 5,
      includeImages: true,
    });
    
    posterUrl = extractPosterUrl(fallbackData);
  }

  if (!posterUrl) {
    throw new Error('No poster image found in search results');
  }

  console.log('Found movie poster URL:', posterUrl);
  return posterUrl;
}

/**
 * Extract poster URL from Tavily search results
 */
function extractPosterUrl(data: TavilyResponse): string {
  // Check images array
  if (data.images && data.images.length > 0) {
    console.log(`Found ${data.images.length} images in search`);
    
    for (const image of data.images) {
      const imageUrl = image.url || '';
      const imageDesc = image.description || '';
      const combined = (imageUrl + ' ' + imageDesc).toLowerCase();
      
      // Filter for actual posters, exclude behind-the-scenes
      if (combined.includes('poster') && 
          !combined.includes('behind the scenes') && 
          !combined.includes('still')) {
        console.log('Found poster in images array:', imageUrl);
        return imageUrl;
      }
    }
    
    // Use first image if no poster-specific found
    if (data.images[0]?.url) {
      console.log('Using first image from images array:', data.images[0].url);
      return data.images[0].url;
    }
  }

  // Check results for img_url
  if (data.results && data.results.length > 0) {
    for (const result of data.results) {
      if (result.img_url) {
        console.log('Found poster in results:', result.img_url);
        return result.img_url;
      }
    }
  }

  return '';
}

/**
 * Search for movies by mood/genre
 */
export async function searchMoviesByGenre(moodOrGenre: string): Promise<TavilyResult[]> {
  console.log('Searching for movies with Tavily:', moodOrGenre);

  const searchData = await tavilySearch({
    query: `best ${moodOrGenre} movies 2020 2021 2022 2023 2024 top rated recommendations`,
    maxResults: 10,
    searchDepth: 'basic',
  });

  if (searchData.results && searchData.results.length > 0) {
    console.log(`Found ${searchData.results.length} movies from Tavily search`);
    return searchData.results;
  }

  return [];
}
