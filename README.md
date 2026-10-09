# SILSILAH - Aplikasi Silsilah Keluarga Interaktif

Aplikasi web modern berbasis Next.js 16, TypeScript, dan React Flow (`@xyflow/react`) untuk mendokumentasikan, menavigasi, dan mengelola silsilah keluarga interaktif sesuai spesifikasi **PRD v0.1**.

---

## 🌟 Fitur Utama Sesuai PRD

### 1. Pohon Silsilah Interaktif (React Flow)
- **Kanvas Interaktif**: Fitur pan, zoom, fit-to-view, dan "Pusatkan ke Fokus" (*Center on Focus*).
- **Kartu Anggota Khusus (`PersonNode`)**: Menampilkan foto, nama lengkap, nama panggilan, rentang tahun lahir-wafat, badge verifikasi, serta status almarhum/almarhumah.
- **Perhitungan Sebutan Hubungan Relatif Dinamis**: Sebutan kekerabatan (*Ayah, Ibu, Anak, Pasangan, Saudara Kandung/Tiri, Kakek, Nenek, Cucu, Mertua, Menantu, Keponakan*) dihitung secara otomatis dan dinamis berdasarkan **Titik Fokus** yang sedang dipilih.
- **Buka/Tutup Cabang (*Expand/Collapse*)**: Cabang keturunan dapat dibuka atau ditutup tanpa menghapus data relasi asli.
- **Pencarian Global Instan**: Menemukan anggota keluarga dengan cepat melalui *autocomplete* dan langsung mengarahkan tampilan ke orang tersebut.

### 2. Multi-Role & Hak Akses (RBAC)
Sistem memiliki 3 role utama yang diterapkan secara ketat:
- 👑 **Superadmin**: Mengelola ruang keluarga, mengundang pengguna, mengubah peran (*Superadmin/Admin/Client*), menonaktifkan akun, melihat *audit log*, serta mengelola seluruh data silsilah. Dilengkapi aturan keamanan: sistem mencegah penurunan role atau penonaktifan satu-satunya Superadmin yang aktif.
- 🛠️ **Admin**: Menambah, mengedit, dan menghapus anggota keluarga, mengunggah foto, mengelola relasi orang tua-anak dan pasangan. Tidak dapat mengelola role akun pengguna.
- 👁️ **Client**: Hanya memiliki hak baca (*Read-only*). Tombol manipulasi data dinonaktifkan, dan upaya modifikasi ditolak oleh sistem.
- **Simulator Persona Pengguna**: Tombol pengalih di bilah navigasi atas memungkinkan pengujian langsung antar role (*Superadmin*, *Admin*, *Client*) untuk memvalidasi perbedaan hak akses di laptop.

### 3. Keamanan & Pembatasan Privasi Profil (UU PDP)
- **Perlindungan Data Kontak**: Pada mode **Client**, informasi nomor telepon, WhatsApp, email, dan alamat domisili disembunyikan dengan lencana gembok privasi. Hanya Admin dan Superadmin yang dapat melihat kontak privat lengkap.
- **Pencegahan Siklus Silsilah (*Genealogical Cycle Prevention*)**: Sistem secara otomatis memvalidasi relasi orang tua-anak agar seseorang tidak dapat menjadi leluhur bagi dirinya sendiri.

### 4. Tampilan Aksesibilitas Direktori Generasi (TREE-09)
- Mode alternatif **Direktori** menyajikan silsilah dalam daftar terstruktur per generasi (Generasi 1 hingga 4) dengan filter pencarian, sangat ramah untuk pengguna layar ponsel atau perangkat aksesibilitas.

### 5. Jejak Riwayat & Audit Log
- Setiap operasi penambahan anggota, pengubahan data, penghapusan, penyambungan relasi, dan pergantian role akun otomatis dicatat dalam **Audit Log** lengkap dengan nama pelaku, role, stempel waktu, dan ringkasan aktivitas.

---

## 🛠️ Teknologi yang Digunakan

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Bahasa**: [TypeScript](https://www.typescriptlang.org/)
- **Visualisasi Pohon**: [@xyflow/react (React Flow)](https://reactflow.dev/)
- **Ikon**: [Lucide React](https://lucide.dev/)
- **Styling**: Vanilla CSS modern dengan variabel tema *Dark Luxury Heritage*
- **Penyimpanan**: Penyimpanan lokal persisten (*LocalStorage*) dengan kemampuan reset 1-klik ke data contoh awal (*Seed Data*)

---

## 🚀 Cara Menjalankan Proyek di Laptop

### 1. Menjalankan Server Pengembangan (Dev)
```bash
npm run dev
```
Buka browser di: [http://localhost:3000](http://localhost:3000)

### 2. Membangun Versi Produksi (Build)
```bash
npm run build
npm start
```

---

## 👥 Data Contoh (Seed Data)
Aplikasi telah dilengkapi data keluarga besar 4 generasi (*Keluarga Besar Sastrohusodo & Kusumo*) dengan titik fokus awal pada **Dary Darmawan Sastrohusodo**. Anda dapat mencoba fitur:
1. Klik **"Fokus"** pada anggota lain untuk melihat perubahan label hubungan relatif secara real-time.
2. Klik **"Profil"** untuk melihat lembar detail profil dan tautan keluarga terdekat.
3. Gunakan pemilih akun di pojok kanan atas untuk beralih antara akun Superadmin, Admin, dan Client.
4. Klik tombol **"+ Tambah Anggota"** atau **"Kelola Hubungan"** untuk menambah relasi baru.
