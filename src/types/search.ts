export type SearchLanguage = 'en' | 'hi' | 'all';

export type SearchMode = 'all' | 'ai' | 'images' | 'news' | 'videos' | 'maps' | 'shopping';

export type QueryIntentCategory = 'evergreen' | 'news' | 'time_sensitive' | 'local' | 'technical' | 'general';

export interface SourceMetadata {
  id: number;
  title: string;
  url: string;
  domain: string;
  publicationDate?: string;
  author?: string;
  faviconUrl?: string;
  reliabilityScore?: number;
}

export interface WebSearchResult {
  id: string;
  title: string;
  url: string;
  domain: string;
  snippet: string;
  publicationDate?: string;
  thumbnailUrl?: string;
  sourceCategory?: string;
}

export interface CitationItem {
  index: number;
  sourceId: number;
  source: SourceMetadata;
}

export interface AIAnswerData {
  text: string;
  citations: CitationItem[];
  suggestedFollowUps: string[];
  confidence: 'high' | 'medium' | 'uncertain';
  disclaimer?: string;
  answeredAt: string;
}

export interface SearchResponse {
  query: string;
  normalizedQuery: string;
  language: 'en' | 'hi';
  detectedIntent: QueryIntentCategory;
  mode: SearchMode;
  answer?: AIAnswerData;
  results: WebSearchResult[];
  sources: SourceMetadata[];
  cacheHit: boolean;
  freshness: 'fresh' | 'cached' | 'revalidated';
  fetchedAt: string;
  provider: string;
  totalResults: number;
  executionTimeMs: number;
  regionalContext?: string;
}

export interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: number;
  language: string;
  resultCount: number;
}

export interface BookmarkItem {
  id: string;
  title: string;
  url: string;
  domain: string;
  snippet: string;
  savedAt: number;
  notes?: string;
}

export interface TrendingTopic {
  id: string;
  query: string;
  category: 'cricket' | 'tech' | 'national' | 'entertainment' | 'finance';
  tag: string;
  language: 'en' | 'hi';
}
