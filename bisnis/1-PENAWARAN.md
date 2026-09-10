# SURAT PENAWARAN

**Sawiji Studio Admin — Sistem Manajemen Studio Pilates**

---

| | |
|---|---|
| **Kepada** | ____________________ (Nama Klien / Studio) |
| **Alamat** | ____________________ |
| **Ditujukan kepada** | ____________________ (Nama PIC) |
| **Nomor Penawaran** | SWJ/PEN/2026/____ |
| **Tanggal** | ____ September 2026 |
| **Masa berlaku** | 30 hari sejak tanggal di atas |
| **Disusun oleh** | ____________________ |

---

## 1. Latar Belakang

Banyak studio pilates masih mengelola operasional harian secara manual: catatan booking di buku/chat, rekap paket di spreadsheet, dan perhitungan sisa sesi di kepala. Akibatnya:

- Resepsionis kehilangan 1–2 jam/hari hanya untuk mencatat dan menjawab pertanyaan jadwal.
- Sisa sesi member sering keliru hitung — memicu komplain.
- Member lupa paketnya mau habis, sehingga tidak memperpanjang.
- Tidak ada laporan yang andal untuk pengambilan keputusan.

**Sawiji Studio Admin** adalah jawabannya: satu aplikasi web yang menangani member, jadwal, booking, check-in, pembayaran, dan laporan — beserta halaman booking mandiri untuk member, tanpa mereka perlu instal apa pun.

---

## 2. Ruang Lingkup Pekerjaan

### 2.1 Paket A — Sistem Siap Pakai (Produksi)

| # | Modul | Isi |
|---|---|---|
| 1 | **Dashboard** | Ringkasan harian: booking, kehadiran, pendapatan bulan ini, dan daftar hal yang perlu ditindaklanjuti (paket hampir habis, tagihan, ulang tahun member, waitlist) |
| 2 | **Member** | Data member lengkap (WA, Instagram, tanggal lahir, kondisi khusus), riwayat booking & paket & pembayaran, tombol Chat WhatsApp |
| 3 | **Paket** | Master paket + pembelian paket member; sisa sesi & masa aktif dihitung otomatis |
| 4 | **Jadwal & Booking** | Kalender mingguan, pembuatan kelas, booking peserta dengan validasi (kuota, paket, duplikat, bentrok), waitlist, salin jadwal mingguan |
| 5 | **Check-in** | Halaman cepat untuk resepsionis; sesi berkurang otomatis **sekali** saat check-in; pembatalan check-in mengembalikan sesi; kebijakan no-show |
| 6 | **Pembayaran** | Transaksi bernomor otomatis `SWJ-YYYYMMDD-XXX`, filter, tandai lunas, export CSV, pengingat WhatsApp |
| 7 | **Laporan** | Pendapatan, tingkat kehadiran, kelas terpopuler, kinerja instruktur, paket terlaris, member pasif |
| 8 | **Pengaturan** | Kelola instruktur, audit log (jejak semua aksi penting), kebijakan studio |
| 9 | **Halaman Booking Customer** | `/booking` — member book sendiri tanpa login, lihat sisa sesi, batalkan sendiri dengan aman |
| 10 | **Hak Akses** | Login owner/admin dengan peran berbeda |
| 11 | **Infrastruktur** | Database Supabase, domain, deploy, backup otomatis |

### 2.2 Yang Termasuk dalam Paket A

- Setup database & migrasi data member yang ada (dari Excel/WhatsApp) — *hingga 500 member*.
- Branding: nama studio, warna, logo, nomor WhatsApp admin.
- Uji fungsi seluruh alur bisnis sebelum diserahkan.
- Pelatihan staf **1× sesi (2 jam)** + manual pengguna (PDF 20 halaman).
- Garansi perbaikan bug **90 hari** setelah serah terima.
- Hosting terkelola **3 bulan pertama** (bulan ke-4 dan seterusnya dapat masuk paket dukungan tahunan).

### 2.3 Paket B — Kustom (Opsional)

| Item | Keterangan |
|---|---|
| Integrasi WhatsApp API (notifikasi otomatis H-1) | Broadcast & reminder otomatis |
| Payment gateway (QRIS/transfer otomatis terverifikasi) | Midtrans/Xendit |
| Multi-cabang | Laporan per cabang, manajemen pusat |
| Aplikasi mobile native | Android/iOS |

