# Spesifikasi Aplikasi Web — Sawiji Studio Pilates

## Instruksi untuk OpenCode

Bangun aplikasi web admin untuk studio pilates bernama **Sawiji Studio**. Aplikasi ini dipakai terutama oleh owner dan admin untuk mengelola member, paket, jadwal kelas, booking, pembayaran, check-in, dan laporan operasional. Buat aplikasi yang benar-benar dapat digunakan, bukan hanya tampilan statis.

Mulai dengan meninjau struktur repository yang tersedia. Jika belum ada proyek, buat proyek **React + Vite + TypeScript** dengan **Tailwind CSS**, lalu implementasikan aplikasi ini secara bertahap. Gunakan **Supabase** untuk autentikasi dan database, tetapi siapkan mode data contoh apabila environment variable Supabase belum tersedia agar UI tetap dapat dipreview.

Jangan mengintegrasikan WhatsApp API atau payment gateway pada tahap awal. Untuk WhatsApp, sediakan tombol yang membuka `https://wa.me/` dengan pesan yang sudah terisi. Untuk pembayaran, admin mencatat pembayaran secara manual.

## Identitas dan arah visual

- Nama aplikasi: **Sawiji Studio Admin**
- Karakter: hangat, eksklusif, feminin, tenang, premium; tidak terlihat seperti dashboard gym yang maskulin.
- Bahasa antarmuka: Indonesia.
- Gunakan layout desktop-first yang responsif di tablet dan ponsel.

### Palet warna wajib

Gunakan tema yang terinspirasi price list Sawiji Studio:

| Token | Warna | Fungsi |
|---|---:|---|
| `brand-950` | `#4A0012` | sidebar, header gelap, teks pada tombol utama |
| `brand-900` | `#610018` | warna utama / tombol utama |
| `brand-800` | `#7B0A24` | hover, badge penting |
| `brand-700` | `#941B36` | aksen sekunder |
| `rose-100` | `#F5D8C5` | tombol atau panel aksen terang |
| `cream-50` | `#FFF9F4` | latar halaman |
| `cream-100` | `#F9EEE6` | card dan input lembut |
| `ink` | `#2C1A1E` | teks utama |
| `muted` | `#7D6269` | teks sekunder |

Gunakan `cream-50` sebagai background utama. Sidebar dan tombol primary menggunakan `brand-900`. Aksen, chip, dan tombol secondary menggunakan `rose-100` dengan teks `brand-950`. Hindari warna biru default. Gunakan border lembut `#EEDCD1`, radius 16px untuk card, dan bayangan tipis. Font dapat memakai `DM Sans` untuk UI dan `Playfair Display` hanya untuk heading besar/branding.

## Pengguna dan hak akses

1. **Owner**: melihat seluruh data, laporan, serta mengelola master data dan user.
2. **Admin/Resepsionis**: mengelola member, booking, pembayaran, dan check-in; tidak dapat menghapus data penting atau mengelola user.
3. **Instruktur** (tahap berikutnya): hanya dapat melihat jadwal dan daftar peserta kelasnya.

Pada MVP, implementasikan login dan role `owner` / `admin` bila Supabase siap. Jika belum, gunakan mode demo dengan user `Admin Sawiji` dan tampilkan indikator kecil “Mode Demo”.

## Struktur halaman

Sidebar desktop berisi: Dashboard, Member, Jadwal & Booking, Check-in, Paket, Pembayaran, Laporan, Pengaturan. Header memuat judul halaman, tanggal hari ini, dan profil user.

### 1. Dashboard

Tampilkan ringkasan hari ini:

- Total booking hari ini
- Peserta sudah check-in
- Kelas berjalan / kelas berikutnya
- Pendapatan bulan ini
- Paket akan habis dalam 7 hari

Tambahkan daftar “Kelas Hari Ini” berisi jam, nama kelas, instruktur, jumlah peserta/kuota, dan tombol membuka detail kelas. Tambahkan daftar “Perlu Ditindaklanjuti” untuk paket hampir habis, pembayaran belum lunas, dan booking waitlist.

