---
name: impeccable
description: Standar keahlian desain frontend "out-of-distribution craft" berdasarkan Impeccable (by Paul Bakaus). Gunakan untuk audit, critique, polish, animate, colorize, typeset, layout, harden, dan menyempurnakan UI agar bebas dari AI slop dan layak rilis kelas dunia.
version: 4.2.0
user-invocable: true
argument-hint: "[polish · audit · critique · animate · colorize · typeset · layout · distill · harden · init] [target]"
license: Apache 2.0
---

# Impeccable Frontend Design Director

Pedoman dan tata kelola desain tingkat tinggi untuk mentransformasikan antarmuka dari sekadar *"AI-generated template / AI slop"* menjadi karya kerajinan antarmuka (*out-of-distribution craft*) dengan cita rasa desain kelas dunia.

---

## 🎯 23 Impeccable Commands

| Perintah | Deskripsi & Fokus Tindakan |
|---|---|
| `/impeccable polish` | Pass final sebelum rilis: merapikan alignment, micro-interactions, padding konsisten, dan tokens. |
| `/impeccable critique` | Evaluasi UX mendalam: kejelasan hierarki, cognitive load, visual balance, dan emosi pengguna. |
| `/impeccable audit` | Pengecekan teknis kualitas: aksesibilitas (kontras ≥4.5:1), responsivitas, dan semantic HTML. |
| `/impeccable typeset` | Koreksi hierarki tipografi, ukuran font bertingkat, line-height, letter-spacing, dan tabular nums. |
| `/impeccable layout` | Perbaiki ritme visual, whitespace, grouping rapat vs separasi lapang. |
| `/impeccable colorize` | Warna strategis berkarakter, palet HSL harmonis, dark tinting (bukan hitam mati). |
| `/impeccable animate` | Animasi terarah, exponential ease-out halus, hindari bounce/elastic norak. |
| `/impeccable distill` | Pangkas elemen dekoratif berlebihan hingga esensi terpenting tetap bersinar. |
| `/impeccable harden` | Penanganan edge cases: text overflow, empty states, loading skeleton, error recovery. |
| `/impeccable bolder` | Perkuat karakter desain yang terlalu datar/membosankan dengan kontras dan aksen tegas. |
| `/impeccable quieter` | Redam desain yang terlalu berisik atau berlebihan efek visualnya. |
| `/impeccable delight` | Sentuhan visual menyenangkan (micro-interactions, tooltip informatif, badge elegan). |

---

## 📐 Standar Kualitas Wajib (Craft Floor Rules)

Setiap komponen dan halaman wajib mematuhi aturan baku berikut:

1. **Contrast & Tinting:**
   - Kontras teks body terhadap latar belakang minimal **4.5:1** (WCAG AA). Teks besar/judul minimal **3:1**.
   - **DILARANG** menggunakan hitam murni `#000000` atau abu-abu mati `#888888`. Selalu gunakan warna gelap bertint (misal: *Dark Navy Obsidian* `#07090e`, *Card Obsidian* `#0a0f1d`, *Border Tint* `#1e293b`).
   - Teks sekunder pada latar belakang berwarna harus mengambil tint dari warna tersebut, bukan abu-abu pudar kusam.
2. **Depth & Elevation:**
   - Bayangan (*shadow*) harus memiliki offset vertikal nyata dan blur lembut (misal: `0 10px 30px -10px rgba(...)`).
   - Hindari halo glow 0-offset tanpa arah yang tampak melayang artifisial.
3. **Spacing & Grouping (Law of Proximity):**
   - Elemen yang saling terkait harus dikelompokkan rapat (*tight groups*).
   - Pemisah antar kelompok/seksi harus lapang dan lega (*generous separation*).
   - Ruang vertikal di atas sebuah judul/heading harus selalu lebih besar daripada ruang di bawahnya.
4. **Typography & Tabular Numerals:**
   - Panjang teks paragraf (*measure*) dijaga 60–75 karakter per baris agar mudah dibaca.
   - Angka finansial, rasio, persentase, dan harga saham wajib menggunakan font varian `font-mono` atau `tabular-nums` agar tidak bergeser saat nilai berubah.
5. **Browser Surfaces Theming:**
   - Seleksi teks (`::selection`), scrollbar kustom, caret kursor, dan ring fokus (`focus-visible`) wajib disesuaikan dengan palet warna brand (Emerald & Cyan glow), bukan default biru bawaan browser.
6. **Purposeful Motion:**
   - Durasi transisi ideal 150ms – 250ms dengan kurva `cubic-bezier(0.16, 1, 0.3, 1)` (smooth ease-out).
   - Hindari animasi pegas/bounce berlebihan yang terasa kuno.

---

## 🚫 Daftar Anti-Pola yang Dilarang (The Refuse List)

- ❌ **Nested Cards:** Dilarang membungkus kartu di dalam kartu secara bertingkat-tingkat tanpa hierarki jelas.
- ❌ **Generic AI SaaS Gradient:** Dilarang memakai gradien ungu-biru generik. Di AlphaSector, gunakan warna pasar modal terkurasi: *Deep Obsidian*, *Emerald Pulse* (keuntungan/kesehatan), *Cyan Surge* (intelijen kuantitatif), dan *Amber Glow* (aliran dana bandar).
- ❌ **Icon-in-Square Habit:** Dilarang meletakkan ubin ikon kotak tumpul di atas setiap judul teks tanpa fungsi struktural.
- ❌ **Gray Text on Colored/Dark Backgrounds:** Teks sekunder harus berupa slate bertint (`text-slate-300`, `text-slate-400`), bukan abu-abu pucat tak terbaca.
- ❌ **Static Clickables:** Setiap elemen yang dapat diklik wajib memiliki status hover visual, `cursor-pointer`, active scale feedback, dan state keyboard accessibility.
