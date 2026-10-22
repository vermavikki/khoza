import React from 'react';
import { WebSearchResult } from '../types/search.js';
import { ExternalLink, Bookmark, BookmarkCheck } from 'lucide-react';

interface WebResultCardProps {
  result: WebSearchResult;
  isBookmarked?: boolean;
  onToggleBookmark?: (result: WebSearchResult) => void;
  language?: 'en' | 'hi';
}

export const WebResultCard: React.FC<WebResultCardProps> = ({
  result,
  isBookmarked = false,
  onToggleBookmark,
  language = 'en',
}) => {
  // Generate a reliable favicon URL using Google's public favicon service or domain
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${result.domain}&sz=32`;

  return (
    <article className="group bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 hover:border-slate-300 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between gap-3">
        {/* Domain & Breadcrumb */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden shrink-0 border border-slate-200">
            <img
              src={faviconUrl}
              alt=""
              className="w-3.5 h-3.5 object-contain"
              onError={(e) => {
                // Fallback letter if favicon fails to load
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 truncate">
            <span className="font-medium text-slate-700">{result.domain}</span>
            {result.sourceCategory && (
              <>
                <span aria-hidden="true">·</span>
                <span>{result.sourceCategory}</span>
              </>
            )}
            {result.publicationDate && (
              <>
                <span aria-hidden="true">·</span>
                <span>{result.publicationDate}</span>
              </>
            )}
          </div>
        </div>

        {/* Bookmark Action */}
        {onToggleBookmark && (
          <button
            type="button"
            onClick={() => onToggleBookmark(result)}
            className={`p-1.5 rounded-lg transition-colors ${
              isBookmarked
                ? 'text-amber-600 bg-amber-50'
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
            }`}
            title={isBookmarked ? 'Remove bookmark' : 'Bookmark result'}
            aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark result'}
          >
            {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Title */}
      <h3 className="mt-1.5 text-base sm:text-lg font-semibold text-blue-800 hover:underline leading-snug">
        <a
          href={result.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5"
        >
          <span>{result.title}</span>
          <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
        </a>
      </h3>

      {/* Destination URL */}
      <p className="text-[12px] text-emerald-700 font-mono truncate mt-0.5">
        {result.url}
      </p>

      {/* Snippet */}
      <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
        {result.snippet}
      </p>
    </article>
  );
};
