Aplikasi Belajar Mengetik Untuk Anak TK.

Berikut adalah rancangan Product Requirements Document (PRD) dasar untuk aplikasi web belajar mengetik anak TK. Dokumen ini disusun dengan pendekatan arsitektur *client-side* murni, sesuai dengan batasan *stateless/session-based* yang ditetapkan.

---

# Product Requirements Document (PRD)

**Nama Produk:** JariPintar
**Platform:** Aplikasi Web Terdistribusi (Browser-based)
**Status:** Draf Awal

## 1. Ringkasan Eksekutif

JariPintar adalah aplikasi web interaktif yang dirancang untuk mengenalkan huruf, angka, dan dasar mengetik kepada anak usia 5-7 tahun. Aplikasi ini berjalan sepenuhnya di *browser* klien (Client-Side Rendering) tanpa memerlukan *backend* atau integrasi API eksternal. Semua progres, skor, dan status permainan dikelola secara sementara di dalam *session* web dan akan direset saat *browser* ditutup.

## 2. Target Pengguna (User Persona)

* **Pengguna Utama:** Anak usia 5-7 tahun.
* *Karakteristik:* Baru belajar membaca/mengenal huruf, motorik halus masih berkembang, rentang perhatian pendek, sangat termotivasi oleh warna dan suara.


* **Pengguna Sekunder:** Orang tua atau pendamping.
* *Karakteristik:* Membutuhkan aplikasi yang aman, tanpa iklan, ringan, dan langsung bisa digunakan tanpa proses *login* atau registrasi.



## 3. Ruang Lingkup dan Fitur Utama (Scope & Features)

**3.1. Keyboard Virtual Interaktif (On-Screen Keyboard)**

* Menampilkan replika *keyboard* di layar yang sinkron dengan *keyboard* fisik.
* Tombol di layar akan menyala atau membesar (*scale-up animation*) ketika tombol fisik ditekan.
* Pemisahan warna zona tangan: Setengah *keyboard* kiri berwarna dasar biru muda, setengah kanan kuning pastel. Tombol jangkar (F dan J) diberi *highlight* khusus.

**3.2. Modul Pembelajaran (Berbasis Sesi)**

* **Modul 1: Pencarian Huruf Tunggal.** Huruf besar beranimasi muncul di tengah layar. Anak harus menekan tombol yang sesuai.
* **Modul 2: Tangkap Balon (Game Utama).** Balon berisi huruf melayang dari bawah ke atas layar. Anak harus mengetik huruf tersebut sebelum balon menyentuh "langit-langit".
* Progres antar modul dikunci (*locked*) dan terbuka secara sekuensial berdasarkan keberhasilan di modul sebelumnya dalam sesi tersebut.

**3.3. Sistem *Reward* dan Umpan Balik Instan**

* **Benar:** Suara *chime* ceria, partikel *confetti* meledak di layar, poin bertambah.
* **Salah:** Suara *boop* lembut (bukan *buzzer* keras), huruf yang salah di layar akan bergoyang (*shake animation*), tidak ada pengurangan poin.

## 4. Spesifikasi UI/UX (Antarmuka dan Pengalaman Pengguna)

Desain harus meminimalkan kebingungan kognitif dan memaksimalkan *affordance* visual.

* **Tipografi (Font):** Menggunakan *font* tebal, membulat (*rounded*), dan sangat mudah dibaca. Rekomendasi: **Fredoka One**, **Balsamiq Sans**, atau **Quicksand** untuk teks instruksi, dan **Comic Neue** untuk huruf target.
* **Palet Warna:** Warna pastel dengan kontras tinggi untuk membedakan elemen yang bisa diinteraksi.
* *Background:* Putih gading atau biru langit sangat muda.
* *Aksen Target:* Oranye terang atau hijau limau.


* **Tata Letak (Layout):**
* *Fullscreen mode* (disarankan via tombol di awal sesi).
* **Atas:** Bar skor dan level (ikon bintang).
* **Tengah:** Area interaksi/Game (huruf yang muncul).
* **Bawah:** *Virtual keyboard* besar.


* **Perlindungan Input:** Anak sering memencet banyak tombol bersamaan (*keyboard mashing*). UI harus memiliki *debounce* atau mencegah layar menjadi *freeze* akibat *input* berlebih.

## 5. Spesifikasi Teknis (Frontend Architecture)

Mengingat tidak ada *backend*, arsitektur difokuskan pada manajemen *state* lokal dan performa *rendering*.

* **Pendekatan:** Single Page Application (SPA).
* **Manajemen State:** Menggunakan `sessionStorage` API bawaan *browser* atau sistem *State Management* (seperti React Context / Vuex / Pinia) yang diinisialisasi ulang pada setiap muat ulang halaman.
* **Aset Media:**
* Semua gambar menggunakan format SVG untuk skalabilitas tanpa pecah dan ukuran *file* sangat kecil.
* Audio di-*preload* menggunakan Web Audio API (atau *library* ringan seperti Howler.js) untuk memastikan tidak ada *delay* saat tombol ditekan.


* **Logika *Game Loop*:**
* Untuk permainan "Tangkap Balon", direkomendasikan menggunakan `requestAnimationFrame` untuk mengatur fisika pergerakan secara mulus di 60 FPS, tanpa membebani CPU.



## 6. Skenario Alur Pengguna (User Flow)

1. **Akses Aplikasi:** URL dibuka. Layar memuat instan (karena *static files*).
2. **Layar Awal (Splash Screen):** Judul aplikasi dengan tombol besar bertuliskan "MULAI MAIN!". Terdapat tombol kecil untuk mengaktifkan layar penuh (*fullscreen*).
3. **Layar Bermain:** Anak diarahkan langsung ke Modul 1. Sistem menginstruksikan (via teks besar) "Tekan huruf A!".
4. **Looping Interaksi:** Anak menekan *keyboard*. Sistem memvalidasi -> Menampilkan animasi/audio -> Menampilkan huruf berikutnya.
5. **Akhir Sesi:** Jika anak menutup *tab browser* atau menekan tombol *refresh*, semua skor bintang kembali menjadi nol. Tidak ada data pribadi yang disimpan atau dikirim.