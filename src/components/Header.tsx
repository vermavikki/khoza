import React from 'react';
import { KhozaLogo } from './KhozaLogo.tsx';
import { SearchBar } from './SearchBar.tsx';
import {
  Smartphone,
  Globe,
  Code2,
  Bookmark,
  History,
  Settings,
  Languages,
} from 'lucide-react';

interface HeaderProps {
  isResultsView: boolean;
  currentQuery?: string;
  onSearch: (query: string) => void;
  onGoHome: () => void;
  language: 'en' | 'hi';
  onLanguageToggle: () => void;
  isAndroidView: boolean;
  onToggleAndroidView: () => void;
  showCodeExplorer: boolean;
  onToggleCodeExplorer: () => void;
  onOpenBookmarks: () => void;
  onOpenHistory: () => void;
  onOpenSettings: () => void;
  bookmarkCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  isResultsView,
  currentQuery = '',
  onSearch,
  onGoHome,
  language,
  onLanguageToggle,
  isAndroidView,
  onToggleAndroidView,
  showCodeExplorer,
  onToggleCodeExplorer,
  onOpenBookmarks,
  onOpenHistory,
  onOpenSettings,
  bookmarkCount,
}) => {
  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 sm:gap-4">
        {/* Left: Logo (visible when in results view or code explorer) & Search Bar */}
        <div className="flex items-center gap-3 sm:gap-6 flex-1 min-w-0">
          {isResultsView ? (
            <button
              onClick={onGoHome}
              className="flex items-center gap-1.5 focus:outline-none hover:opacity-90 shrink-0"
              title="Khoza Home"
            >
              <KhozaLogo size="sm" showSubtitle={false} language={language} />
            </button>
          ) : (
            <span className="text-xs font-semibold text-slate-700 sm:hidden">Khoza</span>
          )}

          {isResultsView && (
            <div className="flex-1 max-w-xl hidden sm:block">
              <SearchBar
                initialQuery={currentQuery}
                onSearch={onSearch}
                language={language}
                compact={true}
              />
            </div>
          )}
        </div>

        {/* Right: Controls & Toggles */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Mode Switcher: Android View vs Web (hidden inside mobile frame to avoid recursion) */}
          {!isAndroidView && (
            <button
              onClick={onToggleAndroidView}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Toggle Android Material 3 view"
            >
              <Smartphone className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden md:inline">Android Mode</span>
            </button>
          )}

          {/* Flutter & Cloud Codebase Explorer */}
          {!isAndroidView && (
            <button
              onClick={onToggleCodeExplorer}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                showCodeExplorer
                  ? 'bg-blue-100 text-blue-900 border border-blue-300 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title="Inspect Flutter and Cloud Functions Source Code"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Source Code</span>
            </button>
          )}

          {/* Language Toggle (EN / HI) */}
          <button
            onClick={onLanguageToggle}
            className="flex items-center gap-1 px-2 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
            title="Toggle Language"
          >
            <Languages className="w-3.5 h-3.5 text-amber-600" />
            <span>{language === 'en' ? 'हिन्दी' : 'EN'}</span>
          </button>

          {/* Bookmarks */}
          <button
            onClick={onOpenBookmarks}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors relative"
            title="Saved bookmarks"
            aria-label="Bookmarks"
          >
            <Bookmark className="w-4 h-4" />
            {bookmarkCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                {bookmarkCount}
              </span>
            )}
          </button>

          {/* History */}
          <button
            onClick={onOpenHistory}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            title="Search history"
            aria-label="Search History"
          >
            <History className="w-4 h-4" />
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            title="Settings and privacy"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile search bar if on results view */}
      {isResultsView && (
        <div className="sm:hidden px-4 pb-2.5">
          <SearchBar
            initialQuery={currentQuery}
            onSearch={onSearch}
            language={language}
            compact={true}
          />
        </div>
      )}
    </header>
  );
};
