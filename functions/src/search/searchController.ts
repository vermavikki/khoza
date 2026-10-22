import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { normalizeQuery, detectLanguage, classifyIntent, generateDeterministicCacheKey } from './resultNormalizer';
import { getCachedSearchResponse, saveSearchToCache } from './cacheService';
import { executeWebSearch } from './searchProvider';
import { generateCitedAIAnswer } from '../ai/answerGenerator';

const db = admin.firestore();

export async function handleSearchRequest(data: any, context: functions.https.CallableContext) {
  const startTime = Date.now();
  const query = data.query;
  const preferredLang = data.language;
  const mode = data.mode || 'all';
  const forceFresh = Boolean(data.forceFresh);

  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Search query cannot be empty.');
  }

  if (query.length > 500) {
    throw new functions.https.HttpsError('invalid-argument', 'Query exceeds limit of 500 characters.');
  }

  // 1. Query normalization and language detection
  const normalizedQuery = normalizeQuery(query);
  const detectedLanguage = preferredLang || detectLanguage(query);
  const intent = classifyIntent(normalizedQuery);
  const cacheKey = generateDeterministicCacheKey(normalizedQuery, mode, detectedLanguage);

  // 2. Check Firestore cache if not forcing fresh
  if (!forceFresh) {
    const cachedData = await getCachedSearchResponse(cacheKey);
    if (cachedData) {
      // Record private user history if authenticated
      if (context.auth?.uid) {
        await recordUserHistory(context.auth.uid, query, normalizedQuery, detectedLanguage, true);
      }
      return {
        ...cachedData,
        cacheHit: true,
        freshness: 'cached',
        executionTimeMs: Date.now() - startTime,
      };
    }
  }

  // 3. Search Provider API Execution (with fallback)
  const webResults = await executeWebSearch(query, detectedLanguage);

  // 4. Map sources metadata
  const sources = webResults.map((r, i) => ({
    id: i + 1,
    title: r.title,
    url: r.url,
    domain: r.domain,
    publicationDate: r.publicationDate,
  }));

  // 5. Generate AI cited answer
  let answer: any = null;
  if (mode === 'all' || mode === 'ai') {
    answer = await generateCitedAIAnswer(query, sources, detectedLanguage, intent);
  }

  const response = {
    query,
    normalizedQuery,
    language: detectedLanguage,
    detectedIntent: intent,
    mode,
    answer,
    results: webResults,
    sources,
    cacheHit: false,
    freshness: 'fresh',
    fetchedAt: new Date().toISOString(),
    provider: 'Khoza Multi-Provider Orchestrator',
    totalResults: webResults.length,
    executionTimeMs: Date.now() - startTime,
  };

  // 6. Asynchronously save to Firestore search_cache
  await saveSearchToCache(cacheKey, response, intent);

  // 7. Record private user search history if user is signed in
  if (context.auth?.uid) {
    await recordUserHistory(context.auth.uid, query, normalizedQuery, detectedLanguage, false);
  }

  return response;
}

async function recordUserHistory(
  uid: string,
  query: string,
  normalizedQuery: string,
  language: string,
  cacheHit: boolean
) {
  try {
    await db
      .collection('users')
      .doc(uid)
      .collection('search_history')
      .add({
        query,
        normalizedQuery,
        language,
        cacheHit,
        searchedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
  } catch (err) {
    console.error('Failed to log private user search history:', err);
  }
}
