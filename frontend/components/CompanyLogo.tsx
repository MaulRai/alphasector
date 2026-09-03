'use client';

import React, { useState } from 'react';

interface CompanyLogoProps {
  symbol: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  alt?: string;
}

const sizeClasses = {
  xs: 'w-4.5 h-4.5 min-w-[18px] min-h-[18px] text-[8px]',
  sm: 'w-6 h-6 min-w-[24px] min-h-[24px] text-[9px]',
  md: 'w-8 h-8 min-w-[32px] min-h-[32px] text-xs',
  lg: 'w-11 h-11 min-w-[44px] min-h-[44px] text-sm font-bold',
  xl: 'w-14 h-14 min-w-[56px] min-h-[56px] text-base font-bold',
};

export const CompanyLogo: React.FC<CompanyLogoProps> = ({
  symbol,
  size = 'md',
  className = '',
  alt,
}) => {
  const [hasError, setHasError] = useState(false);
  
  if (!symbol) return null;
  const cleanTicker = symbol.replace('.JK', '').toUpperCase().trim();
  const logoSrc = `/images/listed-company-icons/${cleanTicker}.png`;

  if (hasError) {
    return (
      <div 
        className={`shrink-0 ${sizeClasses[size]} rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300 select-none ${className}`}
        title={alt || cleanTicker}
      >
        <span>{cleanTicker.slice(0, 3)}</span>
      </div>
    );
  }

  return (
    <img
      src={logoSrc}
      alt={alt || `${cleanTicker} Logo`}
      className={`shrink-0 ${sizeClasses[size]} rounded-full object-contain ${className}`}
      onError={() => setHasError(true)}
      loading="lazy"
    />
  );
};
