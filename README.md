# ☕ Kaffe POS & HRIS (Mini ERP)

Sebuah aplikasi web **Full-Stack** untuk manajemen operasional kafe modern yang menggabungkan **mesin kasir (Point of Sale)** dan **modul HRIS** dalam satu platform terintegrasi. Sistem ini mampu menghitung gaji karyawan secara **real-time per detik** berdasarkan kehadiran mereka, memproses pembayaran tunai maupun **QRIS** via Xendit, serta mengelola inventaris, laporan penjualan, dan absensi — semuanya dari satu dashboard.

Dibangun dengan antarmuka (UI) bernuansa _Premium Cafe Aesthetic_ — Espresso, Crema, dan Foam.

---

## 📋 Daftar Isi

- [Fitur Unggulan](#-fitur-unggulan)
- [Halaman & Modul](#-halaman--modul)
- [Tech Stack](#️-tech-stack)
- [Demo Akun](#-demo-akun)
- [Panduan Instalasi](#-panduan-instalasi)
- [Developer](#-developer)

---

## ✨ Fitur Unggulan

### 🛒 Modul POS (Point of Sale)

| Fitur                         | Deskripsi                                                                                                                                                          |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Smart POS Blocker**         | Mesin kasir otomatis **terkunci** jika kasir belum absen masuk atau sedang dalam status Cuti/Sakit — mencegah transaksi tanpa kehadiran                            |
| **Keranjang Belanja Cerdas**  | Tambah/hapus item, validasi stok real-time (tidak bisa melebihi stok tersedia), kalkulasi total otomatis                                                           |
| **Pembayaran Tunai**          | Input jumlah bayar, kalkulasi kembalian otomatis                                                                                                                   |
| **Pembayaran QRIS (Xendit)**  | Integrasi nyata dengan Xendit API — menghasilkan QR Code QRIS dinamis, _auto-polling_ status pembayaran setiap 3 detik, dan otomatis berpindah ke struk saat lunas |
| **Pengurangan Stok Otomatis** | Stok produk dikurangi secara atomik (transaksional) saat checkout — anti data _race condition_                                                                     |
| **Cetak Struk PDF**           | Struk digital lengkap (nomor order, kasir, item, total, metode bayar, QR Code) yang bisa di-download sebagai PDF                                                   |

### 👥 Modul HRIS & Payroll

| Fitur                             | Deskripsi                                                                                                                                                  |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Real-time Pay-per-Second**      | Kasir melihat estimasi gaji berdetak naik **setiap detik** saat sedang berjaga — dihitung dari formula: `gajiPokok / (26 hari × 8 jam × 3600 detik)`       |
| **Smart Shift & Cross-Day Logic** | Mendukung shift malam yang melewati tengah malam tanpa merusak logika tanggal absensi                                                                      |
| **Auto-Cutoff 8 Jam**             | Argo gaji otomatis **membeku** setelah 8 jam (28.800 detik) per hari — mencegah _fraud_ dari lupa clock-out                                                |
| **Absen Lengkap**                 | Clock-in, Clock-out, pengajuan Izin & Sakit dengan catatan — semua dari satu panel                                                                         |
| **Payroll Generator**             | Admin memproses gaji bulanan dengan rincian: gaji pokok, jam aktual, denda keterlambatan (presisi per detik), bonus/potongan manual, dan status pembayaran |
| **Live Salary Monitor**           | Dashboard Admin menampilkan gaji _live_ semua karyawan aktif dengan animasi angka yang bergerak naik (`AnimatedNumber`)                                    |

### 📊 Modul Laporan & Inventaris

| Fitur                     | Deskripsi                                                                                                                                                            |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Dashboard Real-time**   | 4 kartu statistik (pendapatan hari ini, total transaksi, kehadiran staff, stok menipis), grafik penjualan 7 hari, top 5 menu, rasio Cash vs QRIS                     |
| **Live Staff Monitor**    | Widget di dashboard yang menampilkan status real-time setiap karyawan: _Working_ (animasi bernapas), _Out_, _Sick_, _Leave_ — lengkap dengan indikator keterlambatan |
| **Manajemen Stok Visual** | Bar stok berwarna (Aman/Menipis/Habis), form restock, log perubahan stok lengkap (user, waktu, catatan)                                                              |
| **Low Stock Alert**       | Peringatan otomatis saat stok produk ≤ 10 unit di dashboard, dan banner khusus di halaman stok saat ≤ 5 unit                                                         |
| **Laporan Penjualan**     | Filter berdasarkan tanggal, kasir, dan nomor order — menampilkan total revenue, rata-rata per transaksi, dan total item terjual                                      |

### 🔒 Keamanan & Akses

| Fitur                         | Deskripsi                                                                                                      |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------- |
| **JWT Authentication**        | Token berbasis JWT dengan masa berlaku 1 hari, tersimpan di localStorage                                       |
| **Role-Based Access Control** | Pemisahan hak akses mutlak antara `admin` dan `kasir` — route dilindungi oleh `ProtectedRoute` component       |
| **OTP Email Verification**    | Ganti password menggunakan kode OTP 6 digit (berlaku 10 menit) yang dikirim ke email via Nodemailer + Mailtrap |
| **Password Hashing**          | Semua password di-hash menggunakan Bcrypt sebelum disimpan ke database                                         |

---

## 🗂️ Halaman & Modul

### 👤 Sisi Kasir (4 Halaman)

| Halaman                                | Deskripsi                                                                                                                                          |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **POS** `/kasir/pos`                   | Halaman utama kasir — grid produk dengan pencarian, keranjang belanja, widget absensi, dan checkout (Tunai/QRIS). Terkunci jika belum absen.       |
| **Riwayat Transaksi** `/kasir/history` | Daftar semua transaksi kasir sendiri — kartu ringkasan, filter tanggal & nomor order, detail item yang bisa di-expand, link ke struk               |
| **Absensi & Gaji** `/kasir/absen`      | Hero section gaji _live_ berdetak per detik, progress bar target jam kerja bulanan (208 jam), info shift, ringkasan kehadiran, dan riwayat payroll |
| **Profil** `/kasir/profile`            | Lihat profil (nama, email, avatar) dan ganti password via OTP email                                                                                |

### 🛡️ Sisi Admin (11 Halaman)

| Halaman                             | Deskripsi                                                                                                                                                 |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Dashboard** `/admin/dashboard`    | Statistik harian, grafik penjualan 7 hari (Recharts), top 5 menu, rasio pembayaran, dan **Live Staff Monitor** — auto-refresh setiap 30 detik             |
| **Kategori** `/admin/categories`    | CRUD kategori produk — form inline dengan mode edit, konfirmasi hapus via modal                                                                           |
| **Produk** `/admin/products`        | CRUD produk lengkap — nama, kategori, harga, stok, deskripsi, upload gambar, toggle ketersediaan. Pencarian dan tabel dengan thumbnail                    |
| **Stok** `/admin/stock`             | Restock produk, visualisasi stok dengan bar berwarna (Aman/Menipis/Habis), panel log perubahan stok                                                       |
| **Transaksi** `/admin/transactions` | Semua transaksi dari seluruh kasir — ringkasan total, filter metode bayar (Cash/QRIS), pencarian, dan link struk                                          |
| **Laporan** `/admin/reports`        | Kartu revenue total, filter tanggal & kasir, strip ringkasan (jumlah transaksi, rata-rata, total item), detail order yang bisa di-expand                  |
| **Karyawan** `/admin/employees`     | Daftar karyawan — assign shift, atur gaji pokok, warning badge jika shift belum di-assign                                                                 |
| **Shift** `/admin/shifts`           | CRUD shift kerja — nama, jam mulai, jam selesai, preview durasi otomatis, badge warna untuk waktu                                                         |
| **Absensi** `/admin/attendance`     | Riwayat absensi seluruh karyawan — ringkasan (tepat waktu, terlambat, sakit, izin), filter bulan, badge "Working..." animasi untuk yang sedang aktif      |
| **Penggajian** `/admin/payroll`     | Tabel gaji _live_ per karyawan (polling 5 detik + tick lokal 1 detik), proses gaji via modal (rincian potongan, bonus, status), progress bar durasi kerja |
| **Pengguna** `/admin/users`         | CRUD akun — nama, email, role (admin/kasir), toggle aktif/nonaktif, pencarian dan filter role                                                             |
| **Profil** `/admin/profile`         | Edit nama & email (khusus admin), ganti password via OTP email                                                                                            |

---

## 🛠️ Tech Stack

Proyek ini dibangun menggunakan **PERN Stack** — salah satu stack modern yang sangat populer di industri saat ini.

> 💡 **PERN** = **P**ostgreSQL · **E**xpress.js · **R**eact.js · **N**ode.js

---

### 🖥️ Frontend (`/client`)

Bagian yang dilihat dan diinteraksikan oleh Kasir dan Admin.

| Teknologi               | Peran                                                                                                           |
| ----------------------- | --------------------------------------------------------------------------------------------------------------- |
| **React.js**            | Library utama untuk membangun UI interaktif dan _Single Page Application_ (SPA)                                 |
| **Vite**                | Build tool generasi baru yang membuat proses pengembangan React menjadi sangat cepat (_Hot Module Replacement_) |
| **Tailwind CSS**        | Framework CSS berbasis utility-class untuk mendesain tampilan langsung di JSX                                   |
| **Axios**               | HTTP Client untuk berkomunikasi dengan REST API Backend                                                         |
| **React Router DOM**    | Mengatur navigasi antar halaman tanpa reload browser, termasuk _Protected Route_ berbasis role                  |
| **Recharts**            | Library grafik/chart untuk visualisasi data penjualan di Dashboard                                              |
| **qrcode.react**        | Render QR Code QRIS langsung di browser sebagai komponen React                                                  |
| **jsPDF + html2canvas** | Mengkonversi struk transaksi menjadi file PDF yang bisa di-download                                             |
| **React Hot Toast**     | Library notifikasi pop-up (_toast_) yang responsif                                                              |

---

### ⚙️ Backend (`/server`)

"Otak" di balik layar yang memproses data, menghitung gaji, dan mengatur keamanan.

| Teknologi          | Peran                                                                           |
| ------------------ | ------------------------------------------------------------------------------- |
| **Node.js**        | Runtime JavaScript di sisi server                                               |
| **Express.js**     | Framework web untuk pembuatan RESTful API                                       |
| **JSON Web Token** | Autentikasi berbasis token dengan masa berlaku 1 hari                           |
| **Bcrypt**         | Enkripsi password sebelum disimpan ke database                                  |
| **Nodemailer**     | Mengirim email kode OTP untuk reset password                                    |
| **Multer**         | Middleware untuk menangani upload gambar produk (`multipart/form-data`)         |
| **Dotenv**         | Mengelola variabel lingkungan (kredensial DB, API key) agar tidak bocor ke kode |

---

### 🗄️ Database

| Teknologi                | Peran                                                                                                                                             |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **PostgreSQL**           | RDBMS tingkat enterprise — 9 tabel: `users`, `categories`, `products`, `orders`, `order_items`, `stock_logs`, `shifts`, `attendances`, `payrolls` |
| **`pg` (node-postgres)** | Driver untuk menghubungkan Node.js dengan PostgreSQL menggunakan _connection pool_                                                                |

---

### 🌐 External Service

| Layanan      | Peran                                                                                                     |
| ------------ | --------------------------------------------------------------------------------------------------------- |
| **Xendit**   | Payment gateway untuk menghasilkan QR Code QRIS nyata dan memproses pembayaran non-tunai (mode _sandbox_) |
| **Mailtrap** | SMTP sandbox untuk menguji pengiriman email OTP dengan aman tanpa masuk folder spam                       |

---

## 🔑 Demo Akun

Gunakan kredensial berikut untuk mencoba aplikasi setelah instalasi:

| Role      | Email             | Password   |
| :-------- | :---------------- | :--------- |
| **Admin** | `admin@kafe.com`  | `password` |
| **Kasir** | `kasir1@kafe.com` | `password` |

> 💡 Kode OTP dapat di-_generate_ melalui halaman profil. Email OTP akan masuk ke inbox Mailtrap Anda.

---

## 🚀 Panduan Instalasi

### Persyaratan Sistem

- Node.js v16 atau lebih baru
- PostgreSQL terinstal dan berjalan
- Akun [Mailtrap](https://mailtrap.io/) (gratis, untuk fitur OTP)
- Akun [Xendit](https://www.xendit.co/) (gratis, untuk simulasi QRIS)

---

### 1. Clone Repository

```bash
git clone https://github.com/SuhastraDev/pos-app.git
cd pos-app
```

---

### 2. Persiapan Database

1. Buat database baru di PostgreSQL:
   ```sql
   CREATE DATABASE pos_app;
   ```
2. Import skema dari file `database.sql` ke database tersebut:
   ```bash
   psql -U postgres -d pos_app -f database.sql
   ```

---

### 3. Install Semua Dependensi

Dari root folder (`pos-app`), jalankan:

```bash
npm run install-all
```

Perintah ini akan otomatis meng-install dependensi untuk root, client, dan server sekaligus.

---

### 4. Konfigurasi Environment

Buat file `.env` di dalam folder `server`:

```env
# Server
PORT=5000

# Database Config
DB_USER=postgres
DB_PASSWORD=password_db_anda
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pos_app

# JWT
JWT_SECRET=rahasia_jwt_anda_ganti_ini

# Payment Gateway (Xendit Sandbox)
XENDIT_SECRET_KEY=xnd_development_YOUR_XENDIT_KEY

# Mailtrap Config (Untuk OTP)
MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USER=user_mailtrap_anda
MAIL_PASS=pass_mailtrap_anda
```

> ⚠️ Ganti semua nilai `*_anda` / `YOUR_*` dengan kredensial milik Anda.

---

### 5. Jalankan Aplikasi

Dari root folder (`pos-app`), cukup satu perintah:

```bash
npm run dev
```

Perintah ini akan menjalankan **Frontend + Backend secara bersamaan**:

- 🖥️ Client → `http://localhost:5173`
- ⚙️ Server → `http://localhost:5000`

> 💡 Jika ingin menjalankan terpisah, gunakan `npm run client` atau `npm run server`.

---

## 👨‍💻 Developer

Developed with ☕ by **[@SuhastraDev](https://github.com/SuhastraDev)** — 2026
