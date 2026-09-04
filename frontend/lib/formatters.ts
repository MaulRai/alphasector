/**
 * Centralized formatting utilities for numbers, currencies, percentages, and dates
 * across all AlphaSector UI pages and components.
 */

export function formatVal(val: any, decimals: number = 2, suffix: string = ''): string {
  if (val === null || val === undefined || isNaN(Number(val))) return '-';
  return `${Number(val).toFixed(decimals)}${suffix}`;
}

export function formatTrillion(val: any, decimals: number = 1): string {
  if (val === null || val === undefined || isNaN(Number(val))) return '-';
  const num = Number(val);
  return `Rp ${(num / 1e12).toFixed(decimals)} T`;
}

export function formatRupiah(val: any): string {
  if (val === null || val === undefined || isNaN(Number(val))) return '-';
  return `Rp ${Number(val).toLocaleString('id-ID')}`;
}

export function formatPercent(val: any, decimals: number = 2, includeSign: boolean = false): string {
  if (val === null || val === undefined || isNaN(Number(val))) return '-';
  const num = Number(val);
  const sign = includeSign && num > 0 ? '+' : '';
  return `${sign}${num.toFixed(decimals)}%`;
}

export function formatLastInteraction(dateStr?: string): string {
  if (!dateStr) return 'Baru saja';
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} mnt lalu`;
    if (diffHours < 24 && now.getDate() === d.getDate()) {
      return `Hari ini, ${d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;
    }
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  } catch {
    return 'Baru saja';
  }
}
