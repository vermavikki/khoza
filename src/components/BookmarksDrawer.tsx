import React from 'react';
import { BookmarkItem } from '../types/search.js';
import { Bookmark, X, Trash2, ExternalLink } from 'lucide-react';

interface BookmarksDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarks: BookmarkItem[];
  onRemoveBookmark: (id: string) => void;
  language?: 'en' | 'hi';
}

export const BookmarksDrawer: React.FC<BookmarksDrawerProps> = ({
  isOpen,
  onClose,
  bookmarks,
  onRemoveBookmark,
  language = 'en',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity animate-fade-in">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-amber-600" />
            <h3 className="text-base font-semibold text-slate-900">
              {language === 'hi' ? 'सहेजे गए परिणाम' : 'Saved Bookmarks'} ({bookmarks.length})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {bookmarks.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Bookmark className="w-10 h-10 mx-auto text-slate-300 mb-2 opacity-50" />
              <p className="text-sm font-medium">
                {language === 'hi' ? 'कोई सहेजा गया परिणाम नहीं है।' : 'No bookmarks saved yet.'}
              </p>
              <p className="text-xs mt-1">
                {language === 'hi'
                  ? 'खोज परिणामों पर बुकमार्क आइकन पर क्लिक करके उन्हें यहाँ सहेजें।'
                  : 'Click the bookmark icon on any search result to save it here.'}
              </p>
            </div>
          ) : (
            bookmarks.map((b) => (
              <div
                key={b.id}
                className="p-3.5 rounded-xl border border-slate-200/90 hover:border-slate-300 transition-all bg-slate-50/50"
              >
                <div className="flex items-start justify-between gap-2">
                  <a
                    href={b.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-blue-700 hover:underline line-clamp-2"
                  >
                    {b.title}
                  </a>
                  <button
                    onClick={() => onRemoveBookmark(b.id)}
                    className="text-slate-400 hover:text-red-600 transition-colors shrink-0 p-1"
                    title="Remove"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 font-mono mt-1 truncate">{b.domain}</p>
                <p className="text-xs text-slate-600 line-clamp-2 mt-1.5">{b.snippet}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
