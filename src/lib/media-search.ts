/**
 * Shared types/constants for cross-source media search (movies + TV + animation).
 *
 * Kept out of the `'use server'` action file because Next.js only allows async
 * function exports from a "use server" module.
 */

import type { MediaItem } from './media';

export interface MediaSearchResult {
  items: MediaItem[];
  /** True when BOTH sources were unreachable (network/DNS block). */
  unavailable: boolean;
}

export const EMPTY_MEDIA_SEARCH: MediaSearchResult = { items: [], unavailable: false };
export const UNAVAILABLE_MEDIA_SEARCH: MediaSearchResult = { items: [], unavailable: true };
