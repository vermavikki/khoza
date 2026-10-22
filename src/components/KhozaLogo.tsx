import React from 'react';

interface KhozaLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  language?: 'en' | 'hi';
}

export const KhozaLogo: React.FC<KhozaLogoProps> = ({
  size = 'lg',
  showSubtitle = true,
  language = 'en',
}) => {
  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl sm:text-5xl',
    xl: 'text-5xl sm:text-6xl',
  };

  const iconSizes = {
    sm: 20,
    md: 26,
    lg: 36,
    xl: 44,
  };

  return (
    <div className="flex flex-col items-center select-none text-center">
      <div className="flex items-center gap-2">
        {/* Original Indian Discovery Sun & Chakra Motif */}
        <svg
          width={iconSizes[size]}
          height={iconSizes[size]}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform duration-300 hover:rotate-45"
          aria-hidden="true"
        >
          {/* Outer rays */}
          <circle cx="24" cy="24" r="20" stroke="#F28C28" strokeWidth="2.5" strokeDasharray="3 3" />
          {/* Inner circle */}
          <circle cx="24" cy="24" r="13" fill="#14213D" />
          {/* Central Indian green motif core */}
          <circle cx="24" cy="24" r="6" fill="#16845B" />
          {/* Golden discovery ray pointer */}
          <path d="M24 6L26 15H22L24 6Z" fill="#F28C28" />
          <path d="M24 42L22 33H26L24 42Z" fill="#F28C28" />
          <path d="M6 24L15 22V26L6 24Z" fill="#F28C28" />
          <path d="M42 24L33 26V22L42 24Z" fill="#F28C28" />
        </svg>

        {/* Wordmark */}
        <span
          className={`font-bold tracking-tight ${sizeClasses[size]}`}
          style={{ color: '#14213D' }}
        >
          Kho<span style={{ color: '#F28C28' }}>z</span><span style={{ color: '#16845B' }}>a</span>
        </span>
      </div>

      {showSubtitle && (
        <span className="text-xs sm:text-sm font-medium text-slate-500 mt-1 tracking-wide">
          {language === 'hi' ? 'खोजा · भारत का अपना एआई सर्च इंजन' : 'India’s AI Search & Knowledge Engine'}
        </span>
      )}
    </div>
  );
};