### 2. Member

Tabel dan form detail member.

Field member:

- nama lengkap (wajib)
- nomor WhatsApp (wajib)
- nama Instagram (opsional)
- tanggal lahir (opsional)
- kondisi khusus / cedera (opsional)
- catatan admin (opsional)
- status aktif/nonaktif

Fitur: pencarian nama/nomor, tambah member, edit member, halaman detail, riwayat booking, riwayat paket, dan tombol “Chat WhatsApp”. Jangan hapus member secara permanen; gunakan status nonaktif.

### 3. Paket

Kelola master paket dan paket yang dibeli member.

Paket awal Sawiji Studio:

| Nama | Jumlah sesi | Harga | Masa aktif |
|---|---:|---:|---:|
| Drop-in | 1 | Rp150.000 | 7 hari |
| Paket 10 Sesi | 10 | Rp1.350.000 | 5 minggu |
| Paket 15 Sesi | 15 | Rp1.950.000 | 7 minggu |

Setiap pembelian paket menyimpan: member, paket, tanggal beli, tanggal mulai, tanggal kadaluarsa, sesi awal, sesi tersisa, harga aktual, status pembayaran, dan catatan. Sesi hanya berkurang ketika peserta berhasil check-in.

### 4. Jadwal & Booking

Sediakan tampilan kalender mingguan dan list harian. Admin dapat membuat sesi kelas dengan:

- nama/jenis kelas
- tanggal
- jam mulai dan selesai
- instruktur
- kapasitas
- lokasi/ruang (opsional)
- catatan

Pada detail kelas, tampilkan peserta terkonfirmasi dan waitlist. Saat booking, sistem harus:

1. Memastikan kelas belum penuh.
2. Memastikan member punya paket aktif dengan sesi tersisa, atau memilih booking drop-in yang sudah lunas.
3. Menolak booking duplikat pada kelas yang sama.
4. Memasukkan ke waitlist bila kuota penuh, jika admin memilih opsi tersebut.
5. Menampilkan peringatan jika peserta sudah punya booking lain di waktu yang berbenturan.

### 5. Check-in

Halaman yang sangat cepat digunakan resepsionis. Tampilkan kelas hari ini, lalu peserta per kelas dengan status `Belum hadir`, `Hadir`, `Batal`, atau `No-show`.

Saat klik **Check-in**:

- ubah status ke `Hadir`
- kurangi sesi paket sebanyak satu, hanya sekali
- simpan waktu check-in
- jangan boleh mengurangi sesi lagi saat halaman direfresh atau tombol diklik ulang

Sediakan fitur pembatalan check-in oleh admin/owner dengan konfirmasi; sesi harus dikembalikan secara aman dan tercatat di riwayat.

### 6. Pembayaran

Tampilkan daftar transaksi dengan filter periode, member, metode, dan status.

Field transaksi:

- nomor transaksi otomatis, misalnya `SWJ-20260908-001`
- tanggal
- member
- item yang dibeli (paket/drop-in)
- nominal
- metode (`Transfer`, `QRIS`, `Cash`, `Lainnya`)
- status (`Lunas`, `Menunggu pembayaran`, `Dibatalkan`, `Refund`)
- catatan / referensi transfer

MVP memakai kebijakan: pembelian paket dianggap dapat digunakan setelah status menjadi **Lunas**. Beri tombol “Tandai Lunas” dan tombol WhatsApp berisi template pengingat pembayaran.

### 7. Laporan

Sediakan filter rentang tanggal dan ringkasan:

- pendapatan total
- jumlah transaksi lunas
- jumlah booking dan kehadiran
- tingkat kehadiran
- kelas terpopuler berdasarkan booking
- instruktur dengan jumlah kelas dan kehadiran peserta
- paket yang paling banyak terjual
- member aktif dan member yang tidak hadir lebih dari 30 hari

