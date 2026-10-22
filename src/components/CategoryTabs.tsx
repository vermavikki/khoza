import React from 'react';
import { SearchMode } from '../types/search.js';
import { Sparkles, Globe, Newspaper, Image, Video, MapPin, ShoppingBag } from 'lucide-react';

interface CategoryTabsProps {
  activeTab: SearchMode;
  onTabChange: (tab: SearchMode) => void;
  language?: 'en' | 'hi';
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  activeTab,
  onTabChange,
  language = 'en',
}) => {
  const tabs: { id: SearchMode; labelEn: string; labelHi: string; icon: React.ReactNode }[] = [
    { id: 'all', labelEn: 'All', labelHi: 'सभी', icon: <Globe className="w-3.5 h-3.5" /> },
    { id: 'ai', labelEn: 'AI Answer', labelHi: 'एआई उत्तर', icon: <Sparkles className="w-3.5 h-3.5 text-amber-500" /> },
    { id: 'news', labelEn: 'News', labelHi: 'समाचार', icon: <Newspaper className="w-3.5 h-3.5" /> },
    { id: 'maps', labelEn: 'Maps & Local', labelHi: 'स्थानीय व मैप्स', icon: <MapPin className="w-3.5 h-3.5" /> },
    { id: 'images', labelEn: 'Images', labelHi: 'चित्र', icon: <Image className="w-3.5 h-3.5" /> },
    { id: 'videos', labelEn: 'Videos', labelHi: 'वीडियो', icon: <Video className="w-3.5 h-3.5" /> },
    { id: 'shopping', labelEn: 'Shopping', labelHi: 'शॉपिंग', icon: <ShoppingBag className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="border-b border-slate-200 overflow-x-auto scrollbar-none bg-white">
      <div className="flex items-center gap-1 max-w-4xl px-4 sm:px-6">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-1.5 py-3 px-3 text-xs sm:text-sm font-medium whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
                isActive
                  ? 'border-amber-600 text-slate-900 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              {tab.icon}
              <span>{language === 'hi' ? tab.labelHi : tab.labelEn}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
