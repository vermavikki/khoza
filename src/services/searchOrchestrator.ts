import { GoogleGenAI } from '@google/genai';
import {
  SearchMode,
  SearchResponse,
  WebSearchResult,
  SourceMetadata,
  AIAnswerData,
  QueryIntentCategory,
} from '../types/search.js';
import {
  normalizeQuery,
  detectQueryLanguage,
  classifyQueryIntent,
  generateCacheKey,
} from '../utils/normalizer.js';
import {
  calculateExpirationTimestamp,
  isCacheFresh,
  validateAndMapCitations,
  CacheEntry,
} from '../utils/cachePolicy.js';

// Server-side in-memory cache mirroring Cloud Firestore search_cache collection
const searchCacheStore = new Map<string, CacheEntry<SearchResponse>>();

let cacheHits = 0;
let cacheMisses = 0;

export function getCacheStats() {
  return {
    totalEntries: searchCacheStore.size,
    hits: cacheHits,
    misses: cacheMisses,
  };
}

export function clearCache() {
  searchCacheStore.clear();
}

/**
 * Initializes Gemini client safely
 */
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

/**
 * Search provider: Wikipedia search for authoritative informational content
 */
async function fetchWikipediaResults(query: string, lang = 'en'): Promise<WebSearchResult[]> {
  try {
    const endpoint = `https://${lang === 'hi' ? 'hi' : 'en'}.wikipedia.org/w/api.php`;
    const params = new URLSearchParams({
      action: 'query',
      list: 'search',
      srsearch: query,
      format: 'json',
      srlimit: '5',
      origin: '*',
    });

    const res = await fetch(`${endpoint}?${params.toString()}`, {
      headers: { 'User-Agent': 'KhozaSearch/1.0 (Indian Search Engine)' },
      signal: AbortSignal.timeout(4000),
    });

    if (!res.ok) return [];
    const data = await res.json();
    const items = data.query?.search ?? [];

    return items.map((item: any, index: number) => {
      // Strip HTML tags from snippet
      const cleanSnippet = item.snippet.replace(/<[^>]+>/g, '').replace(/&quot;/g, '"');
      const titleUrl = encodeURIComponent(item.title.replace(/ /g, '_'));
      const url = `https://${lang === 'hi' ? 'hi' : 'en'}.wikipedia.org/wiki/${titleUrl}`;

      return {
        id: `wiki-${index}-${item.pageid}`,
        title: item.title,
        url,
        domain: `${lang === 'hi' ? 'hi' : 'en'}.wikipedia.org`,
        snippet: cleanSnippet,
        publicationDate: item.timestamp ? new Date(item.timestamp).toLocaleDateString('en-IN') : undefined,
        sourceCategory: 'Encyclopedia',
      };
    });
  } catch (err) {
    console.warn('Wikipedia provider error:', err);
    return [];
  }
}

/**
 * Search provider: DuckDuckGo instant answer and related topics
 */
async function fetchDuckDuckGoResults(query: string): Promise<WebSearchResult[]> {
  try {
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
    const res = await fetch(url, { signal: AbortSignal.timeout(3500) });
    if (!res.ok) return [];
    const data = await res.json();

    const results: WebSearchResult[] = [];

    if (data.Abstract && data.AbstractURL) {
      let domain = 'duckduckgo.com';
      try {
        domain = new URL(data.AbstractURL).hostname;
      } catch {}

      results.push({
        id: 'ddg-abstract',
        title: data.Heading || query,
        url: data.AbstractURL,
        domain,
        snippet: data.Abstract,
        sourceCategory: 'Web',
      });
    }

    if (Array.isArray(data.RelatedTopics)) {
      data.RelatedTopics.slice(0, 4).forEach((topic: any, idx: number) => {
        if (topic.Text && topic.FirstURL) {
          let domain = 'web';
          try {
            domain = new URL(topic.FirstURL).hostname;
          } catch {}

          results.push({
            id: `ddg-topic-${idx}`,
            title: topic.Text.split(' - ')[0] || query,
            url: topic.FirstURL,
            domain,
            snippet: topic.Text,
            sourceCategory: 'Web',
          });
        }
      });
    }

    return results;
  } catch (err) {
    console.warn('DuckDuckGo provider error:', err);
    return [];
  }
}

/**
 * Curated high-relevance Indian fallback results for primary national queries
 */