Tampilkan tabel serta chart sederhana. Nominal Rupiah harus ditampilkan tanpa desimal, contohnya `Rp1.350.000`.

## Aturan bisnis penting

- Member boleh memiliki beberapa paket aktif, tetapi saat booking admin harus memilih paket yang dipakai. Bila hanya ada satu paket valid, pilih otomatis.
- Satu booking hanya dapat memiliki satu sumber sesi/paket.
- Paket yang kedaluwarsa tidak dapat dipakai booking/check-in.
- Pembatalan booking sebelum check-in tidak mengurangi sesi.
- No-show pada MVP tidak otomatis mengurangi sesi; sediakan aksi admin “Potong sesi no-show” dengan dialog konfirmasi.
- Semua mutasi penting (check-in, pengembalian sesi, perubahan pembayaran) harus tersimpan sebagai audit log sederhana.
- Gunakan zona waktu `Asia/Jakarta` untuk tanggal dan waktu transaksi/jadwal.

## Model database Supabase

Buat SQL migration atau schema yang mencakup tabel berikut:

- `profiles` — relasi ke `auth.users`, nama, role.
- `members` — profil peserta.
- `instructors` — nama, nomor WhatsApp, status aktif.
- `package_products` — master paket.
- `member_packages` — paket yang dimiliki member dan saldo sesi.
- `class_sessions` — jadwal setiap sesi kelas.
- `bookings` — relasi member ke class session dan member package, status booking/check-in.
- `payments` — transaksi pembayaran.
- `audit_logs` — catatan perubahan penting.

Gunakan UUID untuk primary key. Tambahkan `created_at` dan `updated_at` pada tabel utama. Tulis RLS policy dasar: user login hanya dapat mengakses data studio; MVP dapat menganggap satu studio saja, tetapi struktur kode jangan menyulitkan multi-studio di masa depan.

## Data contoh

Sediakan seed/demo data yang realistis:

- 8 member
- 3 instruktur
- 3 paket awal Sawiji Studio
- jadwal kelas untuk 7 hari
- booking dengan variasi status: terkonfirmasi, hadir, batal, waitlist
- beberapa pembayaran lunas dan menunggu pembayaran

## Kualitas implementasi

- Gunakan TypeScript dengan tipe domain yang jelas.
- Form wajib memiliki validasi dan pesan error Bahasa Indonesia.
- Gunakan modal/drawer untuk tambah dan edit data bila sesuai.
- Beri loading, empty state, dan notifikasi sukses/gagal.
- Semua tombol penting harus berfungsi pada mode demo.
- Pecah komponen menjadi rapi dan hindari satu file besar.
- Jangan gunakan data dummy yang tersebar; simpan dalam satu data service/repository.
- Sediakan file `.env.example` berisi `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` tanpa nilai rahasia.
- Buat `README.md` yang menjelaskan cara menjalankan proyek, mengaktifkan Supabase, menjalankan migration/seed, dan mode demo.

## Urutan pengerjaan

1. Audit repository dan jelaskan rencana singkat sebelum mengubah file.
2. Siapkan fondasi aplikasi, tema, layout, navigasi, dan data service demo.
3. Bangun Member, Paket, Jadwal & Booking, lalu Check-in beserta aturan bisnisnya.
4. Bangun Pembayaran, Dashboard, dan Laporan.
5. Tambahkan schema/migration Supabase dan integrasi jika environment variable tersedia.
6. Jalankan build/lint/test yang tersedia; perbaiki error sebelum selesai.
7. Di akhir, jelaskan file yang dibuat, cara menjalankan, serta fitur yang sudah dan belum terhubung ke Supabase.

## Di luar cakupan MVP

- Payment gateway otomatis.
- WhatsApp API otomatis/broadcast.
- Portal member untuk booking mandiri.
- QR/barcode check-in.
- Multi-cabang/multi-studio penuh.

Bangun dengan struktur yang memungkinkan fitur tersebut ditambahkan kemudian.
