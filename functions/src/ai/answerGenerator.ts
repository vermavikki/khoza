import { GoogleGenAI } from '@google/genai';
import { validateAndMapCitations } from './citationValidator';

export async function generateCitedAIAnswer(
  query: string,
  sources: any[],
  language: string,
  intent: string
) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return generateAlgorithmicFallback(query, sources, language);
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });

    const sourceContext = sources
      .map((s, idx) => `[${idx + 1}] "${s.title}" (${s.domain}): ${s.url}`)
      .join('\n');

    const systemInstruction = `You are Khoza AI, an India-first objective search answer generator.
Rules:
1. Ground your response strictly in the retrieved evidence.
2. Use bracketed citations like [1], [2] corresponding to provided sources.
3. Answer in ${language === 'hi' ? 'natural Hindi (Devanagari script)' : 'fluent Indian English'}.
4. Provide 3 follow-up exploration questions on the last line prefixed with "Follow-ups: ".`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Query: "${query}"\n\nSources:\n${sourceContext}\n\nSynthesize answer:`,
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }],
      },
    });

    const raw = response.text || '';
    let text = raw;
    let followUps: string[] = [];

    const match = raw.match(/Follow-ups:\s*(.*)$/im);
    if (match) {
      text = raw.replace(match[0], '').trim();
      followUps = match[1].split(';').map((s) => s.trim()).filter(Boolean);
    }

    const { sanitizedText, citations } = validateAndMapCitations(text, sources);

    return {
      text: sanitizedText,
      citations,
      suggestedFollowUps: followUps,
      confidence: 'high',
      answeredAt: new Date().toISOString(),
    };
  } catch (err) {
    console.error('Gemini synthesis failed, utilizing fallback:', err);
    return generateAlgorithmicFallback(query, sources, language);
  }
}

function generateAlgorithmicFallback(query: string, sources: any[], language: string) {
  if (sources.length === 0) {
    return {
      text: language === 'hi'
        ? `"${query}" के लिए कोई सत्यापित परिणाम नहीं मिला।`
        : `No verified sources were found for "${query}".`,
      citations: [],
      suggestedFollowUps: [],
      confidence: 'uncertain',
      answeredAt: new Date().toISOString(),
    };
  }

  const s1 = sources[0];
  const text = language === 'hi'
    ? `**${query}** के मुख्य तथ्य:\n\nप्राथमिक स्रोतों के अनुसार, ${s1.title} द्वारा दी गई जानकारी इस विषय पर विस्तृत विवरण प्रस्तुत करती है [1]।`
    : `**Key facts for "${query}":**\n\nAccording to verified documentation, **${s1.title}** provides primary details regarding this subject [1].`;

  const { sanitizedText, citations } = validateAndMapCitations(text, sources);

  return {
    text: sanitizedText,
    citations,
    suggestedFollowUps: [
      `Official details regarding ${query}`,
      `Key benefits of ${query}`,
    ],
    confidence: 'medium',
    answeredAt: new Date().toISOString(),
  };
}
