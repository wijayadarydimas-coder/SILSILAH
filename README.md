# SILSILAH - Aplikasi Pohon & Silsilah Keluarga Interaktif

Aplikasi web modern berbasis **Next.js 16**, **TypeScript**, **React Flow (`@xyflow/react`)**, dan **PostgreSQL** untuk mendokumentasikan, menavigasi, dan mengelola silsilah keluarga.

---

## 🚀 Panduan Memulai Cepat (Quick Start)

Aplikasi SILSILAH dirancang untuk dapat dijalankan langsung di lingkungan komputer lokal maupun dideploy ke layanan cloud hosting (seperti Vercel, Supabase, Neon, Railway, Render, atau VPS).

---

### OPSI A: Menjalankan di Komputer Lokal (Localhost)

#### 1. Persiapan Service PostgreSQL

Pastikan service PostgreSQL berjalan di komputer Anda:

- **Windows**: Tekan `Win + R`, ketik `services.msc`, pastikan service `postgresql-x64-XX` berstatus **Running**.
- **Linux (Ubuntu/Debian)**: `sudo systemctl status postgresql` (jalankan `sudo systemctl start postgresql` jika belum aktif).
- **macOS**: `brew services start postgresql@16`

#### 2. Konfigurasi Environment (`.env.local`)

Salin file template `.env.example` menjadi `.env.local`:

```bash
# Windows PowerShell:
Copy-Item .env.example .env.local

# Linux / macOS:
cp .env.example .env.local
```

Buka `.env.local` dan sesuaikan kredensial PostgreSQL lokal Anda:

```env
# Koneksi Localhost:
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=password_postgresql_anda
PGDATABASE=silsilah_db
PGSSL=false

# Akun Superadmin Awal:
SUPERADMIN_USERNAME=silsilah
SUPERADMIN_PASSWORD=silsilah123
SUPERADMIN_DISPLAY_NAME=Superadmin SILSILAH

# String Rahasia Sesi:
AUTH_SECRET=rahasia_acak_keamanan_silsilah_2026_bebas_diubah
```

#### 3. Instalasi Dependensi & Inisialisasi Database

Jalankan perintah berikut di terminal:

```bash
# 1. Pasang dependensi
npm install

# 2. Inisialisasi database otomatis (membuat tabel & akun superadmin)
npm run db:init

# 3. Jalankan server pengembangan
npm run dev
```

Buka browser di:

