import React, { useState, useEffect } from 'react';
import { Settings, X, Shield, Database, RefreshCw, Check, Globe } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'hi';
  onLanguageChange: (lang: 'en' | 'hi') => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  language,
  onLanguageChange,
}) => {
  const [safeSearch, setSafeSearch] = useState(true);
  const [cacheStats, setCacheStats] = useState<{ totalEntries: number; hits: number; misses: number } | null>(null);
  const [clearingCache, setClearingCache] = useState(false);
  const [cacheClearedSuccess, setCacheClearedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/cache/stats')
        .then((res) => res.json())
        .then((data) => setCacheStats(data))
        .catch(() => {});
    }
  }, [isOpen]);

  const handleClearCache = async () => {
    setClearingCache(true);
    try {
      const res = await fetch('/api/cache/clear', { method: 'POST' });
      if (res.ok) {
        setCacheClearedSuccess(true);
        setCacheStats({ totalEntries: 0, hits: 0, misses: 0 });
        setTimeout(() => setCacheClearedSuccess(false), 2500);
      }
    } catch (e) {
      // silent
    } finally {
      setClearingCache(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs transition-opacity animate-fade-in">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col p-6 overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-600" />
            <h3 className="text-base font-semibold text-slate-900">
              {language === 'hi' ? 'खोजा सेटिंग्स एवं गोपनीयता' : 'Khoza Settings & Privacy Controls'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-6 text-sm text-slate-700">
          {/* Language Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              {language === 'hi' ? 'प्राथमिक भाषा' : 'Primary Search Language'}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onLanguageChange('en')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  language === 'en'
                    ? 'border-amber-600 bg-amber-50/70 font-semibold text-slate-900 ring-2 ring-amber-600/10'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>English (India)</span>
                  {language === 'en' && <Check className="w-4 h-4 text-amber-600" />}
                </div>
                <p className="text-[11px] text-slate-400 font-normal mt-0.5">Indian English Results</p>
              </button>

              <button
                type="button"
                onClick={() => onLanguageChange('hi')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  language === 'hi'
                    ? 'border-amber-600 bg-amber-50/70 font-semibold text-slate-900 ring-2 ring-amber-600/10'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>हिंदी (Hindi)</span>
                  {language === 'hi' && <Check className="w-4 h-4 text-amber-600" />}
                </div>
                <p className="text-[11px] text-slate-400 font-normal mt-0.5">देवनागरी लिपि में उत्तर</p>
              </button>
            </div>
          </div>

          {/* SafeSearch Toggle */}
          <div className="flex items-center justify-between py-2 border-t border-slate-100">
            <div>
              <p className="font-medium text-slate-900 text-sm">SafeSearch (सुरक्षित खोज)</p>
              <p className="text-xs text-slate-500">Filter explicit adult content from search results</p>
            </div>
            <button
              type="button"
              onClick={() => setSafeSearch(!safeSearch)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                safeSearch ? 'bg-amber-600' : 'bg-slate-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  safeSearch ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Cache Management */}
          <div className="border-t border-slate-100 pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Database className="w-4 h-4 text-slate-500" />
              <p className="font-semibold text-slate-900 text-xs uppercase tracking-wider">
                {language === 'hi' ? 'क्लाउड कैश प्रबंधन' : 'Firestore Search Cache'}
              </p>
            </div>

            {cacheStats && (
              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl text-center mb-3">
                <div>
                  <p className="text-xs text-slate-400">Cached Queries</p>
                  <p className="text-sm font-bold text-slate-800">{cacheStats.totalEntries}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Cache Hits</p>
                  <p className="text-sm font-bold text-emerald-600">{cacheStats.hits}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Fresh Lookups</p>
                  <p className="text-sm font-bold text-blue-600">{cacheStats.misses}</p>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleClearCache}
              disabled={clearingCache}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 border border-slate-200 hover:border-red-300 hover:bg-red-50 text-slate-700 hover:text-red-700 rounded-xl text-xs font-medium transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${clearingCache ? 'animate-spin' : ''}`} />
              <span>
                {cacheClearedSuccess
                  ? (language === 'hi' ? 'कैश सफलतापूर्वक साफ़ किया गया' : 'Cache Cleared Successfully!')
                  : (language === 'hi' ? 'कैश मेमोरी साफ़ करें' : 'Purge Reusable Search Cache')}
              </span>
            </button>
          </div>

          {/* Privacy Note */}
          <div className="border-t border-slate-100 pt-4">
            <div className="flex items-start gap-2.5 p-3 bg-slate-50 rounded-xl text-xs text-slate-600">
              <Shield className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-slate-800">
                  {language === 'hi' ? 'गोपनीयता सुरक्षा गारंटी' : 'India-First Privacy Guarantee'}
                </p>
                <p className="mt-1 leading-relaxed">
                  Khoza does not profile individual users or sell search queries to advertising brokers. Search history is stored securely under per-user access control rules and can be cleared at any time.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            {language === 'hi' ? 'पूर्ण' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
};
