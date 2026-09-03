export interface IDXBroker {
  code: string;
  name: string;
  is_foreign: boolean;
  cohort: string;
}

export const IDX_BROKERS_MAP: Record<string, IDXBroker> = {
  "AD": { code: "AD", name: "Sukadana Prima Sekuritas", is_foreign: false, cohort: "institutional" },
  "AF": { code: "AF", name: "Harita Kencana Sekuritas", is_foreign: false, cohort: "mixed" },
  "AG": { code: "AG", name: "Kiwoom Sekuritas Indonesia", is_foreign: true, cohort: "institutional" },
  "AH": { code: "AH", name: "Shinhan Sekuritas Indonesia", is_foreign: true, cohort: "institutional" },
  "AI": { code: "AI", name: "Kay Hian Sekuritas", is_foreign: true, cohort: "institutional" },
  "AK": { code: "AK", name: "UBS Sekuritas Indonesia", is_foreign: true, cohort: "institutional" },
  "AO": { code: "AO", name: "Erdikha Elit Sekuritas", is_foreign: false, cohort: "mixed" },
  "AP": { code: "AP", name: "Pacific Sekuritas Indonesia", is_foreign: false, cohort: "unknown" },
  "AR": { code: "AR", name: "Binaartha Sekuritas", is_foreign: false, cohort: "institutional" },
  "AT": { code: "AT", name: "Phintraco Sekuritas", is_foreign: false, cohort: "mixed" },
  "AZ": { code: "AZ", name: "Sucor Sekuritas", is_foreign: false, cohort: "mixed" },
  "BB": { code: "BB", name: "Verdhana Sekuritas Indonesia", is_foreign: true, cohort: "institutional" },
  "BF": { code: "BF", name: "Inti Fikasa Sekuritas", is_foreign: false, cohort: "mixed" },
  "BK": { code: "BK", name: "J.P. Morgan Sekuritas Indonesia", is_foreign: true, cohort: "institutional" },
  "BQ": { code: "BQ", name: "Korea Investment & Sekuritas", is_foreign: true, cohort: "institutional" },
  "BR": { code: "BR", name: "Trust Sekuritas", is_foreign: false, cohort: "mixed" },
  "BS": { code: "BS", name: "Equity Sekuritas Indonesia", is_foreign: false, cohort: "mixed" },
  "CC": { code: "CC", name: "Mandiri Sekuritas", is_foreign: false, cohort: "mixed" },
  "CD": { code: "CD", name: "Mega Capital Sekuritas", is_foreign: false, cohort: "mixed" },
  "CP": { code: "CP", name: "KB Valbury Sekuritas", is_foreign: true, cohort: "institutional" },
  "DD": { code: "DD", name: "Makindo Sekuritas", is_foreign: false, cohort: "retail" },
  "DH": { code: "DH", name: "Sinarmas Sekuritas", is_foreign: false, cohort: "mixed" },
  "DP": { code: "DP", name: "DBS Vickers Sekuritas", is_foreign: true, cohort: "institutional" },
  "DR": { code: "DR", name: "RHB Sekuritas Indonesia", is_foreign: true, cohort: "institutional" },
  "DU": { code: "DU", name: "Kaf Sekuritas Indonesia", is_foreign: false, cohort: "institutional" },
  "DX": { code: "DX", name: "Bahana Sekuritas", is_foreign: false, cohort: "mixed" },
  "EL": { code: "EL", name: "Evergreen Sekuritas", is_foreign: false, cohort: "mixed" },
  "EP": { code: "EP", name: "MNC Sekuritas", is_foreign: false, cohort: "mixed" },
  "ES": { code: "ES", name: "Ekokapital Sekuritas", is_foreign: false, cohort: "mixed" },
  "FO": { code: "FO", name: "Forte Global Sekuritas", is_foreign: false, cohort: "unknown" },
  "FS": { code: "FS", name: "Yuanta Sekuritas Indonesia", is_foreign: true, cohort: "institutional" },
  "FZ": { code: "FZ", name: "Waterfront Sekuritas", is_foreign: false, cohort: "institutional" },
  "GA": { code: "GA", name: "Bnc Sekuritas Indonesia", is_foreign: false, cohort: "institutional" },
  "GI": { code: "GI", name: "Webull Sekuritas Indonesia", is_foreign: true, cohort: "institutional" },
  "GR": { code: "GR", name: "Panin Sekuritas", is_foreign: false, cohort: "mixed" },
  "HD": { code: "HD", name: "KGI Sekuritas Indonesia", is_foreign: true, cohort: "institutional" },
  "HP": { code: "HP", name: "Henan Putihrai Sekuritas", is_foreign: false, cohort: "mixed" },
  "IC": { code: "IC", name: "Integrity Capital Sekuritas", is_foreign: false, cohort: "institutional" },
  "ID": { code: "ID", name: "Anugerah Sekuritas Indonesia", is_foreign: false, cohort: "mixed" },
  "IF": { code: "IF", name: "Samuel Sekuritas Indonesia", is_foreign: false, cohort: "mixed" },
  "IH": { code: "IH", name: "Indo Harvest Sekuritas", is_foreign: false, cohort: "mixed" },
  "II": { code: "II", name: "Danatama Makmur Sekuritas", is_foreign: false, cohort: "institutional" },
  "IN": { code: "IN", name: "Investindo Nusantara Sekuritas", is_foreign: false, cohort: "institutional" },
  "IT": { code: "IT", name: "Inti Teladan Sekuritas", is_foreign: false, cohort: "mixed" },
  "IU": { code: "IU", name: "Indo Capital Sekuritas", is_foreign: false, cohort: "institutional" },
  "KI": { code: "KI", name: "Ciptadana Sekuritas Asia", is_foreign: false, cohort: "mixed" },
  "KK": { code: "KK", name: "Phillip Sekuritas Indonesia", is_foreign: true, cohort: "institutional" },
  "KZ": { code: "KZ", name: "CLSA Sekuritas Indonesia", is_foreign: true, cohort: "institutional" },
  "LG": { code: "LG", name: "Trimegah Sekuritas Indonesia", is_foreign: false, cohort: "mixed" },
  "LS": { code: "LS", name: "Reliance Sekuritas Indonesia", is_foreign: false, cohort: "mixed" },
  "MG": { code: "MG", name: "Semesta Indovest Sekuritas", is_foreign: false, cohort: "institutional" },
  "MI": { code: "MI", name: "Victoria Sekuritas Indonesia", is_foreign: false, cohort: "mixed" },
  "MU": { code: "MU", name: "Minna Padi Investama Sekuritas", is_foreign: false, cohort: "institutional" },
  "NI": { code: "NI", name: "BNI Sekuritas", is_foreign: false, cohort: "mixed" },
  "OD": { code: "OD", name: "BRI Danareksa Sekuritas", is_foreign: false, cohort: "mixed" },
  "OK": { code: "OK", name: "Net Sekuritas", is_foreign: false, cohort: "institutional" },
  "PC": { code: "PC", name: "Fac Sekuritas Indonesia", is_foreign: false, cohort: "mixed" },
  "PD": { code: "PD", name: "Indo Premier Sekuritas", is_foreign: false, cohort: "mixed" },
  "PF": { code: "PF", name: "Danasakti Sekuritas", is_foreign: false, cohort: "mixed" },
  "PG": { code: "PG", name: "Panca Global Sekuritas", is_foreign: false, cohort: "mixed" },
  "PI": { code: "PI", name: "Magenta Kapital Sekuritas", is_foreign: false, cohort: "mixed" },
  "PO": { code: "PO", name: "Pilarmas Investindo Sekuritas", is_foreign: false, cohort: "mixed" },
  "PP": { code: "PP", name: "Aldiracita Sekuritas", is_foreign: false, cohort: "retail" },
  "QA": { code: "QA", name: "Tuntun Sekuritas Indonesia", is_foreign: false, cohort: "retail" },
  "RB": { code: "RB", name: "Ina Sekuritas Indonesia", is_foreign: false, cohort: "institutional" },
  "RF": { code: "RF", name: "Buana Capital Sekuritas", is_foreign: false, cohort: "institutional" },
  "RG": { code: "RG", name: "Profindo Sekuritas Indonesia", is_foreign: false, cohort: "institutional" },
  "RO": { code: "RO", name: "Pluang Maju Sekuritas", is_foreign: false, cohort: "mixed" },
  "RS": { code: "RS", name: "Yulie Sekuritas Indonesia", is_foreign: false, cohort: "mixed" },
  "RX": { code: "RX", name: "Macquarie Sekuritas Indonesia", is_foreign: true, cohort: "institutional" },
  "SA": { code: "SA", name: "Elit Sukses Sekuritas", is_foreign: false, cohort: "mixed" },
  "SF": { code: "SF", name: "Surya Fajar Sekuritas", is_foreign: false, cohort: "mixed" },
  "SH": { code: "SH", name: "Artha Sekuritas Indonesia", is_foreign: false, cohort: "mixed" },
  "SQ": { code: "SQ", name: "BCA Sekuritas", is_foreign: false, cohort: "mixed" },
  "SS": { code: "SS", name: "Supra Sekuritas Indonesia", is_foreign: false, cohort: "institutional" },
  "TF": { code: "TF", name: "Laba Sekuritas Indonesia", is_foreign: false, cohort: "institutional" },
  "TP": { code: "TP", name: "OCBC Sekuritas Indonesia", is_foreign: true, cohort: "institutional" },
  "TS": { code: "TS", name: "Dwidana Sakti Sekuritas", is_foreign: false, cohort: "mixed" },
  "XA": { code: "XA", name: "NH Korindo Sekuritas", is_foreign: true, cohort: "institutional" },
  "XC": { code: "XC", name: "Ajaib Sekuritas Asia", is_foreign: false, cohort: "retail" },
  "XL": { code: "XL", name: "Stockbit Sekuritas Digital", is_foreign: false, cohort: "retail" },
  "YB": { code: "YB", name: "Yakin Bertumbuh Sekuritas", is_foreign: false, cohort: "mixed" },
  "YJ": { code: "YJ", name: "Lotus Andalan Sekuritas", is_foreign: false, cohort: "institutional" },
  "YO": { code: "YO", name: "Amantara Sekuritas Indonesia", is_foreign: false, cohort: "mixed" },
  "YP": { code: "YP", name: "Mirae Asset Sekuritas", is_foreign: true, cohort: "institutional" },
  "YU": { code: "YU", name: "CGS International Sekuritas", is_foreign: true, cohort: "institutional" },
  "ZP": { code: "ZP", name: "Maybank Sekuritas Indonesia", is_foreign: true, cohort: "institutional" },
  "ZR": { code: "ZR", name: "Bumiputera Sekuritas", is_foreign: false, cohort: "mixed" }
};

export function getBrokerName(code: string): string {
  if (!code) return 'Broker Unknown';
  const cleanCode = code.toUpperCase().trim();
  return IDX_BROKERS_MAP[cleanCode]?.name || `Broker ${cleanCode}`;
}

export function getBrokerInfo(code: string): IDXBroker {
  if (!code) return { code: '??', name: 'Unknown Broker', is_foreign: false, cohort: 'mixed' };
  const cleanCode = code.toUpperCase().trim();
  return IDX_BROKERS_MAP[cleanCode] || { code: cleanCode, name: `Broker ${cleanCode}`, is_foreign: false, cohort: 'mixed' };
}
