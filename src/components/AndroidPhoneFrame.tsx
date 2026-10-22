import React from 'react';
import { Wifi, BatteryMedium, Signal, Smartphone } from 'lucide-react';

interface AndroidPhoneFrameProps {
  children: React.ReactNode;
  active: boolean;
  onToggle: () => void;
  language?: 'en' | 'hi';
}

export const AndroidPhoneFrame: React.FC<AndroidPhoneFrameProps> = ({
  children,
  active,
  onToggle,
  language = 'en',
}) => {
  if (!active) {
    return <>{children}</>;
  }

  // Current time for Android status bar
  const currentTime = new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return (
    <div className="min-h-screen bg-slate-900/90 py-4 sm:py-8 px-2 flex flex-col items-center justify-center">
      {/* Top Controller Switcher */}
      <div className="w-full max-w-sm mb-3 flex items-center justify-between text-xs text-slate-300 px-2">
        <div className="flex items-center gap-1.5 font-medium">
          <Smartphone className="w-4 h-4 text-amber-400" />
          <span>{language === 'hi' ? 'एंड्रॉइड मटेरियल 3 सिम्युलेटर' : 'Android Material 3 Simulator'}</span>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-md border border-slate-700 transition-colors"
        >
          {language === 'hi' ? 'वेब दृश्य में बदलें' : 'Switch to Full Web'}
        </button>
      </div>

      {/* Simulated Android Device Shell */}
      <div className="w-full max-w-[392px] h-[830px] bg-white rounded-[44px] shadow-2xl border-[10px] border-slate-800 relative flex flex-col overflow-hidden ring-1 ring-white/10">
        {/* Android Punch-hole Camera */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-black rounded-full z-50 pointer-events-none" />

        {/* Android Status Bar */}
        <div className="h-8 bg-white/95 backdrop-blur-xs flex items-center justify-between px-6 text-[12px] font-semibold text-slate-800 z-40 select-none border-b border-slate-100">
          <span>{currentTime}</span>
          <div className="flex items-center gap-1.5 text-slate-700">
            <span className="text-[10px] font-bold">5G</span>
            <Signal className="w-3 h-3" />
            <Wifi className="w-3 h-3" />
            <BatteryMedium className="w-4 h-4" />
          </div>
        </div>

        {/* App Content viewport */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col bg-[#FDFBF7]">
          {children}
        </div>

        {/* Android Bottom Navigation Pill */}
        <div className="h-6 bg-white flex items-center justify-center shrink-0 border-t border-slate-100">
          <div className="w-28 h-1 bg-slate-300 rounded-full" />
        </div>
      </div>
    </div>
  );
};
