import { QueryIntentCategory, SourceMetadata, CitationItem } from '../types/search.js';

export interface CacheEntry<T> {
  key: string;
  data: T;
  createdAt: number;
  expiresAt: number;
  category: QueryIntentCategory;
  version: number;
}

export const CACHE_DURATIONS_MS: Record<QueryIntentCategory, number> = {
  // Evergreen knowledge: 14 days
  evergreen: 14 * 24 * 60 * 60 * 1000,
  // Technical documentation: 3 days
  technical: 3 * 24 * 60 * 60 * 1000,
  // News and current events: 15 minutes
  news: 15 * 60 * 1000,
  // Live scores, prices, weather: 2 minutes
  time_sensitive: 2 * 60 * 1000,
  // Local discovery & businesses: 7 days
  local: 7 * 24 * 60 * 60 * 1000,
  // General fallback: 1 day
  general: 24 * 60 * 60 * 1000,
};

/**
 * Calculates expiration timestamp based on query intent.
 */
export function calculateExpirationTimestamp(
  category: QueryIntentCategory,
  currentTime = Date.now()
): number {
  const duration = CACHE_DURATIONS_MS[category] ?? CACHE_DURATIONS_MS.general;
  return currentTime + duration;
}

/**
 * Evaluates whether a cached item is still fresh.
 */
export function isCacheFresh(expiresAt: number, currentTime = Date.now()): boolean {
  return currentTime < expiresAt;
}

/**
 * Extracts inline citation markers from text (e.g. "[1]", "[2]") and verifies they correspond
 * to valid sources in the provided sources list.
 * Strips or repairs fabricated citations that exceed the source count.
 */
export function validateAndMapCitations(
  answerText: string,
  sources: SourceMetadata[]
): {
  sanitizedText: string;
  citations: CitationItem[];
  validCount: number;
  invalidCount: number;
} {
  if (!answerText) {
    return { sanitizedText: '', citations: [], validCount: 0, invalidCount: 0 };
  }

  const citationsMap = new Map<number, CitationItem>();
  let validCount = 0;
  let invalidCount = 0;

  // Match bracketed numbers like [1], [2], [1, 2]
  const citationRegex = /\[(\d+(?:\s*,\s*\d+)*)\]/g;

  const sanitizedText = answerText.replace(citationRegex, (fullMatch, numberGroup) => {
    const numbers = numberGroup.split(',').map((s: string) => parseInt(s.trim(), 10));
    const validNumbers: number[] = [];

    for (const num of numbers) {
      if (num >= 1 && num <= sources.length) {
        validNumbers.push(num);
        validCount++;
        if (!citationsMap.has(num)) {
          citationsMap.set(num, {
            index: num,
            sourceId: sources[num - 1].id,
            source: sources[num - 1],
          });
        }
      } else {
        invalidCount++;
      }
    }

    if (validNumbers.length === 0) {
      return ''; // Strip fabricated reference
    }
    return `[${validNumbers.join(', ')}]`;
  });

  const sortedCitations = Array.from(citationsMap.values()).sort((a, b) => a.index - b.index);

  return {
    sanitizedText: sanitizedText.trim(),
    citations: sortedCitations,
    validCount,
    invalidCount,
  };
}