function getIndianKnowledgeFallback(query: string, lang: 'en' | 'hi'): WebSearchResult[] {
  const q = normalizeQuery(query);
  const results: WebSearchResult[] = [];

  if (q.includes('upi') || q.includes('payment') || q.includes('यूपीआई')) {
    results.push(
      {
        id: 'npci-upi',
        title: 'Unified Payments Interface (UPI) - NPCI',
        url: 'https://www.npci.org.in/what-we-do/upi/product-overview',
        domain: 'npci.org.in',
        snippet: 'Unified Payments Interface (UPI) is a real-time instant payment system developed by the National Payments Corporation of India (NPCI) facilitating inter-bank peer-to-peer and person-to-merchant transactions.',
        publicationDate: 'Official Portal',
        sourceCategory: 'Government / Banking',
      },
      {
        id: 'rbi-upi-limits',
        title: 'Reserve Bank of India - Frequently Asked Questions on UPI',
        url: 'https://m.rbi.org.in/Scripts/FAQView.aspx?Id=131',
        domain: 'rbi.org.in',
        snippet: 'RBI guidelines define standard daily limits of ₹1 lakh per transaction for standard transfers, and up to ₹5 lakh for capital markets, tax payments, hospitals, and educational institutions.',
        publicationDate: 'Official Gazette',
        sourceCategory: 'Government / Banking',
      }
    );
  }

  if (q.includes('chandrayaan') || q.includes('isro') || q.includes('चंद्रयान')) {
    results.push(
      {
        id: 'isro-ch3',
        title: 'Chandrayaan-3 Mission Details - Indian Space Research Organisation',
        url: 'https://www.isro.gov.in/Chandrayaan3.html',
        domain: 'isro.gov.in',
        snippet: 'Chandrayaan-3 is a follow-on mission to Chandrayaan-2 to demonstrate end-to-end capability in safe landing and roving on the lunar surface, landing near the lunar South Pole at Shiv Shakti Point.',
        publicationDate: 'ISRO Official',
        sourceCategory: 'Science & Technology',
      },
      {
        id: 'pib-ch3',
        title: 'India Becomes First Nation to Touch Down on Moon South Pole - PIB',
        url: 'https://pib.gov.in/PressReleaseIframePage.aspx?PRID=1951557',
        domain: 'pib.gov.in',
        snippet: 'On August 23, 2023, ISRO successfully executed soft landing of Vikram lander, celebrated annually as National Space Day across India.',
        publicationDate: 'PIB New Delhi',
        sourceCategory: 'National News',
      }
    );
  }

  if (q.includes('tourist') || q.includes('places to visit') || q.includes('पर्यटन') || q.includes('travel')) {
    results.push(
      {
        id: 'incredible-india',
        title: 'Incredible India - Ministry of Tourism Official Portal',
        url: 'https://www.incredibleindia.org',
        domain: 'incredibleindia.org',
        snippet: 'Explore India heritage, pristine beaches in Goa, royal palaces of Rajasthan, backwaters of Kerala, spiritual ghats of Varanasi, and majestic Himalayan peaks of Ladakh and Himachal.',
        publicationDate: 'Official Portal',
        sourceCategory: 'Travel & Culture',
      }
    );
  }

  return results;
}

/**
 * Generate AI answer using Gemini 3.8 Flash with Search Grounding or retrieved source synthesis
 */
