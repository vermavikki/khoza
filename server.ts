import express, { Request, Response } from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import {
  orchestrateSearch,
  getCacheStats,
  clearCache,
} from './src/services/searchOrchestrator.js';
import { TrendingTopic } from './src/types/search.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Curated trending topics for Indian search market
const TRENDING_TOPICS_INDIA: TrendingTopic[] = [
  { id: 't1', query: 'IPL 2026 Match Schedule & Teams', category: 'cricket', tag: 'Cricket', language: 'en' },
  { id: 't2', query: 'Chandrayaan 4 Mission Updates', category: 'tech', tag: 'ISRO', language: 'en' },
  { id: 't3', query: 'Union Budget 2026 Income Tax Slabs', category: 'finance', tag: 'Tax & Economy', language: 'en' },
  { id: 't4', query: 'यूपीआई 123पे बिना इंटरनेट भुगतान कैसे करें', category: 'finance', tag: 'Digital India', language: 'hi' },
  { id: 't5', query: 'AI Startup Ecosystem Bengaluru Hyderabad', category: 'tech', tag: 'Startups', language: 'en' },
  { id: 't6', query: 'भारत के प्रमुख सौर ऊर्जा और पवन ऊर्जा प्रोजेक्ट्स', category: 'national', tag: 'Green Energy', language: 'hi' },
  { id: 't7', query: 'Vande Bharat Express New Routes India', category: 'national', tag: 'Indian Railways', language: 'en' },
  { id: 't8', query: 'Best monsoon road trip destinations South India', category: 'entertainment', tag: 'Travel', language: 'en' },
];

/**
 * POST /api/search
 * Main search orchestration endpoint
 */
app.post('/api/search', async (req: Request, res: Response) => {
  try {
    const { query, language, mode, region, forceFresh } = req.body;
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      res.status(400).json({ error: 'Search query is required' });
      return;
    }

    if (query.length > 500) {
      res.status(400).json({ error: 'Query exceeds 500 characters limit' });
      return;
    }

    const result = await orchestrateSearch({
      query,
      language,
      mode,
      region,
      forceFresh: Boolean(forceFresh),
    });

    res.json(result);
  } catch (error: any) {
    console.error('Search endpoint error:', error);
    res.status(500).json({
      error: 'An unexpected error occurred during search orchestration',
      details: error?.message || 'Internal error',
    });
  }
});

/**
 * GET /api/suggestions
 * Real-time autocomplete suggestions combining Wikipedia & Indian topics
 */
app.get('/api/suggestions', async (req: Request, res: Response) => {
  const q = ((req.query.q as string) || '').trim();
  const lang = (req.query.lang as string) === 'hi' ? 'hi' : 'en';

  if (!q) {
    res.json({ suggestions: [] });
    return;
  }

  try {
    // 1. Check local trending list
    const localMatches = TRENDING_TOPICS_INDIA
      .filter((t) => t.query.toLowerCase().includes(q.toLowerCase()))
      .map((t) => t.query);

    // 2. Fetch Wikipedia opensearch suggestions
    const wikiUrl = `https://${lang}.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(
      q
    )}&limit=6&namespace=0&format=json`;

    let wikiSuggestions: string[] = [];
    try {
      const wikiRes = await fetch(wikiUrl, { signal: AbortSignal.timeout(1500) });
      if (wikiRes.ok) {
        const data = await wikiRes.json();
        if (Array.isArray(data) && Array.isArray(data[1])) {
          wikiSuggestions = data[1];
        }
      }
    } catch {}

    // Deduplicate suggestions
    const combined = Array.from(new Set([...localMatches, ...wikiSuggestions])).slice(0, 7);

    res.json({ suggestions: combined });
  } catch (error) {
    res.json({ suggestions: [] });
  }
});

/**
 * GET /api/trending
 * Trending topics for India
 */
app.get('/api/trending', (_req: Request, res: Response) => {
  res.json({ trends: TRENDING_TOPICS_INDIA });
});

/**
 * GET /api/cache/stats
 */
app.get('/api/cache/stats', (_req: Request, res: Response) => {
  res.json(getCacheStats());
});

/**
 * POST /api/cache/clear
 */
app.post('/api/cache/clear', (_req: Request, res: Response) => {
  clearCache();
  res.json({ success: true, message: 'Khoza search cache cleared successfully' });
});

/**
 * GET /api/health
 */
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'Khoza Search Engine Backend',
    timestamp: new Date().toISOString(),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
});

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Khoza Search Engine server is listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
