export interface IDXTickerItem {
  symbol: string;
  name: string;
  sector: string;
}

export const POPULAR_IDX_TICKERS: IDXTickerItem[] = [
  // --- The Big Banks & Financials ---
  { symbol: 'BBCA', name: 'PT Bank Central Asia Tbk.', sector: 'Banks' },
  { symbol: 'BBRI', name: 'PT Bank Rakyat Indonesia Tbk.', sector: 'Banks' },
  { symbol: 'BMRI', name: 'PT Bank Mandiri (Persero) Tbk.', sector: 'Banks' },
  { symbol: 'BBNI', name: 'PT Bank Negara Indonesia Tbk.', sector: 'Banks' },
  { symbol: 'BBTN', name: 'PT Bank Tabungan Negara Tbk.', sector: 'Banks' },
  { symbol: 'BDMN', name: 'PT Bank Danamon Indonesia Tbk.', sector: 'Banks' },
  { symbol: 'BRIS', name: 'PT Bank Syariah Indonesia Tbk.', sector: 'Banks' },
  { symbol: 'ARTO', name: 'PT Bank Jago Tbk.', sector: 'Digital Banking' },

  // --- Energy, Coal, Oil & Gas ---
  { symbol: 'ADRO', name: 'PT Alamtri Resources Indonesia Tbk.', sector: 'Thermal Coal' },
  { symbol: 'PTBA', name: 'PT Bukit Asam Tbk.', sector: 'Thermal Coal' },
  { symbol: 'ITMG', name: 'PT Indo Tambangraya Megah Tbk.', sector: 'Thermal Coal' },
  { symbol: 'BUMI', name: 'PT Bumi Resources Tbk.', sector: 'Thermal Coal' },
  { symbol: 'MEDC', name: 'PT Medco Energi Internasional Tbk.', sector: 'Oil & Gas Exploration' },
  { symbol: 'PGAS', name: 'PT Perusahaan Gas Negara Tbk.', sector: 'Gas Distribution' },
  { symbol: 'BREN', name: 'PT Barito Renewables Energy Tbk.', sector: 'Renewable Energy' },
  { symbol: 'PGEO', name: 'PT Pertamina Geothermal Energy Tbk.', sector: 'Renewable Energy' },

  // --- Metals, Nickel, Copper & Gold ---
  { symbol: 'AMMN', name: 'PT Amman Mineral Internasional Tbk.', sector: 'Copper & Gold' },
  { symbol: 'MDKA', name: 'PT Merdeka Copper Gold Tbk.', sector: 'Copper & Gold' },
  { symbol: 'ANTM', name: 'PT Aneka Tambang Tbk.', sector: 'Gold & Diversified Metals' },
  { symbol: 'INCO', name: 'PT Vale Indonesia Tbk.', sector: 'Nickel & Mining' },
  { symbol: 'MBMA', name: 'PT Merdeka Battery Materials Tbk.', sector: 'Nickel & EV Battery' },
  { symbol: 'NCKL', name: 'PT Trimegah Bangun Persada Tbk.', sector: 'Nickel & Mining' },
  { symbol: 'TINS', name: 'PT Timah Tbk.', sector: 'Tin Mining' },

  // --- Automotive, Heavy Machinery & Industrials ---
  { symbol: 'ASII', name: 'PT Astra International Tbk.', sector: 'Automotive & Conglomerate' },
  { symbol: 'AUTO', name: 'PT Astra Otoparts Tbk.', sector: 'Auto Parts' },
  { symbol: 'SMSM', name: 'PT Selamat Sempurna Tbk.', sector: 'Auto Components' },
  { symbol: 'UNTR', name: 'PT United Tractors Tbk.', sector: 'Heavy Machinery & Mining' },
  { symbol: 'HEXA', name: 'PT Hexindo Adiperkasa Tbk.', sector: 'Heavy Machinery' },

  // --- Consumer Staples & Food Processing ---
  { symbol: 'ICBP', name: 'PT Indofood CBP Sukses Makmur Tbk.', sector: 'Packaged Food & Noodles' },
  { symbol: 'INDF', name: 'PT Indofood Sukses Makmur Tbk.', sector: 'Food & Agriculture' },
  { symbol: 'MYOR', name: 'PT Mayora Indah Tbk.', sector: 'Snacks & Confectionery' },
  { symbol: 'UNVR', name: 'PT Unilever Indonesia Tbk.', sector: 'Personal & Home Care' },
  { symbol: 'CMRY', name: 'PT Cisarua Mountain Dairy Tbk.', sector: 'Dairy & Processed Foods' },
  { symbol: 'CPIN', name: 'PT Charoen Pokphand Indonesia Tbk.', sector: 'Poultry & Feed' },
  { symbol: 'JPFA', name: 'PT Japfa Comfeed Indonesia Tbk.', sector: 'Poultry & Feed' },
  { symbol: 'GGRM', name: 'PT Gudang Garam Tbk.', sector: 'Tobacco' },
  { symbol: 'HMSP', name: 'PT HM Sampoerna Tbk.', sector: 'Tobacco' },

  // --- Retail & Consumer Discretionary ---
  { symbol: 'AMRT', name: 'PT Sumber Alfaria Trijaya Tbk.', sector: 'Convenience Retail' },
  { symbol: 'MAPI', name: 'PT Mitra Adiperkasa Tbk.', sector: 'Lifestyle Retail' },
  { symbol: 'MAPA', name: 'PT MAP Aktif Adiperkasa Tbk.', sector: 'Sports Retail' },
  { symbol: 'ACES', name: 'PT Aspirasi Hidup Indonesia Tbk.', sector: 'Home Improvement' },
  { symbol: 'ERAA', name: 'PT Erajaya Swasembada Tbk.', sector: 'Electronics Retail' },

  // --- Telecommunications & Tech ---
  { symbol: 'TLKM', name: 'PT Telkom Indonesia (Persero) Tbk.', sector: 'Telecommunication' },
  { symbol: 'ISAT', name: 'PT Indosat Tbk. (Indosat Ooredoo)', sector: 'Telecommunication' },
  { symbol: 'EXCL', name: 'PT XL Axiata Tbk.', sector: 'Telecommunication' },
  { symbol: 'TOWR', name: 'PT Sarana Menara Nusantara Tbk.', sector: 'Telecom Towers' },
  { symbol: 'TBIG', name: 'PT Tower Bersama Infrastructure Tbk.', sector: 'Telecom Towers' },
  { symbol: 'GOTO', name: 'PT GoTo Gojek Tokopedia Tbk.', sector: 'E-Commerce & On-Demand' },
  { symbol: 'BUKA', name: 'PT Bukalapak.com Tbk.', sector: 'E-Commerce' },
  { symbol: 'EMTK', name: 'PT Elang Mahkota Teknologi Tbk.', sector: 'Media & Technology' },

  // --- Basic Materials & Petrochemicals ---
  { symbol: 'BRPT', name: 'PT Barito Pacific Tbk.', sector: 'Petrochemicals & Energy' },
  { symbol: 'TPIA', name: 'PT Chandra Asri Pacific Tbk.', sector: 'Petrochemicals' },
  { symbol: 'INKP', name: 'PT Indah Kiat Pulp & Paper Tbk.', sector: 'Paper & Pulp' },
  { symbol: 'TKIM', name: 'PT Pabrik Kertas Tjiwi Kimia Tbk.', sector: 'Paper & Pulp' },
  { symbol: 'SMGR', name: 'PT Semen Indonesia (Persero) Tbk.', sector: 'Cement & Construction' },
  { symbol: 'INTP', name: 'PT Indocement Tunggal Prakarsa Tbk.', sector: 'Cement' },

  // --- Infrastructure & Toll Roads ---
  { symbol: 'JSMR', name: 'PT Jasa Marga (Persero) Tbk.', sector: 'Toll Roads' },

  // --- Property & Real Estate ---
  { symbol: 'BSDE', name: 'PT Bumi Serpong Damai Tbk.', sector: 'Real Estate' },
  { symbol: 'CTRA', name: 'PT Ciputra Development Tbk.', sector: 'Real Estate' },
  { symbol: 'PWON', name: 'PT Pakuwon Jati Tbk.', sector: 'Real Estate & Malls' },
  { symbol: 'SMRA', name: 'PT Summarecon Agung Tbk.', sector: 'Real Estate' },

  // --- Healthcare & Pharmaceuticals ---
  { symbol: 'KLBF', name: 'PT Kalbe Farma Tbk.', sector: 'Pharmaceuticals' },
  { symbol: 'MIKA', name: 'PT Mitra Keluarga Karyasehat Tbk.', sector: 'Hospital Healthcare' },
  { symbol: 'HEAL', name: 'PT Medikaloka Hermina Tbk.', sector: 'Hospital Healthcare' },
  { symbol: 'SILO', name: 'PT Siloam International Hospitals Tbk.', sector: 'Hospital Healthcare' },
  { symbol: 'SIDO', name: 'PT Industri Jamu dan Farmasi Sido Muncul Tbk.', sector: 'Herbal Medicine' },
];
