import React, { useState } from 'react';
import { AIAnswerData, SourceMetadata } from '../types/search.js';
import { Sparkles, Copy, Check, Share2, RefreshCw, ExternalLink, ShieldCheck, AlertCircle } from 'lucide-react';

interface AIAnswerCardProps {
  answer: AIAnswerData;
  sources: SourceMetadata[];
  onFollowUpClick: (query: string) => void;
  onRegenerate?: () => void;
  language?: 'en' | 'hi';
}

export const AIAnswerCard: React.FC<AIAnswerCardProps> = ({
  answer,
  sources,
  onFollowUpClick,
  onRegenerate,
  language = 'en',
}) => {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [activeSourceHighlight, setActiveSourceHighlight] = useState<number | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(answer.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Khoza AI Answer',
        text: answer.text,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  // Render text with clickable citation badges
  const renderFormattedText = (text: string) => {
    // Split by citation brackets like [1], [2], [1, 2]
    const parts = text.split(/(\[\d+(?:\s*,\s*\d+)*\])/g);

    return parts.map((part, index) => {
      const match = part.match(/^\[(.*)\]$/);
      if (match) {
        const nums = match[1].split(',').map((n) => parseInt(n.trim(), 10));
        return (
          <span key={index} className="inline-flex gap-0.5 mx-0.5 align-baseline">
            {nums.map((num) => {
              const src = sources[num - 1];
              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => {
                    setActiveSourceHighlight(num);
                    const el = document.getElementById(`source-item-${num}`);
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }
                  }}
                  title={src ? `${src.title} (${src.domain})` : `Source [${num}]`}
                  className="inline-flex items-center justify-center px-1.5 py-0.2 text-[11px] font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 rounded transition-colors"
                >
                  {num}
                </button>
              );
            })}
          </span>
        );
      }

      // Format bold markdown **text**
      const boldParts = part.split(/(\*\*.*?\*\*)/g);
      return boldParts.map((subPart, subIdx) => {
        if (subPart.startsWith('**') && subPart.endsWith('**')) {
          return (
            <strong key={`${index}-${subIdx}`} className="font-semibold text-slate-900">
              {subPart.slice(2, -2)}
            </strong>
          );
        }
        return <span key={`${index}-${subIdx}`}>{subPart}</span>;
      });
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-amber-200/70 p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden mb-6">
      {/* Decorative subtle Indian saffron header accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-emerald-600 to-navy-900" />

      {/* Header with AI Brand badge and Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 border-b border-slate-100 mb-4">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="p-1 rounded-lg bg-amber-50 text-amber-600 shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
            {language === 'hi' ? 'खोजा एआई उत्तर' : 'Khoza AI Synthesis'}
          </span>
          <span className="text-[11px] text-slate-400 font-normal shrink-0">
            · {language === 'hi' ? 'सत्यापित' : 'Cited'}
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
            title="Copy answer"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? (language === 'hi' ? 'कॉपी' : 'Copied') : (language === 'hi' ? 'कॉपी' : 'Copy')}</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
            title="Share"
          >
            <Share2 className="w-3 h-3" />
            <span>{shared ? 'Done' : (language === 'hi' ? 'साझा' : 'Share')}</span>
          </button>

          {onRegenerate && (
            <button
              onClick={onRegenerate}
              className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
              title="Regenerate answer"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Answer Body */}
      <div className="text-slate-800 text-sm sm:text-base leading-relaxed whitespace-pre-line mb-5">
        {renderFormattedText(answer.text)}
      </div>

      {/* Uncertainty Disclaimer if applicable */}
      {answer.disclaimer && (
        <div className="flex items-start gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 mb-5">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>{answer.disclaimer}</span>
        </div>
      )}

      {/* Cited Sources section */}
      {sources.length > 0 && (
        <div className="mt-5 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              {language === 'hi' ? 'सत्यापित स्रोत एवं संदर्भ' : 'Verified Sources & Citations'} ({sources.length})
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {sources.map((source, idx) => {
              const citationIndex = idx + 1;
              const isHighlighted = activeSourceHighlight === citationIndex;

              return (
                <a
                  key={source.id}
                  id={`source-item-${citationIndex}`}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group flex items-start gap-2.5 p-2.5 rounded-lg border text-left transition-all ${
                    isHighlighted
                      ? 'bg-amber-50/80 border-amber-400 ring-2 ring-amber-400/20'
                      : 'bg-slate-50/70 border-slate-200/80 hover:bg-white hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <span className="flex items-center justify-center w-5 h-5 rounded bg-white border border-slate-200 text-[10px] font-bold text-slate-700 shrink-0 mt-0.5">
                    {citationIndex}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-slate-900 group-hover:text-blue-600 truncate transition-colors">
                      {source.title}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                      <span>{source.domain}</span>
                      {source.publicationDate && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>{source.publicationDate}</span>
                        </>
                      )}
                    </p>
                  </div>
                  <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-blue-600 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* Suggested Follow-up Queries */}
      {answer.suggestedFollowUps && answer.suggestedFollowUps.length > 0 && (
        <div className="mt-5 pt-4 border-t border-slate-100">
          <p className="text-xs font-medium text-slate-500 mb-2">
            {language === 'hi' ? 'संबंधित प्रश्न खोजें:' : 'Explore related questions:'}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {answer.suggestedFollowUps.map((followUp, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onFollowUpClick(followUp)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-amber-50 hover:text-amber-900 hover:border-amber-200 border border-transparent rounded-lg text-xs text-slate-700 transition-colors text-left"
              >
                + {followUp}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
