# Khoza API Cost Optimization & Usage Guide

## 1. Multi-Tiered Caching for Cost Reduction
AI API queries and commercial search engines incur costs per call. Khoza implements a 3-layer architecture to minimize external API expenses:

1. **Client-Side Short Cache:**
   - In-memory session debounce and suggestion caching.
2. **Firestore Public Cache (`search_cache`):**
   - Evergreen queries (history, definitions, government schemes) are cached for 14 days.
   - Saves up to 65% of repeated query costs on common Indian national topics.
3. **Intent-Based Routing:**
   - Queries with high volatility (live cricket scores, gold rates) bypass long-term caching and route directly to lightweight search providers without incurring high token synthesis when simple snippets suffice.

## 2. Gemini 3.8 Flash Cost Profile
- Chosen Model: `gemini-3.8-flash`
- Input token cost: Highly optimized compared to flagship models while maintaining superior Hindi & Indian English reasoning.
- Output token budget: System instruction directs concise synthesis with max 350 response tokens per answer.
