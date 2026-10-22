import { createHash } from 'node:crypto';
import { QueryIntentCategory } from '../types/search.js';

/**
 * Normalizes user query:
 * - Trims unnecessary whitespace and collapses multiple spaces
 * - Performs Unicode NFKC normalization
 * - Preserves Hindi / Indian regional scripts while lowercasing latin text
 * - Cleans trailing punctuation
 */
export function normalizeQuery(query: string): string {
  if (!query) return '';
  // Unicode NFKC normalization
  let normalized = query.normalize('NFKC').trim();
  // Collapse whitespace
  normalized = normalized.replace(/\s+/g, ' ');
  // Lowercase latin characters only, preserving Devanagari/regional characters
  normalized = normalized.toLowerCase();
  // Strip trailing question marks and exclamation marks for cache consistency,
  // but keep the core words
  normalized = normalized.replace(/[?!]+$/g, '').trim();
  return normalized;
}

/**
 * Detects whether the query is primarily in Hindi (Devanagari range) or English.
 */
export function detectQueryLanguage(query: string): 'hi' | 'en' {
  if (!query) return 'en';
  // Devanagari Unicode range: \u0900-\u097F
  const devanagariRegex = /[\u0900-\u097F]/;
  return devanagariRegex.test(query) ? 'hi' : 'en';
}

/**
 * Classifies search intent to determine freshness requirements and caching TTL.
 */
export function classifyQueryIntent(query: string): QueryIntentCategory {
  const q = normalizeQuery(query);

  // Time-sensitive / live info: scores, gold rates, live prices, weather, current time, petrol rate
  const livePatterns = [
    /\b(score|live|match|ipl|vs|wicket|gold rate|petrol price|diesel price|weather|temperature|stock price|sensex|nifty|today)\b/i,
    /(स्कोर|लाइव|सोने का भाव|पेट्रोल|मौसम|तापमान|आज का)/
  ];
  if (livePatterns.some(p => p.test(q))) {
    return 'time_sensitive';
  }

  // News and current events
  const newsPatterns = [
    /\b(news|breaking|update|latest|election|pm modi|isro|budget 2026|budget|cabinet)\b/i,
    /(समाचार|ताजा खबर|न्यूज|चुनाव|अपडेट)/
  ];
  if (newsPatterns.some(p => p.test(q))) {
    return 'news';
  }

  // Local / Places / Indian businesses
  const localPatterns = [
    /\b(near me|restaurants in|hospital in|places to visit|cafes in|station|metro|hotel in|bangalore|delhi|mumbai|chennai|hyderabad|pune|kolkata|jaipur)\b/i,
    /(पास में|कहाँ है|दुकान|होटल|घूमने की जगह)/
  ];
  if (localPatterns.some(p => p.test(q))) {
    return 'local';
  }

  // Technical / documentation
  const techPatterns = [
    /\b(api|documentation|sdk|tutorial|how to code|python|flutter|dart|react|algorithm|code)\b/i
  ];
  if (techPatterns.some(p => p.test(q))) {
    return 'technical';
  }

  // Evergreen knowledge
  const evergreenPatterns = [
    /\b(history of|who is|what is|meaning of|how does|why is|capital of|founder of|formula|origin of)\b/i,
    /(क्या है|इतिहास|कौन है|अर्थ|कैसे काम करता है)/
  ];
  if (evergreenPatterns.some(p => p.test(q))) {
    return 'evergreen';
  }

  return 'general';
}

/**
 * Deterministically generates a SHA-256 cache key from normalized parameters.
 */
export function generateCacheKey(
  query: string,
  mode = 'all',
  language = 'en',
  region = 'IN'
): string {
  const normalized = normalizeQuery(query);
  const rawKey = `${region}:${language}:${mode}:${normalized}`;
  return createHash('sha256').update(rawKey).digest('hex').substring(0, 32);
}
