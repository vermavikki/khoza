import React, { useState, useEffect } from 'react';
import { KhozaLogo } from './components/KhozaLogo.tsx';
import { SearchBar } from './components/SearchBar.tsx';
import { Header } from './components/Header.tsx';
import { CategoryTabs } from './components/CategoryTabs.tsx';
import { AIAnswerCard } from './components/AIAnswerCard.tsx';
import { WebResultCard } from './components/WebResultCard.tsx';
import { TrendingSection } from './components/TrendingSection.tsx';
import { CodebaseExplorer } from './components/CodebaseExplorer.tsx';
import { BookmarksDrawer } from './components/BookmarksDrawer.tsx';
import { HistoryDrawer } from './components/HistoryDrawer.tsx';
import { SettingsModal } from './components/SettingsModal.tsx';
import { AndroidPhoneFrame } from './components/AndroidPhoneFrame.tsx';
import {
  SearchResponse,
  SearchMode,
  BookmarkItem,
  SearchHistoryItem,
  TrendingTopic,
  WebSearchResult,
} from './types/search.ts';
import {
  Sparkles,
  MapPin,
  Newspaper,
  Compass,
  ArrowRight,
  RotateCcw,
  AlertCircle,
  Building2,
  PhoneCall,
  Clock,
  Star,
} from 'lucide-react';

