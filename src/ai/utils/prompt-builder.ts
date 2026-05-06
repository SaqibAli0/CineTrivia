/**
 * Prompt Builder
 *
 * Constructs the system prompt for movie recommendations
 * using optional Tavily search context and an exclusion list
 * of recently recommended titles.
 */

import { TavilyResult } from '../services/tavily';

interface PromptContext {
  tavilyResults?: TavilyResult[];
  excludeList?: string[];
}

export function buildTavilyContext(results: TavilyResult[]): string {
  if (results.length === 0) return '';

  const list = results
    .map((r, i) => `${i + 1}. ${r.title} — ${r.content}`)
    .join('\n');

  return `Here are some real movies from recent search results:\n${list}\n\n`;
}

export function buildExcludeList(movies: string[]): string {
  if (movies.length === 0) return '';
  return `\nDo NOT recommend any of these (already suggested): ${movies.join(', ')}\n`;
}

export function buildRecommendationPrompt(context: PromptContext): string {
  const tavilyContext = buildTavilyContext(context.tavilyResults || []);
  const excludeList = buildExcludeList(context.excludeList || []);
  const hasContext = (context.tavilyResults?.length || 0) > 0;

  return `You are a movie expert. Recommend ONE excellent movie based on the user's mood or genre preference.

${tavilyContext}${hasContext ? 'You may pick from the search results above or recommend any other great movie that fits.' : 'Recommend any excellent movie that fits the criteria.'}

Provide accurate information: real title, correct year, genre, a compelling 2-3 sentence description, rating out of 10, and age rating.
${excludeList}
Recommend a DIFFERENT movie each time. Be creative.

Mood or Genre: {{{moodOrGenre}}}
`;
}
