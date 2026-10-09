# SILSILAH - Aplikasi Pohon & Silsilah Keluarga Interaktif

Aplikasi web modern berbasis **Next.js 16**, **TypeScript**, **React Flow (`@xyflow/react`)**, dan **PostgreSQL** untuk mendokumentasikan, menavigasi, dan mengelola silsilah keluarga interaktif dengan standar keamanan tinggi dan estetika premium.

---

## 🔒 Keamanan & Perlindungan Data (Zero-Leak Architecture)

Semua kredensial sensitif dikonfigurasi melalui file lingkungan (`.env.local`) dan **tidak pernah dibeberkan ke dalam kode publik**:
- **Database PostgreSQL**: Host, Port, User, Password, dan Nama Database ditentukan bebas oleh masing-masing pengguna di file `.env.local`.
- **Superadmin Fleksibel & Terenkripsi**: Username dan password Superadmin bebas ditentukan sendiri saat inisialisasi awal dan otomatis dienkripsi dengan standar **bcrypt**.
- **Portal Masuk Penuh (*Full-Screen Login*)**: Saat pertama kali dibuka atau belum terautentikasi, aplikasi langsung menampilkan layar login terlindungi tanpa membocorkan data silsilah ke publik.
- **Pendaftaran Mandiri dengan Role Client**: Pengguna baru yang mendaftar mandiri otomatis mendapatkan peran **Client (Mode Baca)** demi menjaga integritas data keluarga. Hanya Superadmin yang berwenang menaikkan peran ke Admin atau mengelola anggota.

---

## 🛠️ Panduan Instalasi & Persiapan (Step-by-Step)

### Langkah 1: Persiapan Database PostgreSQL

Pastikan service PostgreSQL sudah terpasang dan berjalan di laptop/komputer Anda:

#### A. Memeriksa Service PostgreSQL:
- **Windows**:
  1. Buka menu **Services** (tekan `Win + R`, ketik `services.msc`, lalu tekan Enter).
  2. Cari service bernama `postgresql-x64-XX` (misal: `postgresql-x64-16` atau `postgresql-x64-18`).
  3. Pastikan statusnya **Running** (Berjalan). Jika belum, klik kanan lalu pilih **Start**.
- **Linux (Ubuntu/Debian)**:
  ```bash
  sudo systemctl status postgresql
  # Jika belum aktif:
  sudo systemctl start postgresql
  ```
- **macOS (via Homebrew)**:
  ```bash
  brew services list
  # Jika belum aktif:
  brew services start postgresql@16
  ```

> 💡 **Catatan Penting**: Anda **tidak perlu repot membuat database atau tabel secara manual** di pgAdmin/DBeaver. Script inisialisasi otomatis kami (`npm run db:init`) yang akan membuatkan database dan seluruh tabelnya untuk Anda!

---

### Langkah 2: Konfigurasi File Lingkungan (`.env.local`)

1. Salin template konfigurasi dari file `.env.example`:
   - Di Windows PowerShell:
     ```powershell
     Copy-Item .env.example .env.local
     ```
   - Di Linux/macOS:
     ```bash
     cp .env.example .env.local
     ```

2. Buka file `.env.local` dengan text editor Anda dan sesuaikan kredensial PostgreSQL komputer Anda:

```env
# ========================================================
# KONEKSI DATABASE POSTGRESQL ANDA
# ========================================================
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=password_postgresql_komputer_anda
PGDATABASE=silsilah_db

# ========================================================
# AKUN SUPERADMIN PERTAMA (Bebas Ditentukan Sendiri)
# ========================================================
SUPERADMIN_USERNAME=admin
SUPERADMIN_PASSWORD=admin12345
SUPERADMIN_DISPLAY_NAME=Superadmin SILSILAH

# ========================================================
# RAHASIA AUTENTIKASI (String acak bebas)
# ========================================================
AUTH_SECRET=rahasia_acak_keamanan_silsilah_2026
```

---

### Langkah 3: Menjalankan Perintah NPM

