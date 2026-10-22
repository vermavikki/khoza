import * as admin from 'firebase-admin';

const db = admin.firestore();
const CACHE_COLLECTION = 'search_cache';

const TTL_MS: Record<string, number> = {
  evergreen: 14 * 24 * 60 * 60 * 1000,
  technical: 3 * 24 * 60 * 60 * 1000,
  news: 15 * 60 * 1000,
  time_sensitive: 2 * 60 * 1000,
  local: 7 * 24 * 60 * 60 * 1000,
  general: 24 * 60 * 60 * 1000,
};

export async function getCachedSearchResponse(cacheKey: string): Promise<any | null> {
  try {
    const doc = await db.collection(CACHE_COLLECTION).doc(cacheKey).get();
    if (!doc.exists) return null;

    const data = doc.data();
    if (!data) return null;

    const expiresAt = data.expiresAt?.toMillis ? data.expiresAt.toMillis() : data.expiresAt;
    if (Date.now() > expiresAt) {
      return null; // Expired
    }

    return data.responsePayload;
  } catch (error) {
    console.error('Firestore cache lookup error:', error);
    return null;
  }
}

export async function saveSearchToCache(cacheKey: string, payload: any, intent: string): Promise<void> {
  try {
    const ttl = TTL_MS[intent] ?? TTL_MS.general;
    const expiresAtMillis = Date.now() + ttl;

    await db.collection(CACHE_COLLECTION).doc(cacheKey).set({
      normalizedQuery: payload.normalizedQuery,
      language: payload.language,
      category: intent,
      responsePayload: payload,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt: admin.firestore.Timestamp.fromMillis(expiresAtMillis),
      cacheVersion: 1,
    });
  } catch (error) {
    console.error('Failed to write search response to Firestore cache:', error);
  }
}

export async function cleanupExpiredCache(): Promise<number> {
  try {
    const now = admin.firestore.Timestamp.now();
    const snapshot = await db
      .collection(CACHE_COLLECTION)
      .where('expiresAt', '<', now)
      .limit(500)
      .get();

    const batch = db.batch();
    snapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();

    return snapshot.size;
  } catch (error) {
    console.error('Cache cleanup error:', error);
    return 0;
  }
}
