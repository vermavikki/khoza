export interface CitationMapping {
  index: number;
  sourceId: number;
  source: any;
}

export function validateAndMapCitations(text: string, sources: any[]): {
  sanitizedText: string;
  citations: CitationMapping[];
} {
  const map = new Map<number, CitationMapping>();
  const regex = /\[(\d+(?:\s*,\s*\d+)*)\]/g;

  const sanitizedText = text.replace(regex, (fullMatch, numberGroup) => {
    const nums = numberGroup.split(',').map((s: string) => parseInt(s.trim(), 10));
    const valid: number[] = [];

    for (const n of nums) {
      if (n >= 1 && n <= sources.length) {
        valid.push(n);
        if (!map.has(n)) {
          map.set(n, {
            index: n,
            sourceId: sources[n - 1].id,
            source: sources[n - 1],
          });
        }
      }
    }

    if (valid.length === 0) return '';
    return `[${valid.join(', ')}]`;
  });

  const citations = Array.from(map.values()).sort((a, b) => a.index - b.index);
  return { sanitizedText: sanitizedText.trim(), citations };
}