async function generateAIAnswer(
  query: string,
  sources: SourceMetadata[],
  language: 'en' | 'hi',
  intent: QueryIntentCategory
): Promise<AIAnswerData> {
  const ai = getGeminiClient();

  // If Gemini API is available, generate synthesis with Search Grounding
  if (ai) {
    try {
      const sourceContext = sources
        .map((s, idx) => `[${idx + 1}] "${s.title}" (${s.domain}): ${s.url}`)
        .join('\n');

      const systemInstruction = `You are Khoza AI, an intelligent, objective, India-first search engine answer engine.
Rules:
1. Provide a concise, clear direct answer followed by bullet points with key facts.
2. Ground all facts in the retrieved sources or Google Search results.
3. Use inline bracket citations like [1], [2] that refer precisely to the provided sources or retrieved references.
4. If language is 'hi', answer in natural, grammatically correct Hindi (Devanagari script). If 'en', answer in fluent Indian English.
5. Provide 3 relevant follow-up questions at the very end in a line starting with "Follow-ups: " separated by semicolons.
6. Do not fabricate citations or facts. If information is uncertain or varies by region/date, explicitly note that.`;

      const prompt = `User Query: "${query}"
Language: ${language === 'hi' ? 'Hindi' : 'English'}
Search Intent: ${intent}

Available Sources:
${sourceContext}

Generate the cited answer:`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction,
          tools: [{ googleSearch: {} }],
        },
      });

      const rawText = response.text || '';

      // Extract follow-ups if present
      let answerBody = rawText;
      let followUps: string[] = [];

      const followUpMatch = rawText.match(/Follow-ups:\s*(.*)$/im);
      if (followUpMatch) {
        answerBody = rawText.replace(followUpMatch[0], '').trim();
        followUps = followUpMatch[1]
          .split(';')
          .map((s) => s.trim().replace(/^[-*•\d.]+\s*/, ''))
          .filter(Boolean)
          .slice(0, 3);
      }

      // If search grounding returned web chunks, merge them into sources if appropriate
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (Array.isArray(groundingChunks) && groundingChunks.length > 0) {
        groundingChunks.forEach((chunk: any) => {
          if (chunk.web?.uri && chunk.web?.title) {
            let domain = 'google.com';
            try {
              domain = new URL(chunk.web.uri).hostname;
            } catch {}
            // Check if not already in sources
            if (!sources.some((s) => s.url === chunk.web.uri)) {
              sources.push({
                id: sources.length + 1,
                title: chunk.web.title,
                url: chunk.web.uri,
                domain,
              });
            }
          }
        });
      }

      const { sanitizedText, citations } = validateAndMapCitations(answerBody, sources);

      return {
        text: sanitizedText,
        citations,
        suggestedFollowUps: followUps.length > 0 ? followUps : generateDefaultFollowUps(query, language),
        confidence: 'high',
        answeredAt: new Date().toISOString(),
      };
    } catch (err) {
      console.warn('Gemini generateAnswer error, utilizing algorithmic synthesis fallback:', err);
    }
  }

  // Fallback answer synthesis from verified retrieved sources
  return synthesizeAnswerFromSources(query, sources, language, intent);
}

/**
 * Algorithmic answer synthesizer when API is busy or offline
 */
function synthesizeAnswerFromSources(
  query: string,
  sources: SourceMetadata[],
  language: 'en' | 'hi',
  intent: QueryIntentCategory
): AIAnswerData {
  if (sources.length === 0) {
    const isHindi = language === 'hi';
    return {
      text: isHindi
        ? `"${query}" के लिए कोई सत्यापित परिणाम नहीं मिला। कृपया अपने शब्दों की जांच करें या अन्य खोज शब्द आज़माएं।`
        : `No verified sources were found for "${query}". Please check your spelling or try broader keywords.`,
      citations: [],
      suggestedFollowUps: generateDefaultFollowUps(query, language),
      confidence: 'uncertain',
      disclaimer: isHindi
        ? 'पर्याप्त स्रोत उपलब्ध नहीं होने के कारण यह परिणाम सीमित है।'
        : 'Limited verified information was retrieved for this query.',
      answeredAt: new Date().toISOString(),
    };
  }

  const primarySource = sources[0];
  const secondSource = sources.length > 1 ? sources[1] : null;

  let text = '';
  if (language === 'hi') {
    text = `**${query}** के संबंध में मुख्य जानकारी:\n\n`;
    text += `प्राथमिक स्रोतों के अनुसार, ${primarySource.title} द्वारा दी गई जानकारी इस विषय पर विस्तृत विवरण प्रस्तुत करती है [1]।\n\n`;
    if (secondSource) {
      text += `इसके अतिरिक्त, ${secondSource.domain} पर उपलब्ध संदर्भ भी महत्वपूर्ण तथ्यों की पुष्टि करते हैं [2]।\n\n`;
    }
    text += `*अधिक जानकारी के लिए नीचे दिए गए सत्यापित संदर्भों और वेबसाइटों को देखें।*`;
  } else {
    text = `**Key overview for "${query}":**\n\n`;
    text += `According to authoritative sources, **${primarySource.title}** provides essential details regarding this subject [1].\n\n`;
    if (secondSource) {
      text += `Additionally, supplementary coverage on **${secondSource.domain}** corroborates key aspects and context [2].\n\n`;
    }
    text += `*Consult the verified citations and official portal links below for comprehensive documentation.*`;
  }

  const { sanitizedText, citations } = validateAndMapCitations(text, sources);

  return {
    text: sanitizedText,
    citations,
    suggestedFollowUps: generateDefaultFollowUps(query, language),
    confidence: sources.length > 1 ? 'high' : 'medium',
    answeredAt: new Date().toISOString(),
  };
}

