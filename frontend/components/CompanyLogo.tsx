'use client';

import React, { useState } from 'react';

interface CompanyLogoProps {
  symbol: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  rounded?: string;
  alt?: string;
}

const sizeClasses = {
  xs: 'w-5 h-5 text-[9px]',
  sm: 'w-7 h-7 text-[10px]',
  md: 'w-9 h-9 text-xs',
  lg: 'w-12 h-12 text-sm font-bold',
  xl: 'w-16 h-16 text-base font-bold',
};

export const CompanyLogo: React.FC<CompanyLogoProps> = ({
  symbol,
  size = 'md',
  className = '',
  rounded = 'rounded-xl',
  alt,
}) => {
  const [hasError, setHasError] = useState(false);
  
  if (!symbol) return null;
  const cleanTicker = symbol.replace('.JK', '').toUpperCase().trim();
  const logoSrc = `/images/listed-company-icons/${cleanTicker}.png`;

  if (hasError) {
    return (
      <div 
        className={`shrink-0 ${sizeClasses[size]} ${rounded} bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-slate-300 select-none shadow-sm ${className}`}
        title={alt || cleanTicker}
      >
        <span>{cleanTicker.slice(0, 4)}</span>
      </div>
    );
  }

  return (
    <div className={`relative shrink-0 ${sizeClasses[size]} ${rounded} overflow-hidden bg-slate-900/90 border border-slate-800 p-0.5 flex items-center justify-center shadow-sm ${className}`}>
      <img
        src={logoSrc}
        alt={alt || `${cleanTicker} Logo`}
        className="w-full h-full object-contain"
        onError={() => setHasError(true)}
        loading="lazy"
      />
    </div>
  );
};