### 2.4 Di Luar Lingkup (Butuh Penawaran Terpisah)

- Pembuatan konten konten/materi marketing.
- Perangkat keras (komputer/tablet/printer).
- Pengelolaan media sosial.

---

## 3. Harga

### Paket A — Sistem Siap Pakai

| Komponen | Harga |
|---|---:|
| Pengembangan & implementasi sistem | **Rp 55.000.000** |
| Migrasi data member (≤ 500) | Termasuk |
| Branding & konfigurasi | Termasuk |
| Pelatihan staf (2 jam) + manual PDF | Termasuk |
| Garansi bug 90 hari | Termasuk |
| **Total Paket A** | **Rp 55.000.000** |

> Keterangan: harga di atas berlaku untuk 1 studio, 1 lokasi. Pembayaran dalam 3 tahap (lihat bagian 5).

### Paket B — Langganan Dukungan (Opsional, mulai bulan ke-4)

| Komponen | Harga |
|---|---:|
| Hosting terkelola, backup harian, monitoring | Termasuk |
| Pembaruan & perbaikan berkelanjutan | Termasuk |
| Dukungan WhatsApp (respons ≤ 1 hari kerja) | Termasuk |
| **Biaya langganan** | **Rp 6.000.000/tahun** |

> Alternatif tanpa biaya hosting terkelola: klien menempatkan sistem di akun Vercel/Supabase sendiri (biaya langsung ke penyedia ± Rp 1–2 juta/tahun).

### Add-on (Opsional)

| Add-on | Harga |
|---|---:|
| Integrasi WhatsApp API (setup + konfigurasi) | Rp 5.000.000 |
| Payment gateway (setup + uji) | Rp 8.000.000 |
| Cabang tambahan | Rp 3.500.000/cabang |
| Laporan kustom | Rp 3.000.000 |
| Pelatihan tambahan per sesi | Rp 750.000 |
| Migrasi data > 500 member | Rp 500.000/100 member |

---

## 4. Ringkasan Investasi

| Skenario | Total Awal | Berkelanjutan |
|---|---:|---:|
| **Minimum** (Paket A, kelola hosting sendiri) | Rp 55.000.000 | ± Rp 1–2 jt/tahun (biaya penyedia) |
| **Direkomendasikan** (Paket A + dukungan tahunan) | Rp 55.000.000 | Rp 6.000.000/tahun |
| **Lengkap** (Paket A + WA API + payment + dukungan) | Rp 68.000.000 | Rp 6.000.000/tahun |

Perbandingan cepat: biaya satu resepsionis paruh waktu selama setahun setara dengan investasi sistem ini yang bekerja 24 jam tanpa cuti.

---

## 5. Syarat & Ketentuan

1. **Termin pembayaran**
   - Tahap 1 — DP 40% saat penawaran disetujui: **Rp 22.000.000**
   - Tahap 2 — 30% saat demo versi lengkap disetujui (UAT): **Rp 16.500.000**
   - Tahap 3 — 30% saat serah terima & pelatihan: **Rp 16.500.000**
2. **Jadwal pekerjaan**: 4–6 minggu sejak DP diterima dan data member diserahkan.
3. **Revisi**: 2 putaran revisi dalam lingkup Paket A. Perubahan di luar lingkup dihitung terpisah.
4. **Konten & data**: klien menyediakan logo, data member, dan materi yang diperlukan.
5. **Garansi**: bug fungsi diperbaiki gratis 90 hari. Kerusakan akibat perubahan pihak ketiga tidak termasuk.
6. **Kerahasiaan**: data member klien tidak digunakan untuk kepentingan lain.
7. **Masa berlaku penawaran**: 30 hari.

---

## 6. Kontak

| | |
|---|---|
| Nama | ____________________ |
| WhatsApp | ____________________ |
| Email | ____________________ |

---

## 7. Persetujuan

Dengan menandatangani di bawah ini, klien menyetujui penawaran ini beserta syarat dan ketentuannya.

| Klien | Penyedia |
|---|---|
| Tanda tangan: | Tanda tangan: |
| Nama: ____________________ | Nama: ____________________ |
| Jabatan: ____________________ | Jabatan: ____________________ |
| Tanggal: ____________________ | Tanggal: ____________________ |

---

*Terima kasih atas kepercayaan Anda. Kami siap membantu studio Anda tumbuh lebih rapi dan menguntungkan.*
