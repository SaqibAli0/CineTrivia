/**
 * Recommendation Cache Service
 * Tracks previously recommended movies to avoid repeats
 */

const MAX_CACHE_SIZE = 50;

class RecommendationCache {
  private cache: Set<string>;

  constructor() {
    this.cache = new Set<string>();
  }

  /**
   * Add a movie to the cache
   */
  add(title: string, year: number): void {
    const key = this.createKey(title, year);
    this.cache.add(key);
    
    // Maintain cache size limit
    if (this.cache.size > MAX_CACHE_SIZE) {
      const oldest = this.cache.values().next().value;
      if (oldest) {
        this.cache.delete(oldest);
      }
    }
  }

  /**
   * Get list of recently recommended movies
   */
  getRecentMovies(): string[] {
    return Array.from(this.cache);
  }

  /**
   * Check if a movie was recently recommended
   */
  wasRecentlyRecommended(title: string, year: number): boolean {
    return this.cache.has(this.createKey(title, year));
  }

  /**
   * Get cache size
   */
  getSize(): number {
    return this.cache.size;
  }

  /**
   * Clear the cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Create unique key for movie
   */
  private createKey(title: string, year: number): string {
    return `${title.toLowerCase()} (${year})`;
  }
}

// Singleton instance
export const recommendationCache = new RecommendationCache();
