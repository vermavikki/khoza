import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { handleSearchRequest } from './search/searchController';
import { cleanupExpiredCache } from './search/cacheService';

admin.initializeApp();

/**
 * Callable HTTPS Cloud Function for Khoza Android Client
 */
export const searchKhoza = functions
  .region('asia-south1') // Mumbai region for lowest Indian latency
  .runWith({
    timeoutSeconds: 30,
    memory: '512MB',
  })
  .https.onCall(async (data, context) => {
    return handleSearchRequest(data, context);
  });

/**
 * Scheduled cron job to purge stale cache entries daily at midnight IST
 */
export const purgeExpiredCache = functions
  .region('asia-south1')
  .pubsub.schedule('0 0 * * *')
  .timeZone('Asia/Kolkata')
  .onRun(async () => {
    await cleanupExpiredCache();
  });
