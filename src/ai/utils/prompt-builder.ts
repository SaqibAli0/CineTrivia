/**
 * Prompt Builder Utilities
 * Helper functions for constructing AI prompts
 */

import { TavilyResult } from '../services/tavily';

interface PromptContext {
  tavilyResults?: TavilyResult[];
  excludeList?: string[];
}

/**
 * Build context string from Tavily search results
 */
export function buildTavilyContext(results: TavilyResult[]): string {
  if (results.length === 0) return '';

  const movieList = results
    .map((movie, index) => `${index + 1}. ${movie.title} - ${movie.content}`)
    .join('\n');

  return `Here are some real movies found from search results:\n${movieList}\n\n`;
}

/**
 * Build exclusion list string
 */
export function buildExcludeList(movies: string[]): string {
  if (movies.length === 0) return '';

  return `\nIMPORTANT: Do NOT recommend any of these movies (already recommended recently): ${movies.join(', ')}\n`;
}

/**
 * Build complete prompt for movie recommendation
 */
export function buildRecommendationPrompt(context: PromptContext): string {
  const tavilyContext = buildTavilyContext(context.tavilyResults || []);
  const excludeList = buildExcludeList(context.excludeList || []);
  const tavilyMention = context.tavilyResults && context.tavilyResults.length > 0 
    ? ' and the search results above' 
    : '';

  return `You are a movie expert. Recommend ONE excellent movie based on the specified mood or genre.

${tavilyContext}Based on the user's preference${tavilyMention}, choose the best movie recommendation.

If search results are provided, you can pick from them OR recommend any other excellent movie that fits the criteria.
Provide accurate information including the real title, year, genre, a compelling description, rating out of 10, and age rating.
${excludeList}
Make sure to recommend a DIFFERENT movie each time. Be creative and varied in your recommendations.

Mood or Genre: {{{moodOrGenre}}}
`;
}
