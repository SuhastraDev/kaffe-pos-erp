# ☕ Kaffe POS & HRIS (Mini ERP)

Sebuah aplikasi web berbasis **Full-Stack** yang dirancang khusus untuk manajemen operasional kafe modern. Tidak hanya berfungsi sebagai mesin kasir *(Point of Sale)*, sistem ini juga dilengkapi dengan modul HRIS cerdas yang mampu menghitung gaji karyawan secara **real-time per detik** berdasarkan kehadiran mereka.

Dibangun dengan antarmuka (UI) bernuansa *Premium Cafe Aesthetic* — Espresso, Crema, dan Foam.

---

## ✨ Fitur Unggulan

### 🛒 Modul POS (Point of Sale)

| Fitur | Deskripsi |
|---|---|
| **Smart POS Blocker** | Mesin kasir otomatis terkunci jika kasir belum absen masuk atau sedang dalam status Cuti/Sakit |
| **Manajemen Keranjang** | Perhitungan total belanja cerdas dengan deteksi limit stok produk |
| **QRIS Simulation** | Simulasi pembayaran non-tunai via QR Code dinamis dengan *auto-polling* status pembayaran |
| **Inventory Alert** | Pengurangan stok otomatis saat *checkout* dan peringatan *Low Stock* di Dashboard Admin |

### 👥 Modul HRIS & Payroll

| Fitur | Deskripsi |
|---|---|
| **Real-time Pay-per-Second** | Kasir dapat melihat estimasi gaji bertambah secara *live* (animasi berdetak tiap detik) saat sedang berjaga |
| **Smart Shift & Cross-Day Logic** | Mendukung shift malam (lintas hari/tengah malam) tanpa merusak logika tanggal absensi |
| **Auto-Cutoff System** | Mencegah *fraud* (gaji buta) — argo gaji otomatis "membeku" setelah batas waktu maksimal shift |
| **Payroll Generator** | Kalkulasi otomatis denda keterlambatan (presisi per detik), potongan jam kerja, dan cetak slip gaji |

### 🔒 Keamanan

| Fitur | Deskripsi |
|---|---|
| **OTP Email Verification** | Ganti *password* menggunakan kode OTP 6 digit yang dikirim ke email via *Nodemailer* |
| **Role-Based Access Control** | Pemisahan hak akses mutlak antara `admin` dan `kasir` |

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|---|---|
| **Frontend** | React.js, React Router, Recharts, Axios, Custom CSS |
| **Backend** | Node.js, Express.js, Bcrypt, Nodemailer (via Mailtrap) |
| **Database** | PostgreSQL (modul `pg`) |

---

## 🔑 Demo Akun

Gunakan kredensial berikut untuk mencoba aplikasi setelah instalasi:

| Role | Email | Password |
|:---|:---|:---|
| **Admin** | `admin@kafe.com` | `password` |
| **Kasir** | `kasir1@kafe.com` | `password` |

> 💡 Kode OTP dapat di-*generate* melalui halaman profil menggunakan akun Mailtrap.

---

## 🚀 Panduan Instalasi

### Persyaratan Sistem

- Node.js v16 atau lebih baru
- PostgreSQL terinstal dan berjalan

---

### 1. Persiapan Database

1. Buat database baru di PostgreSQL:
   ```sql
   CREATE DATABASE pos_kafe;
   ```
2. Import skema dari file `database.sql` ke database tersebut.

---

### 2. Setup Backend

Masuk ke direktori `server` dan install dependensi:

```bash
cd server
npm install
```

Buat file `.env` di dalam folder `server`:

```env
# Database Config
DB_USER=postgres
DB_PASSWORD=password_db_anda
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pos_kafe

# Mailtrap Config (Untuk OTP)
MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USER=user_mailtrap_anda
MAIL_PASS=pass_mailtrap_anda
```

Jalankan server:

```bash
npm run dev
# Server berjalan di http://localhost:5000
```

---

### 3. Setup Frontend

Buka terminal baru, masuk ke direktori `client`:

```bash
cd client
npm install
```

Jalankan aplikasi:

```bash
npm run dev
# Aplikasi dapat diakses di http://localhost:5173
```

---

## 👨‍💻 Developer

Developed with ☕ by **[@SuhastraDev](https://github.com/SuhastraDev)** — 2026