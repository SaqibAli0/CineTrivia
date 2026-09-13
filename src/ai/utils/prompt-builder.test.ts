import { describe, it, expect } from 'vitest';
import { buildRecommendationPrompt } from './prompt-builder';

describe('buildRecommendationPrompt — media type wording', () => {
  it('defaults to movie wording', () => {
    const p = buildRecommendationPrompt({ tavilyResults: [], excludeList: [] });
    expect(p).toContain('movie expert');
    expect(p).toContain('ONE excellent movie');
  });

  it('uses TV wording for mediaType tv', () => {
    const p = buildRecommendationPrompt({ mediaType: 'tv' });
    expect(p).toContain('television expert');
    expect(p).toContain('ONE excellent TV show');
    expect(p).toContain('first-air year');
  });

  it('uses animation wording for mediaType animation', () => {
    const p = buildRecommendationPrompt({ mediaType: 'animation' });
    expect(p).toContain('animation and anime expert');
    expect(p).toContain('animated');
    expect(p).toContain('It must be animated');
  });

  it('includes the exclude list', () => {
    const p = buildRecommendationPrompt({ mediaType: 'tv', excludeList: ['Lost (2004)'] });
    expect(p).toContain('Lost (2004)');
  });
});
