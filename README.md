# 🌿 Game Leef — The Spotify-Inspired Indie HTML Game Gateway

> *"Streaming Game Indie: Lebih Segar dari Daun, Lebih Ringan dari Beban Hidup."*  
> **Created & Curated by Lee Khan • Powered by Next-Gen AI Engines**

Game Leef adalah platform gateway dan hub game HTML5 berbasis web dengan estetika, topologi, dan UX bertema **Spotify Dark Mode** (merujuk pada [`DESIGN.md`](./DESIGN.md)). Mengusung filosofi humoris, *anti-burnout*, ramah spek kentang, dan fondasi database **Supabase** untuk Leaderboard & Player Profile.

---

## ✨ Fitur Utama

1. **🎵 Spotify Dark UI Topology**:
   - Palette warna otentik Spotify (`#121212`, `#181818`, `#1f1f1f`, `#1ed760`).
   - Tombol full pill (`rounded-full`), tombol play melingkar 50%, dan input search pill dengan inset border.
   - Layout Spotify: **Left Sidebar Nav**, **Top Search & Category Bar**, **Curated Game Grid**, dan **Persistent "Now Playing" Bottom Bar**.

2. **🤖 Kreditisasi Model AI & Creator**:
   - Creator: **Lee Khan**
   - AI Engine: Mencantumkan engine AI yang digunakan pada setiap game (seperti `Claude 3.7 Sonnet`, `Gemini 2.5 Flash`, `DeepSeek-V3`, `GPT-4o`).

3. **🏆 Fondasi Leaderboard Global & Supabase**:
   - **Game Leef Bridge SDK**: Game HTML di dalam iframe dapat mengirimkan skor secara otomatis via `window.postMessage`.
   - **Supabase Integration**: Data skor otomatis terhubung ke Supabase jika environment variable diisi, atau tetap bekerja offline dengan sistem Guest Player.
   - **SQL Schema Siap Pakai**: Tersedia file [`supabase_schema.sql`](./supabase_schema.sql) untuk setup database instan.

4. **🎮 Game Theater & Sandbox Iframe**:
   - Menjalankan game HTML5 apapun secara aman di dalam sandbox iframe.
   - Fitur **True Fullscreen**, **Reload Game Frame**, **Session Play Timer**, dan **Panduan Tombol Kontrol**.
   - Halaman detail game khusus per ID (`/game/[id]`) untuk berbagi link secara langsung.

5. **👑 Credits & Easter Egg Lee Khan**:
   - Profil kurator resmi Lee Khan di topbar dan sidebar (*Chief Leef Officer*).
   - Interactive modal *"Sertifikat Resmi Pemain Santuy"* dengan animasi selebrasi confetti dan retro sound effects (Web Audio API).

---

## 🕹️ Game Built-in yang Tersedia

1. **🌿 Leef Jumper (Official Mascot Game)**: Lompat dari daun ke daun, kumpulkan kopi, auto-submit skor saat game over.
2. **🥔 Potato Clicker 3000**: Idle game kapitalisme kentang, upgrade prosesor Celeron sampai RTX Kentang.
3. **🕹️ Retro Neon Brick Breaker**: Game breakout arcade neon synthwave dengan efek partikel.
4. **🚗 Hit & Cash**: Traffic trading hub simulation.
5. **🌪️ Tornado-Holic**: Hyper-casual storm chaser & destruction simulator.

---

## 🔌 Cara Menghubungkan Supabase (Opsional)

1. Buat project baru di [Supabase Dashboard](https://app.supabase.com).
2. Buka **SQL Editor** di Supabase, lalu jalankan seluruh isi file [`supabase_schema.sql`](./supabase_schema.sql).
3. Buat file `.env.local` di folder `GameLeef/`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key-here
   ```
4. Selesai! Skor dan leaderboard sekarang tersimpan di cloud database Supabase secara realtime.

---

## 🚀 Panduan Menambahkan Game HTML Baru

Sangat mudah untuk menambahkan game HTML5 buatan Anda sendiri:

1. Buat folder baru di dalam `GameLeef/public/games/<nama-game>/`
2. Letakkan file `index.html` dan asset game Anda (gambar, sound, script) ke dalam folder tersebut.
3. Kirimkan skor saat Game Over di script game Anda:
   ```javascript
   if (window.parent && window.parent !== window) {
     window.parent.postMessage({
       type: 'GAMELEEF_SUBMIT_SCORE',
       gameId: 'nama-game',
       score: skorPemain
     }, '*');
   }
   ```
4. Buka file `src/data/games.ts` dan tambahkan data game Anda ke array `GAMES_CATALOG`.

---

## 💻 Cara Menjalankan Secara Lokal

```bash
# 1. Masuk ke folder GameLeef
cd GameLeef

# 2. Jalankan development server
npm run dev

# 3. Buka di browser
# http://localhost:3000
```

---

## ☁️ Cara Deploy ke Vercel (1-Klik)

1. Push repository ini ke GitHub.
2. Buka dashboard [Vercel](https://vercel.com).
3. Import project ini, lalu pilih **Root Directory**: `GameLeef`.
4. Jika menggunakan Supabase, tambahkan `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` di menu **Environment Variables**.
5. Klik **Deploy**!
