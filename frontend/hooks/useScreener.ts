'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchScreener, fetchTradeIdeaPreset, fetchSubsectors } from '@/lib/api';

const SCREENER_STORAGE_KEY = 'alphasector_screener_cache';

export function useScreener() {
  const [nlQuery, setNlQuery] = useState('');
  const [selectedSubsector, setSelectedSubsector] = useState('');
  const [orderBy, setOrderBy] = useState('-market_cap');
  const [subsectors, setSubsectors] = useState<string[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedTickersForBattle, setSelectedTickersForBattle] = useState<string[]>([]);

  // Toggle ticker for battle (max 4)
  const toggleTickerForBattle = useCallback((sym: string) => {
    setSelectedTickersForBattle((prev) => {
      if (prev.includes(sym)) {
        return prev.filter((t) => t !== sym);
      }
      if (prev.length >= 4) {
        return prev;
      }
      return [...prev, sym];
    });
  }, []);

  // Restore previous screener state from memory on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(SCREENER_STORAGE_KEY) || localStorage.getItem(SCREENER_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.results && Array.isArray(parsed.results) && parsed.results.length > 0) {
          setResults(parsed.results);
          setHasSearched(true);
          if (parsed.activePreset !== undefined) setActivePreset(parsed.activePreset);
          if (parsed.nlQuery !== undefined) setNlQuery(parsed.nlQuery);
          if (parsed.selectedSubsector !== undefined) setSelectedSubsector(parsed.selectedSubsector);
          if (parsed.orderBy !== undefined) setOrderBy(parsed.orderBy);
          if (parsed.selectedTickersForBattle !== undefined) setSelectedTickersForBattle(parsed.selectedTickersForBattle);
        }
      }
    } catch (e) {
      console.warn('Failed to parse cached screener state:', e);
    }
  }, []);

  // Save screener state to memory whenever results or filters change
  useEffect(() => {
    if (hasSearched && results && results.length > 0) {
      try {
        const stateToSave = {
          results,
          activePreset,
          nlQuery,
          selectedSubsector,
          orderBy,
          hasSearched,
          selectedTickersForBattle,
          savedAt: Date.now()
        };
        const str = JSON.stringify(stateToSave);
        sessionStorage.setItem(SCREENER_STORAGE_KEY, str);
        localStorage.setItem(SCREENER_STORAGE_KEY, str);
      } catch (e) {
        console.warn('Failed to cache screener state:', e);
      }
    }
  }, [results, activePreset, nlQuery, selectedSubsector, orderBy, hasSearched, selectedTickersForBattle]);

  // Load subsectors list on mount
  useEffect(() => {
    fetchSubsectors()
      .then((data) => {
        if (Array.isArray(data)) setSubsectors(data);
        else if (data && data.subsectors) setSubsectors(data.subsectors);
      })
      .catch((err) => console.error('Failed to load subsectors:', err));
  }, []);

  const handleFilterSearch = useCallback(async (whereClause?: string, customOrder?: string) => {
    setIsLoading(true);
    setError(null);
    setHasSearched(true);
    try {
      const res = await fetchScreener({
        where: whereClause || (selectedSubsector ? `sub_sector = '${selectedSubsector}'` : undefined),
        order_by: customOrder || orderBy,
        limit: 25,
      });
      if (res && res.data && Array.isArray(res.data)) {
        setResults(res.data);
      } else if (res && res.data && res.data.results) {
        setResults(res.data.results);
      } else {
        setResults([]);
      }
    } catch (err: any) {
      setError(err.message || 'Gagal memfilter emiten.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedSubsector, orderBy]);

  const handleNlSearch = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!nlQuery.trim()) return;
    setIsLoading(true);
    setError(null);
    setActivePreset(null);
    setHasSearched(true);
    try {
      const res = await fetchScreener({ q: nlQuery.trim(), limit: 25 });
      if (res && res.data && Array.isArray(res.data)) {
        setResults(res.data);
      } else if (res && res.data && res.data.results) {
        setResults(res.data.results);
      } else {
        setResults([]);
      }
    } catch (err: any) {
      setError(err.message || 'Gagal mengeksekusi natural language query.');
    } finally {
      setIsLoading(false);
    }
  }, [nlQuery]);

  const handleSelectPreset = useCallback(async (slug: string) => {
    setIsLoading(true);
    setError(null);
    setActivePreset(slug);
    setHasSearched(true);
    try {
      const res = await fetchTradeIdeaPreset(slug);
      if (res && res.data && Array.isArray(res.data)) {
        setResults(res.data);
      } else if (res && res.data && res.data.results) {
        setResults(res.data.results);
      } else {
        setResults([]);
      }
    } catch (err: any) {
      setError(err.message || `Gagal memuat preset ${slug}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getScreeningThesisQuery = useCallback(() => {
    if (activePreset === 'esg-leaders') {
      return 'Analisis tesis investasi, katalis sektor, dan rekomendasi emiten unggulan dari hasil screening ESG Leaders IDX';
    }
    if (activePreset === 'revenue-growth') {
      return 'Analisis tesis investasi, katalis sektor, dan rekomendasi emiten unggulan dari hasil screening Revenue Titans IDX';
    }
    if (activePreset === 'large-shareholder') {
      return 'Analisis tesis investasi, kepemilikan pengendali, dan emiten unggulan dari hasil screening Large Shareholder IDX';
    }
    if (activePreset === 'efficient-operators') {
      return 'Analisis tesis efisiensi operasional, profitabilitas per karyawan, dan emiten unggulan dari hasil screening Efficient Operators IDX';
    }
    if (nlQuery.trim()) {
      return `Analisis tesis hasil screening '${nlQuery.trim()}': emiten mana yang paling prospektif dan apa risikonya?`;
    }
    if (selectedSubsector) {
      return `Analisis tesis investasi dan rekomendasi emiten unggulan pada subsektor ${selectedSubsector} berdasarkan hasil screening`;
    }
    return 'Analisis tesis investasi, katalis sektor, dan rekomendasi emiten terbaik dari hasil screening semesta IHSG';
  }, [activePreset, nlQuery, selectedSubsector]);

  return {
    nlQuery,
    setNlQuery,
    selectedSubsector,
    setSelectedSubsector,
    orderBy,
    setOrderBy,
    subsectors,
    results,
    isLoading,
    error,
    activePreset,
    hasSearched,
    selectedTickersForBattle,
    toggleTickerForBattle,
    clearSelectedTickersForBattle: () => setSelectedTickersForBattle([]),
    handleFilterSearch,
    handleNlSearch,
    handleSelectPreset,
    getScreeningThesisQuery,
  };
}
