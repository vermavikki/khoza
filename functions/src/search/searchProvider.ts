export interface ProviderResult {
  title: string;
  url: string;
  domain: string;
  snippet: string;
  publicationDate?: string;
}

/**
 * Multi-provider search executor with Wikipedia and Indian knowledge fallback
 */
export async function executeWebSearch(query: string, language: string): Promise<ProviderResult[]> {
  const results: ProviderResult[] = [];

  // Primary: Wikipedia search
  try {
    const endpoint = `https://${language === 'hi' ? 'hi' : 'en'}.wikipedia.org/w/api.php`;
    const params = new URLSearchParams({
      action: 'query',
      list: 'search',
      srsearch: query,
      format: 'json',
      srlimit: '5',
      origin: '*',
    });

    const res = await fetch(`${endpoint}?${params.toString()}`, {
      headers: { 'User-Agent': 'KhozaSearchEngine/1.0' },
      signal: AbortSignal.timeout(4000),
    });

    if (res.ok) {
      const data = await res.json();
      const list = data.query?.search || [];
      for (const item of list) {
        const cleanSnippet = item.snippet.replace(/<[^>]+>/g, '').replace(/&quot;/g, '"');
        const titleUrl = encodeURIComponent(item.title.replace(/ /g, '_'));
        results.push({
          title: item.title,
          url: `https://${language === 'hi' ? 'hi' : 'en'}.wikipedia.org/wiki/${titleUrl}`,
          domain: `${language === 'hi' ? 'hi' : 'en'}.wikipedia.org`,
          snippet: cleanSnippet,
          publicationDate: item.timestamp ? new Date(item.timestamp).toLocaleDateString('en-IN') : undefined,
        });
      }
    }
  } catch (err) {
    console.warn('Wikipedia search provider failed:', err);
  }

  // Secondary Fallback: Indian Gov & Verified Knowledge Sources
  if (results.length === 0 || query.toLowerCase().includes('upi') || query.toLowerCase().includes('isro')) {
    if (query.toLowerCase().includes('upi')) {
      results.push({
        title: 'Unified Payments Interface (UPI) Overview - NPCI',
        url: 'https://www.npci.org.in/what-we-do/upi/product-overview',
        domain: 'npci.org.in',
        snippet: 'Unified Payments Interface is an instant payment system developed by National Payments Corporation of India enabling inter-bank peer-to-peer and merchant payments.',
      });
    }
    if (query.toLowerCase().includes('isro') || query.toLowerCase().includes('chandrayaan')) {
      results.push({
        title: 'Indian Space Research Organisation (ISRO) Official Portal',
        url: 'https://www.isro.gov.in',
        domain: 'isro.gov.in',
        snippet: 'ISRO is the space agency of India, executing lunar exploration, navigation constellations, launch vehicle development, and interplanetary research missions.',
      });
    }
  }

  return results;
}
