'use client';

import React, { useState, useRef, useEffect } from 'react';
import { POPULAR_IDX_TICKERS, IDXTickerItem } from '@/lib/idx-tickers';
import { Search, Plus, Check } from 'lucide-react';

interface TickerAutocompleteInputProps {
  onSelectTicker: (symbol: string) => void;
  selectedTickers?: string[];
  placeholder?: string;
  maxSelected?: number;
  disabled?: boolean;
  buttonText?: string;
  className?: string;
}

export const TickerAutocompleteInput: React.FC<TickerAutocompleteInputProps> = ({
  onSelectTicker,
  selectedTickers = [],
  placeholder = 'Tambah kode emiten...',
  maxSelected = 4,
  disabled = false,
  buttonText = 'Tambah',
  className = '',
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Normalize selected symbols
  const normalizedSelected = selectedTickers.map((s) => s.toUpperCase().trim());

  // Filter available suggestions
  const filteredSuggestions: IDXTickerItem[] = POPULAR_IDX_TICKERS.filter((item) => {
    // 1. Exclude already selected
    if (normalizedSelected.includes(item.symbol.toUpperCase())) {
      return false;
    }
    // 2. Filter by search query if typed
    if (!query.trim()) return true;
    const cleanQuery = query.toLowerCase().trim();
    return (
      item.symbol.toLowerCase().includes(cleanQuery) ||
      item.name.toLowerCase().includes(cleanQuery) ||
      item.sector.toLowerCase().includes(cleanQuery)
    );
  }).slice(0, 8); // Display top 8 matching recommendations

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (symbol: string) => {
    if (disabled || (selectedTickers.length >= maxSelected && !normalizedSelected.includes(symbol.toUpperCase()))) {
      return;
    }
    onSelectTicker(symbol.toUpperCase().trim());
    setQuery('');
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (highlightedIndex >= 0 && highlightedIndex < filteredSuggestions.length) {
      handleSelect(filteredSuggestions[highlightedIndex].symbol);
      return;
    }
    if (query.trim()) {
      handleSelect(query.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < filteredSuggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filteredSuggestions.length - 1));
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const isLimitReached = selectedTickers.length >= maxSelected;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="relative flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={query}
            disabled={disabled || isLimitReached}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
              setHighlightedIndex(0);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={isLimitReached ? `Maksimal ${maxSelected} emiten` : placeholder}
            className="px-3.5 py-1.5 text-xs bg-slate-900/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 uppercase w-48 sm:w-56 transition-all disabled:opacity-50"
            maxLength={10}
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="absolute right-2.5 text-slate-500 hover:text-slate-300 text-xs font-bold"
            >
              ×
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={disabled || !query.trim() || isLimitReached}
          className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-bold text-xs transition-all disabled:opacity-50 border border-slate-700 shadow-sm"
        >
          <Plus className="h-3.5 w-3.5 text-cyan-400" />
          <span>{buttonText}</span>
        </button>
      </form>

      {/* Floating Suggestions Dropdown */}
      {isOpen && !isLimitReached && (
        <div className="absolute top-full right-0 mt-1.5 w-72 sm:w-80 bg-[#0c101c]/95 border border-slate-700/90 rounded-2xl shadow-2xl backdrop-blur-xl z-50 overflow-hidden py-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3 py-1.5 border-b border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span>{query.trim() ? `Hasil Pencarian: "${query}"` : 'Saran Emiten Pilihan'}</span>
            <span className="text-[10px] text-slate-500">Klik untuk pilih</span>
          </div>

          <div className="max-h-60 overflow-y-auto divide-y divide-slate-800/40">
            {filteredSuggestions.length > 0 ? (
              filteredSuggestions.map((item, idx) => (
                <button
                  key={item.symbol}
                  type="button"
                  onClick={() => handleSelect(item.symbol)}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  className={`w-full px-3.5 py-2 text-left flex items-center justify-between gap-3 transition-colors ${
                    highlightedIndex === idx ? 'bg-cyan-500/15 text-white' : 'hover:bg-slate-800/60 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-7 w-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-cyan-400 shrink-0">
                      {item.symbol.slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white text-xs">{item.symbol}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800/80 text-slate-400 border border-slate-700/60 truncate">
                          {item.sector}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">
                        {item.name}
                      </div>
                    </div>
                  </div>

                  <div className="p-1 rounded bg-slate-800/60 text-slate-400 shrink-0">
                    <Plus className="h-3 w-3 text-cyan-400" />
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-center text-xs text-slate-400">
                {query.trim() ? (
                  <div>
                    <p className="text-slate-300">
                      Tekan Enter untuk menambahkan <span className="font-bold text-cyan-400 uppercase">{query}</span>
                    </p>
                  </div>
                ) : (
                  <p>Semua saran telah terpilih</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