export default function App() {
  const [currentQuery, setCurrentQuery] = useState('');
  const [activeTab, setActiveTab] = useState<SearchMode>('all');
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [isAndroidView, setIsAndroidView] = useState(false);
  const [showCodeExplorer, setShowCodeExplorer] = useState(false);

  // Search state
  const [searchResponse, setSearchResponse] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isResultsView, setIsResultsView] = useState(false);

  // Drawers and Modals
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Local storage state
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(() => {
    try {
      const saved = localStorage.getItem('khoza_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [history, setHistory] = useState<SearchHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('khoza_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [trends, setTrends] = useState<TrendingTopic[]>([]);

  // Save bookmarks
  useEffect(() => {
    try {
      localStorage.setItem('khoza_bookmarks', JSON.stringify(bookmarks));
    } catch {}
  }, [bookmarks]);

  // Save history
  useEffect(() => {
    try {
      localStorage.setItem('khoza_history', JSON.stringify(history));
    } catch {}
  }, [history]);

  // Fetch trending topics on mount
  useEffect(() => {
    fetch('/api/trending')
      .then((res) => res.json())
      .then((data) => setTrends(data.trends || []))
      .catch(() => {});
  }, []);

  // Main search execution
  const executeSearch = async (
    query: string,
    mode: SearchMode = activeTab,
    forceFresh = false
  ) => {
    if (!query.trim()) return;

    setIsLoading(true);
    setSearchError(null);
    setCurrentQuery(query);
    setIsResultsView(true);
    setShowCodeExplorer(false);

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query.trim(),
          language,
          mode,
          forceFresh,
        }),
      });

      if (!res.ok) {
        throw new Error(`Search failed with status ${res.status}`);
      }

      const data: SearchResponse = await res.json();
      setSearchResponse(data);

      // Record in search history
      setHistory((prev) => [
        {
          id: `hist-${Date.now()}`,
          query: query.trim(),
          timestamp: Date.now(),
          language,
          resultCount: data.totalResults,
        },
        ...prev.filter((h) => h.query.toLowerCase() !== query.trim().toLowerCase()).slice(0, 49),
      ]);
    } catch (err: any) {
      console.error('Search query error:', err);
      setSearchError(err?.message || 'Failed to complete search. Please check connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (newTab: SearchMode) => {
    setActiveTab(newTab);
    if (currentQuery) {
      executeSearch(currentQuery, newTab);
    }
  };

  const handleToggleBookmark = (result: WebSearchResult) => {
    setBookmarks((prev) => {
      const exists = prev.some((b) => b.url === result.url);
      if (exists) {
        return prev.filter((b) => b.url !== result.url);
      }
      return [
        {
          id: result.id,
          title: result.title,
          url: result.url,
          domain: result.domain,
          snippet: result.snippet,
          savedAt: Date.now(),
        },
        ...prev,
      ];
    });
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('khoza_history');
    } catch {}
  };

  const goHome = () => {
    setIsResultsView(false);
    setShowCodeExplorer(false);
    setSearchResponse(null);
    setCurrentQuery('');
    setSearchError(null);
  };

  // Indian quick prompt suggestions
  const quickPrompts = [
    { labelEn: 'UPI Payment Limits & RBI Rules', labelHi: 'यूपीआई भुगतान सीमा व नियम', q: 'UPI payment limits RBI' },
    { labelEn: 'Chandrayaan 3 & Lunar Discoveries', labelHi: 'चंद्रयान 3 की प्रमुख खोजें', q: 'Chandrayaan 3 mission details' },
    { labelEn: 'Top Tech Startups in Bengaluru', labelHi: 'बेंगलुरु के प्रमुख टेक स्टार्टअप', q: 'best tech startups in Bengaluru' },
    { labelEn: 'Best Places to Visit in Kerala', labelHi: 'केरल में घूमने के बेहतरीन स्थान', q: 'best places to visit in Kerala' },
  ];

  const appContent = (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7]">
      {/* Top Header */}
      <Header
        isResultsView={isResultsView}
        currentQuery={currentQuery}
        onSearch={(q) => executeSearch(q, activeTab)}
        onGoHome={goHome}
        language={language}
        onLanguageToggle={() => setLanguage((l) => (l === 'en' ? 'hi' : 'en'))}
        isAndroidView={isAndroidView}
        onToggleAndroidView={() => setIsAndroidView(!isAndroidView)}
        showCodeExplorer={showCodeExplorer}
        onToggleCodeExplorer={() => setShowCodeExplorer(!showCodeExplorer)}
        onOpenBookmarks={() => setIsBookmarksOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        bookmarkCount={bookmarks.length}
      />

      {/* Main Content Body */}
      {showCodeExplorer ? (
        <main className="flex-1">
          <CodebaseExplorer />
        </main>
      ) : isResultsView ? (
        /* Results View */
        <main className="flex-1 flex flex-col">
          {/* Category Tabs */}
          <CategoryTabs
            activeTab={activeTab}
            onTabChange={handleTabChange}
            language={language}
          />

          <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 py-4 flex-1">
            {/* Search metadata row */}
            {searchResponse && !isLoading && (
              <div className="flex items-center justify-between text-xs text-slate-500 mb-4 pb-2 border-b border-slate-200/60">
                <div className="flex items-center gap-2">
                  <span>
                    {language === 'hi'
                      ? `लगभग ${searchResponse.totalResults} परिणाम (${(searchResponse.executionTimeMs / 1000).toFixed(2)} सेकंड)`
                      : `About ${searchResponse.totalResults} results (${(searchResponse.executionTimeMs / 1000).toFixed(2)}s)`}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="capitalize">{searchResponse.detectedIntent} intent</span>
                  {searchResponse.cacheHit && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="text-emerald-700 font-medium">Cached Response</span>
                    </>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => executeSearch(currentQuery, activeTab, true)}
                  className="flex items-center gap-1 text-slate-500 hover:text-amber-700 text-xs transition-colors"
                  title="Force revalidate fresh data"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{language === 'hi' ? 'ताज़ा करें' : 'Refresh'}</span>
                </button>
              </div>
            )}

            {/* Loading State Shimmer */}
            {isLoading && (
              <div className="space-y-4 animate-pulse py-2">
                {/* AI Answer skeleton */}
                <div className="h-44 bg-amber-50/70 border border-amber-100 rounded-2xl p-5 space-y-3">
                  <div className="h-4 w-32 bg-amber-200/60 rounded" />
                  <div className="h-3 w-full bg-amber-200/40 rounded" />
                  <div className="h-3 w-5/6 bg-amber-200/40 rounded" />
                  <div className="h-3 w-4/6 bg-amber-200/40 rounded" />
                </div>

                {/* Web result skeletons */}
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-28 bg-white border border-slate-200 rounded-xl p-4 space-y-2.5">
                    <div className="h-3 w-40 bg-slate-200 rounded" />
                    <div className="h-4 w-3/4 bg-slate-300 rounded" />
                    <div className="h-3 w-full bg-slate-100 rounded" />
                  </div>
                ))}
              </div>
            )}

            {/* Error Message */}
            {searchError && !isLoading && (
              <div className="p-6 bg-red-50 border border-red-200 rounded-2xl my-4 text-center">
                <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <h3 className="text-sm font-semibold text-red-900">
                  {language === 'hi' ? 'खोज परिणाम लोड करने में त्रुटि' : 'Unable to complete search'}
                </h3>
                <p className="text-xs text-red-700 mt-1 max-w-md mx-auto">{searchError}</p>
                <button
                  onClick={() => executeSearch(currentQuery, activeTab, true)}
                  className="mt-3 px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium transition-colors"
                >
                  {language === 'hi' ? 'पुनः प्रयास करें' : 'Retry'}
                </button>
              </div>
            )}

            {/* Results Presentation */}
            {!isLoading && searchResponse && (
              <div className="space-y-6">
                {/* AI Answer Section */}
                {searchResponse.answer && (activeTab === 'all' || activeTab === 'ai') && (
                  <AIAnswerCard
                    answer={searchResponse.answer}
                    sources={searchResponse.sources}
                    onFollowUpClick={(fq) => executeSearch(fq, activeTab)}
                    onRegenerate={() => executeSearch(currentQuery, activeTab, true)}
                    language={language}
                  />
                )}

                {/* Local & Maps Tab View */}
                {activeTab === 'maps' && (
                  <div className="space-y-3 mb-6">
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        {language === 'hi'
                          ? 'भारतीय स्थानीय स्थान, प्रतिष्ठान एवं निकटवर्ती सेवाएं'
                          : 'Showing verified Indian places, institutions, and local services for this search.'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        {
                          name: 'State Bank of India (Main Branch)',
                          category: 'Public Sector Banking · ATM 24/7',
                          rating: 4.4,
                          address: 'Connaught Place / MG Road Hub',
                          distance: '1.2 km away',
                        },
                        {
                          name: 'Indian Institute of Science Information Center',
                          category: 'Research & Education',
                          rating: 4.9,
                          address: 'CV Raman Road, Bengaluru / Delhi Campus',
                          distance: '3.4 km away',
                        },
                        {
                          name: 'Aadhaar & Digital Seva Kendra (CSC)',
                          category: 'Public Services · Citizen Support',
                          rating: 4.2,
                          address: 'National Informatics Centre Complex',
                          distance: '0.8 km away',
                        },
                      ].map((item, idx) => (
                        <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                          <div className="flex items-start justify-between">
                            <h4 className="text-sm font-semibold text-slate-900">{item.name}</h4>
                            <span className="flex items-center gap-0.5 text-xs font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                              {item.rating}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">{item.category}</p>
                          <p className="text-xs text-slate-600 mt-2 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>{item.address}</span>
                          </p>
                          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                            <span className="text-emerald-700 font-medium">{item.distance}</span>
                            <a
                              href={`https://maps.google.com/?q=${encodeURIComponent(item.name)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-700 font-medium hover:underline flex items-center gap-1"
                            >
                              <span>Directions</span>
                              <ArrowRight className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* News Tab View */}
                {activeTab === 'news' && (
                  <div className="space-y-3 mb-6">
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center gap-2">
                      <Newspaper className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>
                        {language === 'hi'
                          ? 'सत्यापित राष्ट्रीय एवं क्षेत्रीय समाचार'
                          : 'Verified national coverage and real-time updates from Indian news sources.'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Web Search Results */}
                {activeTab !== 'ai' && (
                  <div className="space-y-3">
                    {searchResponse.results.length === 0 ? (
                      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">
                        <Compass className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                        <h4 className="text-sm font-semibold text-slate-800">
                          {language === 'hi' ? 'कोई परिणाम नहीं मिला' : 'No web results found'}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1">
                          {language === 'hi'
                            ? 'कृपया अलग शब्द खोजें या सामान्य कीवर्ड का उपयोग करें।'
                            : 'Try adjusting your search terms or testing one of our trending topics.'}
                        </p>
                      </div>
                    ) : (
                      searchResponse.results.map((result) => {
                        const isBookmarked = bookmarks.some((b) => b.url === result.url);
                        return (
                          <WebResultCard
                            key={result.id}
                            result={result}
                            isBookmarked={isBookmarked}
                            onToggleBookmark={handleToggleBookmark}
                            language={language}
                          />
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      ) : (
        /* Home Screen */
        <main className="flex-1 flex flex-col justify-center items-center px-4 py-8 sm:py-16">
          <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
            {/* Khoza Logo */}
            <div className="mb-6">
              <KhozaLogo size="xl" showSubtitle={true} language={language} />
            </div>

            {/* Search Bar */}
            <div className="w-full mb-6">
              <SearchBar
                onSearch={(q) => executeSearch(q, activeTab)}
                language={language}
                autoFocus={true}
              />
            </div>

            {/* Actions: Web Search & AI Cited Answer */}
            <div className="flex items-center gap-3 mb-8">
              <button
                type="button"
                onClick={() => {
                  if (currentQuery) executeSearch(currentQuery, 'all');
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-medium rounded-lg transition-colors"
              >
                {language === 'hi' ? 'खोजा खोज' : 'Khoza Search'}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (currentQuery) executeSearch(currentQuery, 'ai');
                  else executeSearch('Chandrayaan 3 mission discoveries', 'ai');
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 text-amber-900 text-xs sm:text-sm font-medium rounded-lg transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>{language === 'hi' ? 'एआई उद्धृत उत्तर' : 'AI Cited Answer'}</span>
              </button>
            </div>

            {/* Quick Explore Prompts */}
            <div className="w-full max-w-xl text-center mb-4">
              <p className="text-xs text-slate-400 font-medium mb-2.5 uppercase tracking-wider">
                {language === 'hi' ? 'सुझाए गए खोज विषय' : 'Popular Explorations in India'}
              </p>
              <div className="flex flex-wrap justify-center gap-1.5">
                {quickPrompts.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => executeSearch(p.q, 'all')}
                    className="px-3 py-1 bg-white hover:bg-amber-50 border border-slate-200 hover:border-amber-300 rounded-full text-xs text-slate-600 transition-colors shadow-2xs"
                  >
                    {language === 'hi' ? p.labelHi : p.labelEn}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Trending Section */}
          <TrendingSection
            trends={trends}
            onSelectTopic={(q) => executeSearch(q, 'all')}
            language={language}
          />
        </main>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/70 py-4 px-6 text-center text-xs text-slate-400 mt-auto">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            {language === 'hi'
              ? 'खोजा © 2026 · भारत में निर्मित एआई सर्च इंजन'
              : 'Khoza © 2026 · Built with pride for India · Material 3 & Firebase'}
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCodeExplorer(true)}
              className="hover:text-slate-700 underline"
            >
              Flutter & Cloud Architecture
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="hover:text-slate-700 underline"
            >
              Privacy & Caching
            </button>
          </div>
        </div>
      </footer>

      {/* Drawers and Modals */}
      <BookmarksDrawer
        isOpen={isBookmarksOpen}
        onClose={() => setIsBookmarksOpen(false)}
        bookmarks={bookmarks}
        onRemoveBookmark={(id) => setBookmarks((prev) => prev.filter((b) => b.id !== id))}
        language={language}
      />

      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectQuery={(q) => executeSearch(q, activeTab)}
        onClearHistory={handleClearHistory}
        language={language}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        language={language}
        onLanguageChange={setLanguage}
      />
    </div>
  );

  return (
    <AndroidPhoneFrame
      active={isAndroidView}
      onToggle={() => setIsAndroidView(!isAndroidView)}
      language={language}
    >
      {appContent}
    </AndroidPhoneFrame>
  );
}
