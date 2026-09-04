import { ChatSession } from '@/lib/types';

export const STOPWORDS_SESSION = new Set([
  'BATU', 'BARA', 'SAHM', 'SAHA', 'KOTA', 'DANA', 'PROS', 'EMIT', 'SEKT', 'JASA',
  'LUAR', 'BAIK', 'JELE', 'BESR', 'KECI', 'KUAT', 'LEMA', 'MURH', 'MAHL', 'TING',
  'REND', 'SKOR', 'HASI', 'TAMP', 'TIPE', 'JENI', 'KATA', 'BANY', 'SEDI', 'PERK',
  'SEMI', 'GAYA', 'TEMA', 'MODL', 'EFIS', 'KARY', 'LEAD', 'TITN', 'GROW', 'VALU',
  'DIVI', 'YILD', 'ROEE', 'ROAA', 'DERR', 'NPMM', 'PBVV', 'PERR', 'MCAP', 'CAPS',
  'SEGI', 'CARA', 'OPSI', 'PILI', 'MENU', 'TABL', 'ROWW', 'COLL', 'KOLO', 'SLOT',
  'CARI', 'CEK', 'LIAT', 'BAGI', 'BACA', 'MAU', 'DENG', 'DATA', 'INFO', 'PEER',
  'FLOW', 'FUND', 'BANK', 'LABA', 'RUGI', 'NAIK', 'TURU', 'JUAL', 'BELI', 'RISK',
  'DEBT', 'YIEL', 'VIEW', 'LIST', 'HELP', 'BEST', 'GOOD', 'MORE', 'LESS', 'SHOW',
  'FIND', 'RANK', 'GAIN', 'LOSS', 'RATE', 'TIME', 'DATE', 'TEST', 'CODE', 'TYPE',
  'TEXT', 'FREE', 'PAGE', 'USER', 'CHAT', 'AUTO', 'TERM', 'COST', 'DEAL', 'SEEK',
  'FAST', 'SLOW', 'TRUE', 'ELSE', 'NULL', 'ITEM', 'NEWS', 'PORT', 'DARI', 'YANG',
  'PADA', 'BISA', 'KITA', 'ATAU', 'IKUT', 'MAKA', 'AKAN', 'SAAT', 'JUGA', 'KAMI',
  'ADAK', 'POST', 'JSON', 'HTTP', 'REST', 'BEDA', 'MANA', 'BUAT', 'PULA', 'SAJA',
  'POIN', 'SATU', 'DUAA', 'TIGA', 'LIMA', 'ENAM', 'RIBU', 'JUTA', 'TRIL', 'SINI',
  'SANA', 'SITU', 'APAL', 'AGAR', 'BIAR', 'SIAP', 'PERU', 'INDX', 'KAYA', 'TREN',
  'POLA', 'AWAL', 'AKHR', 'BLAN', 'THUN', 'HARI', 'MING', 'TAHN', 'KIRA', 'SUDA',
  'TELH', 'LALU', 'KEMU', 'KINI', 'HANY', 'CUMA', 'LAIN', 'BEBR', 'TRUS', 'DULU',
  'LGIK', 'MASI', 'MASA', 'SAMA', 'SEGI'
]);

export function extractSessionTickers(session: ChatSession): string[] {
  const text = `${session.title || ''} ${session.primary_ticker || ''}`;
  const matches = text.match(/\b[A-Z]{4}\b/g) || [];
  const validTickers: string[] = [];
  
  for (const m of matches) {
    const sym = m.toUpperCase();
    if (!STOPWORDS_SESSION.has(sym) && !validTickers.includes(sym)) {
      validTickers.push(sym);
    }
  }

  if (validTickers.length === 0 && session.primary_ticker) {
    const sym = session.primary_ticker.toUpperCase().replace('.JK', '');
    if (!STOPWORDS_SESSION.has(sym) && !validTickers.includes(sym)) {
      validTickers.push(sym);
    }
  }

  return validTickers.slice(0, 4);
}
