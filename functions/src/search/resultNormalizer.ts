import * as crypto from 'crypto';

export function normalizeQuery(query: string): string {
  if (!query) return '';
  return query
    .normalize('NFKC')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .replace(/[?!]+$/g, '');
}

export function detectLanguage(query: string): 'hi' | 'en' {
  if (!query) return 'en';
  return /[\u0900-\u097F]/.test(query) ? 'hi' : 'en';
}

export function classifyIntent(query: string): 'evergreen' | 'news' | 'time_sensitive' | 'local' | 'technical' | 'general' {
  const q = normalizeQuery(query);
  if (/(score|live|ipl|gold rate|petrol|weather|today|स्कोर|मौसम)/i.test(q)) {
    return 'time_sensitive';
  }
  if (/(news|latest|breaking|cabinet|isro|budget|समाचार|ताजा)/i.test(q)) {
    return 'news';
  }
  if (/(near me|restaurants|in bangalore|in delhi|in mumbai|होटल|कहाँ)/i.test(q)) {
    return 'local';
  }
  if (/(history of|what is|meaning of|क्या है|इतिहास)/i.test(q)) {
    return 'evergreen';
  }
  return 'general';
}

export function generateDeterministicCacheKey(query: string, mode: string, language: string): string {
  const raw = `IN:${language}:${mode}:${normalizeQuery(query)}`;
  return crypto.createHash('sha256').update(raw).digest('hex').substring(0, 32);
}