- Akses lokal: [http://localhost:3000](http://localhost:3000)
- Akses jaringan lokal (LAN / WiFi dari HP atau laptop lain): `http://<IP_KOMPUTER_ANDA>:3000` (misal: `http://192.168.1.15:3000`)

---

### OPSI B: Deploy ke Cloud Hosting (Vercel, Railway, Render, VPS)

Aplikasi telah mendukung string koneksi `DATABASE_URL` dengan SSL aktif secara otomatis.

#### 1. Siapkan Database Cloud (PostgreSQL)

Anda dapat menggunakan penyedia database PostgreSQL cloud gratis seperti:

- **Supabase** ([supabase.com](https://supabase.com))
- **Neon Database** ([neon.tech](https://neon.tech))
- **Railway** ([railway.app](https://railway.app))

Dapatkan string koneksi database, misalnya:
`postgres://user:password@ep-sample-123.us-east-1.neon.tech/silsilah_db?sslmode=require`

#### 2. Set Environment Variables di Dashboard Hosting

Tambahkan variabel berikut pada pengaturan Environment Variables proyek Anda di Vercel / Railway / Render:

| Variabel                  | Nilai Contoh                                   | Keterangan                              |
| :------------------------ | :--------------------------------------------- | :-------------------------------------- |
| `DATABASE_URL`            | `postgres://user:pass@host/db?sslmode=require` | URL koneksi lengkap database cloud      |
| `DATABASE_SSL`            | `true`                                         | Mengaktifkan koneksi SSL aman           |
| `SUPERADMIN_USERNAME`     | `silsilah`                                     | Username untuk login superadmin pertama |
| `SUPERADMIN_PASSWORD`     | `silsilah123`                                  | Password superadmin pertama             |
| `SUPERADMIN_DISPLAY_NAME` | `Superadmin SILSILAH`                          | Nama tampilan akun superadmin           |
| `AUTH_SECRET`             | `string_acak_panjang_minimal_32_karakter`      | Kunci enkripsi sesi                     |

#### 3. Inisialisasi Database Cloud

Sebelum atau sesudah deploy, jalankan script inisialisasi tabel sekali:

```bash
# Jalankan secara lokal dengan DATABASE_URL terisi di .env.local:
npm run db:init
```

Script ini akan langsung membuat semua tabel yang dibutuhkan dan akun superadmin di cloud database Anda.

#### 4. Build dan Jalankan

- **Vercel**: Deploy otomatis via GitHub branch `main`.
- **Docker / VPS**:
  ```bash
  npm run build
  npm start
  ```

---

## 🔒 Fitur Keamanan Sistem

1. **Proteksi Anti SQL-Injection**:
   - Semua operasi database menggunakan query berparameter (_parameterized queries_) melalui library `pg` dengan placeholder `$1, $2, ...`.
   - Tidak ada penggabungan string langsung (_string concatenation_) pada query SQL.

2. **Pembatasan Upload File & Proteksi DoS**:
   - Pembatasan ukuran upload foto maksimal 3MB per file.
   - Validasi ketat tipe MIME (hanya format gambar `image/jpeg`, `image/png`, `image/webp`).
   - Pemeriksaan ukuran payload di sisi backend API (`4.5MB base64 limit`).

3. **Pencegahan Kebocoran Data (Zero-Leak Data Protection & AI Guardrail)**:
   - Hash password (`password_hash`) dan token internal disaring secara ketat dan **tidak pernah dikirimkan ke frontend** maupun ke penyedia AI pihak ketiga.
   - Konteks data yang dibaca oleh Asisten AI hanya berisi informasi kekeluargaan publik (nama, hubungan orang tua-anak, perkawinan, bio, domisili). Kredensial sistem dan akun terlindungi 100%.
   - Portal login penuh (_Full-Screen Login Gate_) mencegah pihak yang belum login melihat data silsilah.

4. **Kontrol Akses Berbasis Peran (RBAC)**:
   - **Superadmin**: Akses penuh ke seluruh fitur, penghapusan akun Admin & User, hapus/bersihkan log audit, kelola pemulihan password, edit judul silsilah.
   - **Admin**: Menambah, mengubah, dan menghapus anggota serta relasi keluarga, meninjau permohonan reset password.
   - **User**: Mode baca (_Read-only_) dan akses ke asisten tanya-jawab silsilah.

---

## 🤖 Integrasi Asisten Chatbot AI Silsilah

Aplikasi dilengkapi tombol mengambang interaktif **`✨ Tanya AI Silsilah`** di pojok kanan bawah. Pengguna dapat menanyakan silsilah keluarga dalam bahasa alami (misalnya: *"Siapa kakek dari Budi?"*, *"Berapa jumlah total keturunan saat ini?"*, *"Siapa saja yang berdomisili di Yogyakarta?"*).

### Fitur Tampilan AI:
- **Nama Asisten Kustom**: Nama asisten dapat diubah bebas di file `.env.local` melalui variabel `AI_NAME` (contoh: `AI_NAME=Mbah Sastro` atau `AI_NAME=Asisten Silsilah`).
- **Format Teks Markdown Rapi**: Teks cetak tebal (`**bold**`), miring, dan daftar poin otomatis diformat indah tanpa menampilkan tanda bintang mentah.
- **Tampilan Bersih & Rahasia**: Informasi penyedia model (Gemini/OpenAI/Lokal) dirahasiakan sepenuhnya dari antarmuka obrolan demi estetika bersih dan profesional.

### Konfigurasi Penyedia Model AI:

#### 1. Menggunakan Google Gemini (Rekomendasi & Gratis)
Google menyediakan akses API Gemini secara gratis dengan kuota melimpah:
1. Buka [Google AI Studio](https://aistudio.google.com).
2. Masuk menggunakan akun Google Anda dan klik **Get API Key** -> **Create API Key**.
3. Buka file `.env.local` pada proyek Anda, lalu masukkan:
   ```env
   AI_NAME=Asisten Silsilah
   GEMINI_API_KEY=AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxx
   GEMINI_MODEL=gemini-3.5-flash-lite
   ```
4. Restart server pengembangan (`npm run dev`). Chatbot akan otomatis ditenagai oleh Google Gemini!

#### 2. Menggunakan OpenAI (ChatGPT)
Jika Anda lebih menyukai OpenAI:
1. Kunjungi [OpenAI Platform](https://platform.openai.com/api-keys).
2. Buat API key baru (`sk-proj-...`).
3. Tambahkan ke file `.env.local`:
   ```env
   AI_NAME=Asisten Silsilah
   OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxx
   OPENAI_MODEL=gpt-4o-mini
   ```

#### 3. Mesin AI Lokal Cerdas Bawaan (Tanpa API Key)
Jika `GEMINI_API_KEY` dan `OPENAI_API_KEY` dikosongkan, sistem tetap aktif dan otomatis menggunakan **Built-in Safe Engine** yang membaca database relasi secara lokal tanpa memerlukan koneksi internet ke penyedia AI luar.

---

## 💬 Obrolan Komunitas Keluarga (Community Chat)

Terdapat fitur ruang obrolan komunitas internal keluarga (**`[💬 Chat Komunitas]`**) di bagian atas navbar:
- **Semua Dalam Satu Lingkup**: Semua anggota keluarga dapat saling berdiskusi, menyapa, dan membagikan informasi.
- **Hak Tarik & Hapus Pesan Berjenjang (Hierarchical RBAC)**:
  - **User Biasa**: Dapat menarik / menghapus pesan yang dikirimnya sendiri (*Unsend*).
  - **Admin**: Dapat menghapus pesan sendiri dan pesan milik anggota biasa (*User*).
  - **Superadmin**: Memiliki wewenang tertinggi untuk menghapus pesan dari siapa pun (pesan User, Admin, maupun Superadmin).

---

## 👤 Foto Profil & Pengaturan Akun Pengguna

Setiap pengguna (Superadmin, Admin, maupun User) dapat memasang dan mengganti foto profil masing-masing:
- Klik menu profil di kanan atas -> pilih **`👤 Edit Profil & Foto Akun`**.
- Pengguna dapat mengunggah foto profil dari komputer/HP (maksimal 3MB).
- Foto profil akan langsung tampil di navbar, kartu pesan komunitas, dan kartu anggota silsilah terkait.

---

## 🔑 Sistem Registrasi, Lupa Password & Pengiriman Email Asli

1. **Wajib Nomor WhatsApp atau Email**:
   - Saat mendaftar akun baru, pengguna diwajibkan menyertakan nomor WhatsApp atau email aktif (atau keduanya).
2. **Pengiriman Email Nyata (SMTP)**:
   - Jika pengguna lupa password dan memasukkan email, sistem mengirimkan **Token Verifikasi 6 Digit** asli langsung ke inbox email pengguna via protokol SMTP.
   - Konfigurasi email admin di `.env.local`:
     ```env
     SMTP_HOST=smtp.gmail.com
     SMTP_PORT=587
     SMTP_SECURE=false
     SMTP_USER=email_admin_anda@gmail.com
     SMTP_PASS=app_password_gmail_16_karakter
     SMTP_FROM="SILSILAH Keluarga <email_admin_anda@gmail.com>"
     ```
     > **Tips Gmail**: Aktifkan 2-Step Verification pada akun Google Admin, lalu buka menu *Security* -> *App Passwords* untuk membuat 16 karakter kata sandi aplikasi.
   - Jika kredensial SMTP belum diisi pengembang di `.env.local`, sistem akan menampilkan token di layar untuk kemudahan pengujian lokal.
3. **Pemulihan via WhatsApp & Rekap PDF untuk Admin**:
   - Permintaan pemulihan dengan nomor WhatsApp otomatis dicatat ke database (`password_reset_requests`).
   - Admin dan Superadmin memiliki menu navigasi **`[🔑 Lupa Password]`** untuk melihat seluruh daftar antrean dan mencetak lembar rekap format **PDF**.

---

## 🧩 Fitur Utama Aplikasi

- **Formulir Anggota & Rekomendasi Domisili Hierarkis**:
  - Kolom domisili dilengkapi autocomplete dropdown bertingkat: mengetik nama desa/kelurahan akan merekomendasikan blok pilihan lengkap beserta Kecamatan, Kabupaten/Kota, dan Provinsi (mirip pencarian Google Maps).
  - Date picker untuk pemilihan tanggal lahir dan wafat.
  - Perhitungan umur otomatis (menampilkan usia hidup atau usia saat wafat).
  - Tautan interaktif untuk WhatsApp, Instagram, dan Google Maps.

- **Panel Anggota dengan Tombol Unhide**:
  - Panel daftar anggota di sisi kiri dapat disembunyikan (_hide_).
  - Saat panel tersembunyi, terdapat tombol unhide yang tetap terlihat di tepi kiri layar dan tombol mengambang untuk membuka kembali panel dengan mudah.

- **Manajemen Akun Fleksibel (Superadmin & Admin)**:
  - Superadmin dapat menghapus akun Admin dan User kapan saja.
  - Saat Admin/Superadmin membuat akun pengguna baru, sesi login pengelola tidak akan tertimpa atau terkeluar secara tiba-tiba.
  - Superadmin dapat menghapus entri log audit satu per satu atau membersihkan seluruh riwayat audit.

- **Kustomisasi Tema Live (Frontend)**:
  - Pengguna dapat menyesuaikan warna background (layar utama kanvas), warna navbar (header atas), warna menu (panel samping), warna aksen tombol/garis, dan warna kartu secara real-time via color picker RGB.
  - Perubahan tema tersimpan otomatis di browser lokal.

---

## 🎨 Kustomisasi Aset (Logo & Background)

Aset logo dan visual latar belakang terletak di folder `public/assets/`:

- **Logo Aplikasi**: Ganti file `public/assets/logo.svg` dengan logo keluarga Anda (`.svg` atau `.png`).
- **Latar Belakang**: Ganti file `public/assets/background.svg` dengan visual latar belakang yang diinginkan.

---

## 📁 Struktur Direktori

```text
SILSILAH/
├── .env.example                  # Template konfigurasi environment (Cloud & Local)
├── .env.local                    # Konfigurasi privat lokal (diabaikan git)
├── public/
│   └── assets/
│       ├── logo.svg              # Logo aplikasi
│       └── background.svg        # Background aplikasi
├── scripts/
│   └── initDatabase.mjs          # Script inisialisasi tabel PostgreSQL otomatis
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/             # Autentikasi pengguna
│   │   │   ├── data/             # API data silsilah & audit log
│   │   │   └── users/            # API manajemen akun pengguna
│   │   ├── globals.css           # Variabel CSS & styling global
│   │   ├── layout.tsx            # Root layout Next.js
│   │   └── page.tsx              # Portal masuk & dasbor silsilah
│   ├── components/
│   │   ├── Navbar.tsx            # Header navigasi & pencarian
│   │   ├── SidebarMembers.tsx    # Panel anggota dengan tombol toggle/unhide
│   │   ├── TreeCanvas.tsx        # Kanvas interaktif pohon keluarga
│   │   ├── MemberModal.tsx       # Modal form anggota & autocomplete domisili
│   │   ├── RelationModal.tsx     # Modal relasi keluarga
│   │   ├── ProfileDrawer.tsx     # Panel profil detail anggota
│   │   ├── AuditLogDrawer.tsx    # Panel riwayat audit log (hapus/clear)
│   │   ├── AccountManagementModal.tsx # Pengelolaan akun (Superadmin)
│   │   └── ThemeCustomizerModal.tsx   # Pengaturan warna RGB tema
│   └── lib/
│       ├── db/                   # Koneksi pg pool
│       ├── store.tsx             # State manager & RBAC
│       └── familyLogic.ts        # Logika silsilah & dataset alamat Indonesia
└── package.json
```
