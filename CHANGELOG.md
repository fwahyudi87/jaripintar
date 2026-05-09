# Changelog

## 0.4.3 (2026-05-10)

- OnScreenKeyboard: tombol bisa diklik mouse/sentuhan tablet (onPointerDown)

## 0.4.2 (2026-05-10)

- Feedback banner pindah ke bawah ScoreBar, teks rata tengah

## 0.4.1 (2026-05-10)

- Halaman MenuScreen: 4 kartu modul (grid 2x2), modul terkunci tampil 🔒
- Feedback banner: "KAMU HEBAT <nama>!" (hijau) / "AYO <nama> KAMU BISA!" (merah)
- ScoreBar: tombol ← merah, avatar+nama di tengah
- Fix routing MenuScreen (key mapping SCREEN constant)
- Rocket: ukuran lebih besar (72x120), transisi lebih lambat (0.2)

## 0.4.0 (2026-05-10)

- Audio feedback via Howler.js: chime (↑ C5→E5) saat benar, boop (↓ 300→100Hz) saat salah
- WAV generator programatik (`src/utils/makeSound.js`) — tanpa file audio eksternal
- Terintegrasi di semua modul: LetterHunt, BalloonCatch, KiteCatch, RocketCatch

## 0.3.1 (2026-05-10)

- LetterHunt: tambah sesi angka 0-9 (8 huruf + 8 angka = 16 step)
- Fix "Mantap! Lanjut ke Balon!" muncul di awal (pakai state lokal)
- BalloonCatch: transisi balon dari atas ke bawah (balon jatuh)
- RocketCatch: fix transisi roket dari bawah ke atas
- KiteCatch: layangan lebih lambat (0.12) dan lebih besar (100×78)
- Phase transition "Bagus! Sekarang angka!" di LetterHunt

## 0.3.0 (2026-05-10)

- Modul 4: RocketCatch — roket terbang dari bawah ke atas (rAF)
- Isian campuran huruf A–Z + angka 0–9, 20 pts per catch
- Unlock M4 saat skor ≥400 dari M3, latar gelap malam
- Fix score bug: `useLetterSound` di-memoize + `gameOverRef` di handleKey
- Keyboard event listener tidak berganti setiap frame (fix input drop)
- `UPDATE_ALL` command di AGENTS.md

## 0.2.0 (2026-05-10)

- Suara huruf dengan Web Speech API (bahasa Indonesia)
- Modul 3: KiteCatch — layangan angka 0–9
- Score unlock: skor ≥200 buka Modul 3
- Number row di OnScreenKeyboard (`showNumbers` prop)
- Nama & gender di splash screen, tampil di score bar
- Balon digambar pakai SVG (warna random, ada kilau)
- Fix "Main Lagi!" timer restart pakai `gameKey`

## 0.1.0 (2026-05-09)

- Scaffold Vite + React
- Modul 1: LetterHunt (8 ronde huruf)
- Modul 2: BalloonCatch (rAF physics, 45 detik)
- OnScreenKeyboard (QWERTY, zona tangan, debounce)
- SplashScreen + ScoreBar + confetti
- Session persistence via `sessionStorage`
