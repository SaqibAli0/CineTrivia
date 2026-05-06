// Configuration
export { ai, MODELS } from './config';

// Types
export * from './types';

// Flows
export { recommendMovie } from './flows/movie-recommendation';
export { generateMoviePoster } from './flows/generate-movie-poster';
export { movieFunFact } from './flows/movie-fun-fact';

// Services
export { recommendationCache } from './services/recommendation-cache';
export { searchMoviePoster, searchMoviesByGenre } from './services/tavily';
export { funFactCache, posterUrlCache, recommendationResponseCache } from './services/cache';

// Utilities
export { buildRecommendationPrompt, buildTavilyContext, buildExcludeList } from './utils/prompt-builder';
