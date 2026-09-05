# AlphaSector — Design System & Visual Specification

Sistem desain visual AlphaSector mengikuti filosofi **Impeccable Craftsmanship**: terminal intelijen pasar modal yang estetis, presisi, gelap bertint (*deep tinted dark mode*), dan memiliki hierarki visual yang tajam untuk para analis dan investor institusional.

---

## 🎨 Color Palette & Tokens

### Backgrounds (Tinted Obsidian)
- **Canvas Base:** `#07090e` — Hitam malam bertint biru laut dalam (*Deep Obsidian Canvas*).
- **Surface Elevation 1 (Cards & Panels):** `#0a0f1d` — Panel gelap bertekstur kaca halus dengan border `rgba(30, 41, 59, 0.8)`.
- **Surface Elevation 2 (Inputs & Sub-panels):** `#080d1a` — Latar kontrol kueri dan tabel dengan border `rgba(51, 65, 85, 0.6)`.

### Brand Accents & Semantic Signals
- **Emerald Alpha (`#10b981` / `#34d399`):** Sinyal fundamental sehat, profitabilitas positif, nilai Piotroski tinggi, dan tombol aksi utama.
- **Cyan Surge (`#06b6d4` / `#38bdf8`):** Sinyal intelijen kuantitatif, analisis valuasi gap, dan peer battle.
- **Amber Flow (`#f59e0b` / `#fbbf24`):** Sinyal Smart Money, akumulasi broker bandar, dan foreign flow.
- **Rose Alert (`#f43f5e` / `#fb7185`):** Peringatan risiko, kriteria akuntansi gagal, dan tombol destruktif (logout/hapus key).

### Typography
- **Primary Interface Font:** `Inter`, `Outfit`, `ui-sans-serif`, `system-ui`.
- **Financial Numbers & Metrics:** `font-mono`, `tabular-nums` untuk perataan angka harga, rasio P/E, PBV, dan persentase gap.

---

## 📐 Layout & Spacing Rules

1. **Law of Proximity:**
   - Jarak antar elemen terkait: `gap-1.5` hingga `gap-3` (6px - 12px).
   - Jarak antar seksi besar: `gap-6` hingga `gap-8` (24px - 32px).
   - Heading rhythm: Ruang di atas heading selalu $\ge 1.5\times$ ruang di bawahnya.
2. **Elevated Glassmorphism:**
   - `backdrop-blur-xl` + `border border-slate-800/80` + `shadow-2xl`.
   - Halus, tanpa kontras kasar yang melelahkan mata analis pada sesi riset panjang.
3. **Interactive Feedback:**
   - Semua tombol dan link interaktif: `transition-all duration-200 ease-out active:scale-95 cursor-pointer`.
   - Tombol utama: Gradient halus + `hover:brightness-110` + soft shadow glow.
