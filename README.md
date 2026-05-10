# JariPintar 🖐️

Aplikasi web interaktif belajar mengetik untuk anak usia 5–7 tahun. 100% client-side SPA, tanpa backend.

## Fitur

- **6 Modul Permainan** — Berburu Huruf & Angka, Tangkap Balon, Tangkap Layangan, Tangkap Roket, Nama Saya, Lompat T-Rex
- **On-Screen Keyboard** — replika QWERTY 3 baris + baris angka, zona warna tangan (biru/kuning), klik mouse/sentuhan tablet
- **3 Level Kesulitan** — 🌱 Mudah, 🌿 Medium, 🌵 Sulit — mempengaruhi kecepatan musuh
- **Audio Feedback** — suara benar (chime ↑) / salah (boop ↓) via Howler.js
- **Suara Huruf** — Web Speech API, suara Indonesia (id-ID)
- **Animasi Fisika** — rAF untuk balon jatuh, layangan melayang, roket naik
- **PWA** — bisa diinstal ke layar depan, work offline (app shell cache)
- **Progres Sesi** — nama, gender, skor, modul tersimpan di `sessionStorage`
- **Fullscreen** — tombol layar penuh di halaman awal

## Modul

| # | Modul | Target | Poin |
|---|-------|--------|------|
| 1 | Berburu Huruf & Angka | A–Z + 0–9 (16 ronde) | — |
| 2 | Tangkap Balon | A–Z (45 detik) | 10 |
| 3 | Tangkap Layangan | 0–9 (45 detik) | 15 |
| 4 | Tangkap Roket | A–Z + 0–9 (45 detik) | 20 |
| 5 | Nama Saya | ketik potongan namamu | 15 |
| 6 | Lompat T-Rex | A–Z + 0–9 (45 detik) | variabel |

## Cara pakai

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # output di dist/
npm run preview  # preview production build
```

## Tech

React 18 · Vite 6 · Howler.js · Google Fonts (Fredoka, Quicksand, Comic Neue) · Web Speech API

## Lisensi

Hak cipta © 2026. See `LICENSE` for details.
