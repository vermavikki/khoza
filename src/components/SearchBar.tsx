import React, { useState, useEffect, useRef } from 'react';
import { Search, Mic, MicOff, X, ArrowUpRight } from 'lucide-react';

interface SearchBarProps {
  initialQuery?: string;
  onSearch: (query: string) => void;
  language?: 'en' | 'hi';
  compact?: boolean;
  autoFocus?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  initialQuery = '',
  onSearch,
  language = 'en',
  compact = false,
  autoFocus = false,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync initial query
  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  // Autocomplete fetch with debounce
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/suggestions?q=${encodeURIComponent(trimmed)}&lang=${language}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.suggestions || []);
        }
      } catch (err) {
        // silent fallback
      }
    }, 180);

    return () => clearTimeout(timer);
  }, [query, language]);

  // Outside click handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const finalQuery = selectedIndex >= 0 && suggestions[selectedIndex] ? suggestions[selectedIndex] : query;
    if (finalQuery.trim()) {
      setShowSuggestions(false);
      onSearch(finalQuery.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') {
        handleSubmit();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  // Voice search using Web Speech API
  const toggleVoiceSearch = () => {
    setSpeechError(null);
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechError(
        language === 'hi'
          ? 'आपके ब्राउज़र में वॉइस सर्च समर्थित नहीं है।'
          : 'Voice search is not supported in this browser.'
      );
      setTimeout(() => setSpeechError(null), 3000);
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setIsListening(true);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setQuery(transcript);
          setIsListening(false);
          onSearch(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        setSpeechError(
          language === 'hi'
            ? 'वॉइस इनपुट प्राप्त नहीं हो सका।'
            : 'Could not capture voice input. Please try again.'
        );
        setTimeout(() => setSpeechError(null), 3000);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      setIsListening(false);
      setSpeechError('Microphone permission required.');
      setTimeout(() => setSpeechError(null), 3000);
    }
  };

  const placeholderText =
    language === 'hi'
      ? 'खोजा पर कुछ भी खोजें... (उदा. चंद्रयान, यूपीआई, भारतीय पर्यटन)'
      : 'Search with Khoza AI... (e.g., UPI limits, ISRO missions, startup ecosystem)';

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative w-full">
        <div
          className={`flex items-center w-full bg-white rounded-full transition-all duration-200 border ${
            showSuggestions && suggestions.length > 0
              ? 'rounded-b-none border-slate-300 shadow-lg'
              : 'border-slate-200 hover:border-slate-300 hover:shadow-md focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20 focus-within:shadow-md'
          } ${compact ? 'px-3.5 py-1.5' : 'px-5 py-3'}`}
        >
          {/* Search Icon */}
          <Search
            className={`text-slate-400 shrink-0 ${compact ? 'w-4 h-4 mr-2' : 'w-5 h-5 mr-3'}`}
            aria-hidden="true"
          />

          {/* Search Input */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
              setSelectedIndex(-1);
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholderText}
            autoFocus={autoFocus}
            className={`w-full bg-transparent text-slate-800 focus:outline-none placeholder:text-slate-400 ${
              compact ? 'text-sm' : 'text-base'
            }`}
            aria-label="Search query"
            aria-autocomplete="list"
            aria-controls="khoza-search-suggestions"
            aria-expanded={showSuggestions && suggestions.length > 0}
          />

          {/* Clear Button */}
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setSuggestions([]);
                inputRef.current?.focus();
              }}
              className="p-1 text-slate-400 hover:text-slate-600 transition-colors mr-1 rounded-full hover:bg-slate-100"
              aria-label="Clear search query"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Mic / Voice Search Button */}
          <button
            type="button"
            onClick={toggleVoiceSearch}
            className={`p-1.5 rounded-full transition-colors ${
              isListening
                ? 'bg-red-50 text-red-600 animate-pulse'
                : 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
            }`}
            aria-label={isListening ? 'Stop listening' : 'Voice search'}
            title="Search by voice"
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
        </div>

        {/* Voice listening status banner */}
        {isListening && (
          <div className="absolute top-full left-0 right-0 mt-2 p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center justify-between z-40 animate-fade-in shadow-sm">
            <span className="flex items-center gap-2 font-medium">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              {language === 'hi' ? 'सुन रहा है... बोलिए' : 'Listening... Speak now in Hindi or English'}
            </span>
            <button
              type="button"
              onClick={() => setIsListening(false)}
              className="text-xs text-red-600 underline font-medium hover:text-red-800"
            >
              {language === 'hi' ? 'रद्द करें' : 'Cancel'}
            </button>
          </div>
        )}

        {/* Voice error toast */}
        {speechError && (
          <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl z-40">
            {speechError}
          </div>
        )}

        {/* Autocomplete Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <ul
            id="khoza-search-suggestions"
            role="listbox"
            className="absolute top-full left-0 right-0 bg-white border border-t-0 border-slate-300 rounded-b-2xl shadow-xl overflow-hidden z-50 divide-y divide-slate-100"
          >
            {suggestions.map((suggestion, idx) => (
              <li
                key={suggestion}
                role="option"
                aria-selected={idx === selectedIndex}
                onMouseDown={(e) => {
                  e.preventDefault();
                  setQuery(suggestion);
                  setShowSuggestions(false);
                  onSearch(suggestion);
                }}
                className={`flex items-center justify-between px-5 py-2.5 cursor-pointer text-sm transition-colors ${
                  idx === selectedIndex ? 'bg-amber-50 text-amber-950 font-medium' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Search className="w-3.5 h-3.5 text-slate-400" />
                  <span>{suggestion}</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-300" />
              </li>
            ))}
          </ul>
        )}
      </form>
    </div>
  );
};
