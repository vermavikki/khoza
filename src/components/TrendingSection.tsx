import React from 'react';
import { TrendingTopic } from '../types/search.js';
import { TrendingUp, ArrowRight, Zap } from 'lucide-react';

interface TrendingSectionProps {
  trends: TrendingTopic[];
  onSelectTopic: (query: string) => void;
  language?: 'en' | 'hi';
}

export const TrendingSection: React.FC<TrendingSectionProps> = ({
  trends,
  onSelectTopic,
  language = 'en',
}) => {
  return (
    <section className="w-full max-w-4xl mx-auto mt-10 px-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-amber-50 text-amber-600">
            <TrendingUp className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-semibold text-slate-800 tracking-wide uppercase">
            {language === 'hi' ? 'भारत में ट्रेंडिंग विषय' : 'Trending in India'}
          </h2>
        </div>
        <span className="text-xs text-slate-400">
          {language === 'hi' ? 'लाइव अपडेट' : 'Verified Daily Trends'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {trends.slice(0, 8).map((topic, idx) => (
          <button
            key={topic.id}
            type="button"
            onClick={() => onSelectTopic(topic.query)}
            className="group flex flex-col justify-between p-3.5 bg-white rounded-xl border border-slate-200/90 hover:border-amber-400 hover:shadow-xs transition-all text-left cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                <span className="font-medium text-amber-700">{topic.tag}</span>
                <span>#{idx + 1}</span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-slate-800 group-hover:text-amber-800 line-clamp-2 leading-snug">
                {topic.query}
              </p>
            </div>

            <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-400 group-hover:text-amber-600 transition-colors">
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-500" />
                <span>{language === 'hi' ? 'खोजें' : 'Search'}</span>
              </span>
              <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all" />
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};