Buka terminal pada folder proyek, lalu jalankan perintah berikut secara berurutan:

#### 1. Instal Dependensi Proyek
```bash
npm install
```

#### 2. Inisialisasi Database Otomatis (1-Klik)
```bash
npm run db:init
```
Perintah ini akan secara otomatis:
- Memeriksa koneksi ke PostgreSQL.
- Membuat database (`silsilah_db`) jika belum ada.
- Membuat semua tabel relasi keluarga secara lengkap.
- Mendaftarkan akun Superadmin pertama Anda dengan enkripsi sandi **bcrypt**.

#### 3. Jalankan Server Pengembangan (Dev)
```bash
npm run dev
```
Buka browser Anda di: [http://localhost:3000](http://localhost:3000)

#### 4. (Opsional) Membangun Versi Produksi (*Build*)
Jika ingin menguji kecepatan dan build produksi:
```bash
npm run build
npm start
```

---

## 🎨 Panduan Kustomisasi Logo & Background

Aplikasi menyediakan aset visual berbasis vektor di direktori publik yang dapat Anda ganti dengan logo atau foto keluarga Anda sendiri:

### 1. Mengganti Logo Aplikasi
- **Lokasi File**: `public/assets/logo.svg`
- **Cara Mengubah**:
  1. Siapkan file logo keluarga atau lambang trah Anda (format `.svg`, `.png`, atau `.webp`).
  2. Simpan atau timpa file tersebut ke:
     ```text
     public/assets/logo.svg
     ```
  3. Logo otomatis langsung diperbarui pada halaman login, bilah navigasi (Navbar), dan favicon aplikasi.

### 2. Mengganti Gambar Background
- **Lokasi File**: `public/assets/background.svg`
- **Cara Mengubah**:
  1. Siapkan ilustrasi atau foto latar belakang keluarga Anda.
  2. Simpan atau timpa file tersebut ke:
     ```text
     public/assets/background.svg
     ```
  3. Latar belakang pada portal login dan kanvas pohon keluarga akan langsung mengadopsi visual baru Anda.

---

## 🌈 Kustomisasi Tema Komponen Secara Real-Time (RGB Sliders)

Aplikasi dilengkapi menu **"Tema RGB"** pada Navbar:
- Geser slider warna **Merah (R)**, **Hijau (G)**, dan **Biru (B)** secara bebas untuk menyesuaikan:
  - **Warna Primer / Tombol Utama**
  - **Latar Belakang Kanvas (*Canvas Background*)**
  - **Permukaan Kartu Anggota (*Card Surface*)**
  - **Aksen Emas / Sorotan Fokus (*Gold Accent*)**
- Pilihan **Preset Tema Instan**:
  - 🌿 *Emerald Heritage* (Default Hijau Elegan)
  - 👑 *Royal Gold & Obsidian* (Emas Ningrat)
  - 🌊 *Sapphire Blue & Deep Slate* (Biru Safir Modern)
  - 🍷 *Ruby Heritage* (Merah Marun Tradisional)
  - 🔮 *Amethyst Night* (Ungu Mewah)
- Pengaturan tema disimpan di penyimpanan lokal browser pengguna sehingga preferensi warna tidak hilang saat halaman dimuat ulang.

---

## 👥 Fitur Unggulan Silsilah

### 1. Panel Kartu Anggota & Drag and Drop Relasi Instan
- Buka panel kartu anggota di sisi kiri kanvas melalui tombol **"Panel Anggota"**.
- **Drag & Drop**: Tarik kartu nama anggota dari panel samping dan jatuhkan langsung ke atas kartu anggota lain di kanvas pohon.
- Sistem otomatis memunculkan menu popup pilihan hubungan:
  - 👨 **Jadikan Ayah**
  - 👩 **Jadikan Ibu**
  - 👶 **Jadikan Anak**
  - 💍 **Jadikan Pasangan (Suami/Istri)**
- Dilengkapi sistem validasi pencegahan siklus hubungan (*Cycle Prevention*) agar tidak ada relasi sirkular yang tidak logis.

### 2. Pengaturan Foto Profil & Presisi Lingkaran Avatar
- Mendukung **Upload File Foto Komputer** langsung atau melalui **URL Gambar Online**.
- Fitur penyesuaian bingkai lingkaran presisi:
  - **Slider Zoom (Skala Foto)**: 100% hingga 250% untuk memperbesar dan memfokuskan wajah tanpa ada celah kosong.
  - **Slider Posisi Horizontal (X)**: Geser foto ke kiri atau kanan.
  - **Slider Posisi Vertikal (Y)**: Geser foto ke atas atau bawah.
  - Foto dipastikan terpotong rapi dalam lingkaran sempurna (*circular clip*) di semua browser tanpa distorsi rasio.

### 3. Tautkan Akun Klien ke Anggota Silsilah
- Anggota keluarga yang mendaftar sebagai Client dapat ditautkan ke identitas dirinya di dalam silsilah melalui modal edit anggota.
- Lencana terverifikasi (*Linked Client*) akan otomatis tampil pada kartu anggota yang bersangkutan.

### 4. Edit Judul Ruang Keluarga Dinamis
- Superadmin dapat mengubah judul ruang silsilah kapan saja (misalnya menjadi nama trah atau keluarga besar Anda) melalui tombol **"Edit Judul"** di samping judul pada Navbar.

### 5. Pohon Interaktif & Direktori Generasi
- Pohon silsilah mendukung zoom, pan, minimap, dan tombol sembunyikan/tampilkan cabang (*collapse/expand branches*).
- Tombol **Direktori** di Navbar menyajikan silsilah dalam bentuk daftar generasi terstruktur yang mudah dicari dan diakses.

---

## 📁 Struktur Direktori Penting

```text
SILSILAH/
├── .env.example                  # Template konfigurasi lingkungan publik
├── .env.local                    # Konfigurasi privat database & superadmin (lokal)
├── public/
│   └── assets/
│       ├── logo.svg              # Logo vektor aplikasi (Bisa dikustomisasi)
│       └── background.svg        # Latar belakang grafis (Bisa dikustomisasi)
├── scripts/
│   └── initDatabase.mjs          # Script inisialisasi database otomatis (npm run db:init)
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/             # API login, register, ganti kata sandi
│   │   │   ├── data/             # API sinkronisasi data silsilah ke PostgreSQL
│   │   │   └── users/            # API pengelolaan hak akses & peran akun
│   │   ├── layout.tsx            # Layout utama aplikasi
│   │   └── page.tsx              # Portal login & dasbor utama pohon silsilah
│   ├── components/
│   │   ├── Navbar.tsx            # Header, pencarian, RGB tema, edit judul
│   │   ├── TreeCanvas.tsx        # Kanvas interaktif pohon silsilah (React Flow)
│   │   ├── PersonNode.tsx        # Kartu anggota dengan zoom foto & drop listener
│   │   ├── SidebarMembers.tsx    # Panel samping kartu anggota (draggable)
│   │   ├── QuickConnectModal.tsx # Menu cepat relasi hasil drag & drop
│   │   ├── MemberModal.tsx       # Formulir anggota, upload foto, zoom/offset slider
│   │   ├── ThemeCustomizerModal.tsx # Kustomisasi tema dengan slider warna RGB
│   │   ├── WorkspaceSettingsModal.tsx # Modal edit judul keluarga
│   │   └── AccountManagementModal.tsx # Manajemen akun pengguna & role (Superadmin)
│   └── lib/
│       ├── db/                   # Koneksi pg pool & query PostgreSQL
│       ├── store.tsx             # State manager terpusat & session auth
│       ├── treeLayout.ts         # Algoritma layout posisi pohon silsilah
│       └── familyLogic.ts        # Kalkulasi derajat kekerabatan dinamis
└── README.md                     # Dokumentasi panduan lengkap
```