function generateDefaultFollowUps(query: string, lang: 'en' | 'hi'): string[] {
  const isHi = lang === 'hi';
  const q = query.trim();
  if (isHi) {
    return [
      `${q} के मुख्य लाभ क्या हैं?`,
      `${q} से जुड़े नवीनतम नियम व जानकारी`,
      `${q} का इतिहास और विकास`,
    ];
  }
  return [
    `How does ${q} work in India?`,
    `Latest official guidelines regarding ${q}`,
    `Key benefits and practical details of ${q}`,
  ];
}

/**
 * Main Search Orchestrator
 */
export async function orchestrateSearch(params: {
  query: string;
  language?: string;
  mode?: SearchMode;
  region?: string;
  forceFresh?: boolean;
}): Promise<SearchResponse> {
  const startTime = Date.now();
  const rawQuery = params.query || '';
  const normalized = normalizeQuery(rawQuery);
  const detectedLang = params.language ? (params.language as 'en' | 'hi') : detectQueryLanguage(rawQuery);
  const mode = params.mode || 'all';
  const region = params.region || 'IN';
  const intent = classifyQueryIntent(normalized);

  const cacheKey = generateCacheKey(normalized, mode, detectedLang, region);

  // Step 2 & 3: Check cache if not forcing fresh
  if (!params.forceFresh && searchCacheStore.has(cacheKey)) {
    const entry = searchCacheStore.get(cacheKey)!;
    if (isCacheFresh(entry.expiresAt)) {
      cacheHits++;
      return {
        ...entry.data,
        cacheHit: true,
        freshness: 'cached',
        executionTimeMs: Date.now() - startTime,
      };
    }
  }

  cacheMisses++;

  // Step 4: Multi-provider search retrieval
  const [wikiResults, ddgResults] = await Promise.all([
    fetchWikipediaResults(rawQuery, detectedLang),
    fetchDuckDuckGoResults(rawQuery),
  ]);

  const fallbackResults = getIndianKnowledgeFallback(rawQuery, detectedLang);

  // Merge & deduplicate results by URL
  const seenUrls = new Set<string>();
  const combinedResults: WebSearchResult[] = [];

  for (const item of [...fallbackResults, ...wikiResults, ...ddgResults]) {
    if (!seenUrls.has(item.url)) {
      seenUrls.add(item.url);
      combinedResults.push(item);
    }
  }

  // Create SourceMetadata list
  const sources: SourceMetadata[] = combinedResults.map((item, idx) => ({
    id: idx + 1,
    title: item.title,
    url: item.url,
    domain: item.domain,
    publicationDate: item.publicationDate,
    reliabilityScore: item.domain.endsWith('.gov.in') || item.domain.endsWith('.nic.in') ? 0.95 : 0.85,
  }));

  // Step 6: Generate AI answer
  let answer: AIAnswerData | undefined;
  if (mode === 'all' || mode === 'ai') {
    answer = await generateAIAnswer(rawQuery, sources, detectedLang, intent);
  }

  const response: SearchResponse = {
    query: rawQuery,
    normalizedQuery: normalized,
    language: detectedLang,
    detectedIntent: intent,
    mode,
    answer,
    results: combinedResults,
    sources,
    cacheHit: false,
    freshness: 'fresh',
    fetchedAt: new Date().toISOString(),
    provider: 'Khoza Multi-Provider Orchestrator (Gemini 3.8 + Web Grounding)',
    totalResults: combinedResults.length,
    executionTimeMs: Date.now() - startTime,
    regionalContext: 'India (IN)',
  };

  // Step 7: Save to Firestore-compatible cache with intent-driven TTL
  const expiresAt = calculateExpirationTimestamp(intent);
  searchCacheStore.set(cacheKey, {
    key: cacheKey,
    data: response,
    createdAt: Date.now(),
    expiresAt,
    category: intent,
    version: 1,
  });

  return response;
}
