# JariPintar 🖐️

Aplikasi web interaktif belajar mengetik untuk anak usia 5–7 tahun. 100% client-side, tanpa backend.

## Fitur

- **On-Screen Keyboard** — replika keyboard QWERTY dengan zona warna tangan (biru/kuning), highlight F & J
- **Modul 1: LetterHunt** — tebak huruf yang muncul, 8 ronde → unlock Modul 2
- **Modul 2: BalloonCatch** — balon naik, ketik huruf sebelum balon hilang, 45 detik
- **Modul 3: KiteCatch** — layangan angka 0–9, melayang ke samping, unlock saat skor ≥200
- **Suara huruf** — Web Speech API, suara Indonesia
- **Fullscreen** — tombol layar penuh di splash screen
- **Progres sesi** — nama, gender, skor, unlock modul tersimpan di `sessionStorage`

## Cara pakai

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # output di dist/
npm run preview  # preview production build
```

## Tech

React 18 · Vite 6 · Howler.js (terdaftar, belum dipakai) · Google Fonts

## Lisensi

Hak cipta © 2026. See `LICENSE` for details.
