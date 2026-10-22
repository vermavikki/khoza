import React from 'react';
import { SearchHistoryItem } from '../types/search.js';
import { History, X, Trash2, Search } from 'lucide-react';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: SearchHistoryItem[];
  onSelectQuery: (query: string) => void;
  onClearHistory: () => void;
  language?: 'en' | 'hi';
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelectQuery,
  onClearHistory,
  language = 'en',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity animate-fade-in">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-amber-600" />
            <h3 className="text-base font-semibold text-slate-900">
              {language === 'hi' ? 'खोज इतिहास' : 'Search History'} ({history.length})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Clear All action */}
        {history.length > 0 && (
          <div className="flex justify-end pt-3">
            <button
              onClick={onClearHistory}
              className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-medium transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'इतिहास साफ़ करें' : 'Clear all history'}</span>
            </button>
          </div>
        )}

        {/* Content list */}
        <div className="flex-1 overflow-y-auto py-3 space-y-2">
          {history.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <History className="w-10 h-10 mx-auto text-slate-300 mb-2 opacity-50" />
              <p className="text-sm font-medium">
                {language === 'hi' ? 'कोई खोज इतिहास नहीं है।' : 'No search history recorded.'}
              </p>
            </div>
          ) : (
            history.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectQuery(item.query);
                  onClose();
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200/80 hover:bg-amber-50/50 hover:border-amber-300 transition-all text-left group"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Search className="w-4 h-4 text-slate-400 group-hover:text-amber-600 shrink-0" />
                  <span className="text-xs sm:text-sm font-medium text-slate-800 truncate">
                    {item.query}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 shrink-0">
                  {new Date(item.timestamp).toLocaleDateString('en-IN', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
