/**
 * Prompt Builder
 *
 * Constructs the system prompt for movie recommendations
 * using optional Tavily search context and an exclusion list
 * of recently recommended titles.
 */

import { TavilyResult } from '../services/tavily';
import type { MediaKind } from '@/ai/types';

interface PromptContext {
  tavilyResults?: TavilyResult[];
  excludeList?: string[];
  /** What to recommend. Defaults to 'movie' for backward compatibility. */
  mediaType?: MediaKind;
}

/** Human-readable noun + guidance for each media kind. */
function mediaWording(mediaType: MediaKind): { noun: string; expert: string; extra: string } {
  switch (mediaType) {
    case 'tv':
      return {
        noun: 'TV show',
        expert: 'a television expert',
        extra: 'Use the show\'s first-air year as the year.',
      };
    case 'animation':
      return {
        noun: 'animated title (an animated film or animated/anime series)',
        expert: 'an animation and anime expert',
        extra: 'It must be animated. Use the release or first-air year as the year.',
      };
    case 'movie':
    default:
      return { noun: 'movie', expert: 'a movie expert', extra: '' };
  }
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
  const { noun, expert, extra } = mediaWording(context.mediaType || 'movie');

  return `You are ${expert}. Recommend ONE excellent ${noun} based on the user's mood or genre preference.

${tavilyContext}${hasContext ? `You may pick from the search results above or recommend any other great ${noun} that fits.` : `Recommend any excellent ${noun} that fits the criteria.`}

Provide accurate information: real title, correct year, genre, a compelling 2-3 sentence description, rating out of 10, and age rating.${extra ? ` ${extra}` : ''}
${excludeList}
Recommend a DIFFERENT ${noun} each time. Be creative.

Mood or Genre: {{{moodOrGenre}}}
`;
}
