import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeQuery,
  detectQueryLanguage,
  classifyQueryIntent,
  generateCacheKey,
} from './normalizer.ts';
import {
  calculateExpirationTimestamp,
  isCacheFresh,
  validateAndMapCitations,
  CACHE_DURATIONS_MS,
} from './cachePolicy.ts';
import { SourceMetadata } from '../types/search.ts';

test('normalizeQuery cleans whitespace, converts latin to lowercase, and preserves Hindi', () => {
  assert.equal(
    normalizeQuery('   Chandrayaan 3 Mission Details ???  '),
    'chandrayaan 3 mission details'
  );
  assert.equal(
    normalizeQuery('  भारत के 10 सुंदर पर्यटन स्थल ! '),
    'भारत के 10 सुंदर पर्यटन स्थल'
  );
  assert.equal(
    normalizeQuery('UPI  123Pay   RBI guidelines?'),
    'upi 123pay rbi guidelines'
  );
});

test('detectQueryLanguage identifies Hindi vs English correctly', () => {
  assert.equal(detectQueryLanguage('What is UPI?'), 'en');
  assert.equal(detectQueryLanguage('यूपीआई क्या है?'), 'hi');
  assert.equal(detectQueryLanguage('Bengaluru tech hub'), 'en');
  assert.equal(detectQueryLanguage('दिल्ली के प्रमुख समाचार'), 'hi');
});

test('classifyQueryIntent categorizes queries based on time sensitivity and topic', () => {
  assert.equal(classifyQueryIntent('IPL match live score today'), 'time_sensitive');
  assert.equal(classifyQueryIntent('सोने का भाव आज'), 'time_sensitive');
  assert.equal(classifyQueryIntent('latest election results news India'), 'news');
  assert.equal(classifyQueryIntent('best south Indian restaurants in Bengaluru'), 'local');
  assert.equal(classifyQueryIntent('history of Nalanda University'), 'evergreen');
  assert.equal(classifyQueryIntent('flutter dio client tutorial'), 'technical');
});

test('generateCacheKey produces deterministic, 32-character hashes', () => {
  const key1 = generateCacheKey('best cafes in Delhi', 'all', 'en', 'IN');
  const key2 = generateCacheKey('  BEST CAFES IN DELHI? ', 'all', 'en', 'IN');
  assert.equal(key1, key2);
  assert.equal(key1.length, 32);

  const keyDifferentLang = generateCacheKey('best cafes in Delhi', 'all', 'hi', 'IN');
  assert.notEqual(key1, keyDifferentLang);
});

test('calculateExpirationTimestamp applies intent-based TTLs', () => {
  const now = 1000000;
  const evergreenExp = calculateExpirationTimestamp('evergreen', now);
  assert.equal(evergreenExp - now, CACHE_DURATIONS_MS.evergreen);

  const newsExp = calculateExpirationTimestamp('news', now);
  assert.equal(newsExp - now, CACHE_DURATIONS_MS.news);

  const liveExp = calculateExpirationTimestamp('time_sensitive', now);
  assert.equal(liveExp - now, CACHE_DURATIONS_MS.time_sensitive);
});

test('isCacheFresh evaluates expiration properly', () => {
  const now = Date.now();
  assert.equal(isCacheFresh(now + 60000, now), true);
  assert.equal(isCacheFresh(now - 1000, now), false);
});

test('validateAndMapCitations keeps valid citations and strips fabricated out-of-bound citations', () => {
  const mockSources: SourceMetadata[] = [
    {
      id: 1,
      title: 'ISRO Official Portal',
      url: 'https://isro.gov.in',
      domain: 'isro.gov.in',
    },
    {
      id: 2,
      title: 'PIB India Press Release',
      url: 'https://pib.gov.in/release/123',
      domain: 'pib.gov.in',
    },
  ];

  const textWithValidAndInvalid =
    'The lunar mission successfully landed [1]. Preliminary telemetry confirmed payload activation [2]. Unverified claim [99].';

  const result = validateAndMapCitations(textWithValidAndInvalid, mockSources);

  assert.equal(result.validCount, 2);
  assert.equal(result.invalidCount, 1);
  assert.equal(result.citations.length, 2);
  assert.equal(result.citations[0].source.title, 'ISRO Official Portal');
  assert.equal(result.citations[1].source.title, 'PIB India Press Release');
  // Check that [99] was stripped out and didn't corrupt the answer
  assert.ok(!result.sanitizedText.includes('[99]'));
  assert.ok(result.sanitizedText.includes('[1]'));
  assert.ok(result.sanitizedText.includes('[2]'));
});
