# PANDUAN PENGGUNA — Sawiji Studio Admin

> Manual book lengkap untuk pemakaian sehari-hari aplikasi admin **Sawiji Studio Pilates**.
> Ditulis untuk owner, admin, dan resepsionis. Bahasa santai-formal, langkah bernomor, tanpa istilah teknis yang tidak perlu.

---

## Daftar Isi

1. [Pengenalan Aplikasi](#1-pengenalan-aplikasi)
2. [Cara Mengakses Aplikasi](#2-cara-mengakses-aplikasi)
3. [Glosarium — Istilah yang Dipakai Aplikasi](#3-glosarium--istilah-yang-dipakai-aplikasi)
4. [10 Aturan Emas (WAJIB Dibaca — Mencegah Salah Paham)](#4-10-aturan-emas)
5. [Flow Penggunaan Harian Resepsionis](#5-flow-penggunaan-harian-resepsionis)
6. [Manual Per Halaman](#6-manual-per-halaman)
   - 6.1 Dashboard
   - 6.2 Member
   - 6.3 Jadwal & Booking
   - 6.4 Check-in
   - 6.5 Paket
   - 6.6 Pembayaran
   - 6.7 Laporan
   - 6.8 Pengaturan
7. [Pesan Error dan Artinya](#7-pesan-error-dan-artinya)
8. [FAQ](#8-faq)
9. [Panduan Customer — Halaman Booking Mandiri](#9-panduan-customer--halaman-booking-mandiri)

---

## 1. Pengenalan Aplikasi

**Sawiji Studio Admin** adalah aplikasi web untuk mengelola operasional harian studio pilates: data member, paket, jadwal kelas, booking, check-in, pembayaran, dan laporan.

| Hal | Keterangan |
|---|---|
| Siapa yang memakai | Owner, admin, resepsionis (1 perangkat cukup — buka di laptop, tablet, atau HP) |
| Alamat aplikasi | https://sawiji-demo.vercel.app |
| Bahasa | Indonesia |
| Zona waktu | Semua tanggal & jam memakai **WIB (Asia/Jakarta)**, tidak terpengaruh jam perangkat |
| Mode saat ini | **Mode Demo** — data contoh, tersimpan di browser saja |

### Arti "Mode Demo"

Saat ini aplikasi berjalan dalam Mode Demo (tampak badge kuning **"Mode Demo"** di pojok kanan atas):

- Seluruh fitur **berfungsi penuh** — boleh dicoba tanpa takut merusak apa pun.
- Data yang Anda buat (booking, check-in, dsb.) tersimpan **selama tab itu terbuka** — pindah halaman, tombol back/forward, atau membuka halaman customer lewat address bar tidak menghilangkannya.
- **Refresh (F5) atau tab baru = kembali ke data contoh awal.** Ini disengaja agar setiap tester mulai bersih, bukan error.
- Saat nanti Supabase diaktifkan, data tersimpan permanen di server dan badge Mode Demo hilang.

---

## 2. Cara Mengakses Aplikasi

### Di laptop/PC
1. Buka browser (Chrome, Edge, atau Safari).
2. Ketik alamat: `https://sawiji-demo.vercel.app`
3. Selesai — tidak perlu instal apa pun.

### Di iPhone/Android
1. Buka Safari (iPhone) atau Chrome (Android).
2. Ketik alamat yang sama.
3. *(Opsional, agar seperti aplikasi)*: di Safari iPhone, tap tombol **Bagikan** (kotak dengan panah ke atas) → **Add to Home Screen**. Muncul ikon Sawiji di layar utama.
4. Di HP, tampilan berubah otomatis: tabel menjadi **kartu bertumpuk** dan menu menjadi **bar horizontal yang bisa digeser** di bawah judul halaman.

### Memahami susunan layar

- **Sidebar kiri (desktop)** — menu utama: Dashboard, Member, Jadwal & Booking, Check-in, Paket, Pembayaran, Laporan, Pengaturan.
- **Di HP** — menu tersebut berbentuk bar gelap yang bisa digeser ke samping, letaknya di bawah judul halaman.
- **Header atas** — judul halaman, tanggal hari ini (WIB), badge "Mode Demo", dan profil "Admin Sawiji".
- **Notifikasi** — setiap aksi (simpan, check-in, tandai lunas, dsb.) memunculkan pesan singkat di pojok layar: hijau = berhasil, merah = gagal (beserta alasannya), kuning = peringatan. Hilang sendiri dalam beberapa detik.
- **Jendela form (modal)** — tutup dengan tombol ✕, klik area gelap di luarnya, atau tekan **Esc**. Tekan **Enter** di kolom isian untuk langsung menyimpan.

---

## 3. Glosarium — Istilah yang Dipakai Aplikasi

Baca dulu agar tidak salah paham saat operasional:

| Istilah | Arti di aplikasi ini |
|---|---|
| **Sesi** | 1 kehadiran di 1 kelas. Paket berisi sejumlah sesi (mis. Paket 10 Sesi = 10 sesi). |
| **Paket aktif** | Paket yang **(a)** sudah Lunas, **(b)** belum kadaluarsa, **(c)** masih punya sisa sesi. Hanya paket aktif yang bisa dipakai booking/check-in. |
| **Drop-in** | Bayar per kelas (Rp150.000), tanpa paket. Satu kelas = satu transaksi drop-in. |
| **Booking** | Pendaftaran member ke satu kelas. Status awalnya **Terkonfirmasi**. |
| **Waitlist** | Daftar tunggu, muncul bila kelas sudah penuh. Bisa dipromosikan jadi Terkonfirmasi bila ada kursi kosong. |
| **Check-in** | Proses menandai peserta **Hadir**. **Baru di momen inilah sesi paket berkurang 1.** |
| **No-show** | Peserta terdaftar tapi tidak datang. Sesi **tidak** otomatis terpotong — admin memutuskan lewat tombol "Potong sesi". |
| **Batal** | Booking dibatalkan sebelum check-in. **Sesi tidak terpotong.** |
| **Masa aktif paket** | Lamanya paket berlaku sejak tanggal mulai (Drop-in 7 hari, Paket 10 = 35 hari, Paket 15 = 49 hari). Lewat tanggal itu paket kadaluarsa walau sesinya masih ada. |
| **Audit log** | Catatan otomatis semua aksi penting (siapa, apa, kapan). Ada di halaman Pengaturan. |
| **Nomor transaksi** | Kode unik otomatis, contoh `SWJ-20260908-001` = transaksi pertama tanggal 8 Sep 2026. |

---

## 4. 10 Aturan Emas

Ini poin-poin yang **paling sering jadi sumber salah paham**. Pahami sebelum melayani member:

1. **Sesi berkurang HANYA saat check-in.** Booking, waitlist, dan pembatalan booking **tidak** mengurangi sesi.
2. **Batal check-in mengembalikan sesi.** Salah klik Check-in? Tekan "Batal check-in" — sesi kembali utuh dan kejadiannya tercatat di audit log.
3. **No-show tidak otomatis memotong sesi.** Kebijakan potong (atau maafkan) adalah keputusan admin lewat tombol **"Potong sesi no-show"** dengan dialog konfirmasi. Potongan hanya bisa dilakukan **satu kali**.
4. **Paket harus Lunas dulu baru bisa dipakai.** Paket berstatus "Menunggu pembayaran" tidak bisa dipakai booking/check-in walau sesinya masih banyak. Tandai Lunas dulu di halaman Pembayaran atau Paket.
5. **Paket kadaluarsa tidak bisa dipakai walau sesinya tersisa.** Perhatikan tanggal kadaluarsa; dashboard akan menandai paket yang mau habis masa aktifnya.
6. **Kelas penuh ≠ tolak.** Admin tetap bisa mendaftarkan member ke **waitlist**. Saat ada yang batal, promosikan dari daftar waitlist di detail kelas.
7. **Satu member hanya boleh sekali per kelas.** Aplikasi menolak booking duplikat secara otomatis.
8. **Booking bentrok diberi peringatan, bukan ditolak.** Bila member sudah punya kelas lain di jam yang sama, aplikasi menampilkan peringatan kuning — admin yang memutuskan lanjut atau tidak.
9. **Member tidak pernah dihapus.** Member yang berhenti cukup dinonaktifkan supaya riwayatnya tetap utuh.
10. **Drop-in langsung membuat transaksi Lunas.** Saat booking tipe drop-in, transaksi Rp150.000 otomatis tercatat — tidak perlu input pembayaran dua kali.

---

## 5. Flow Penggunaan Harian Resepsionis

Alur tipikal satu hari kerja. Ikuti berurutan:

```
┌─────────────────────────────────────────────────────────────┐
│  PAGI — Persiapan                                           │
│  1. Buka Dashboard → lihat "Kelas Hari Ini" & perlu         │
│     ditindaklanjuti (paket mau habis, tagihan, waitlist)    │
│  2. Kirim WA pengingat dari tombol yang tersedia            │
├─────────────────────────────────────────────────────────────┤
│  SEBELUM KELAS — Booking walk-in / via chat                 │
│  3. Jadwal & Booking → pilih hari → Detail kelas            │
│     → "+ Booking Peserta" → pilih member → pilih paket      │
│     (atau drop-in) → Booking                                │
├─────────────────────────────────────────────────────────────┤
│  SAAT KELAS — Check-in                                      │
│  4. Check-in → pilih kelas → klik "Check-in" per peserta    │
│     yang datang  (sesi terpotong otomatis, sekali saja)     │
│  5. Yang tidak datang → tombol "No-show"                    │
├─────────────────────────────────────────────────────────────┤
│  SETELAH KELAS — Keuangan & kebersihan data                 │
│  6. Pembayaran → catat transaksi manual bila ada            │
│     (transfer bukan lewat booking) / Tandai Lunas tagihan   │
│  7. Ada kelas baru minggu depan? Jadwal → "Salin ke         │
│     minggu depan" lalu sesuaikan                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. Manual Per Halaman

### 6.1 Dashboard

**Fungsi:** ringkasan hari ini + daftar hal yang butuh tindakan. Halaman pembuka aplikasi.

**4 kartu angka di atas:**

| Kartu | Artinya |
|---|---|
| Booking hari ini | Jumlah peserta non-batal, non-waitlist di semua kelas hari ini. Sub-teks menunjukkan jumlah kelas. |
| Sudah check-in | Berapa yang sudah Hadir. Bandingkan dengan angka booking — selisihnya yang harus Anda kejar. |
| Kelas berjalan / berikutnya | Nama kelas yang sedang berjalan sekarang (dihitung dari jam WIB), atau kelas terdekat berikutnya beserta instrukturnya. |
| Pendapatan bulan ini | Total transaksi **Lunas** dari tanggal 1 s/d hari ini. Yang "Menunggu pembayaran" tidak dihitung. |

**Kelas Hari Ini** — daftar semua kelas hari ini: jam, nama, instruktur, terisi/kuota, tanda **PENUH**, jumlah waitlist. Tombol **"Detail Kelas"** langsung membuka halaman Check-in pada kelas itu.

**Perlu Ditindaklanjuti** — muncul bila ada (kosong = tampil "Semua beres"):

| Kartu | Kapan muncul | Aksi yang disediakan |
|---|---|---|
| Ulang tahun (highlight merah muda) | Member aktif berulang tahun dalam 7 hari | "Kirim Ucapan WA" — WhatsApp terbuka dengan ucapan sudah terisi |
| Paket mau habis | Paket aktif kadaluarsa ≤ 7 hari | "Chat WhatsApp" — ajak perpanjangan/beli paket baru |
| Pembayaran belum lunas | Transaksi berstatus Menunggu | "Tandai Lunas" (ubah status + buka paket terkait) dan "Pengingat WA" (pesan nominal sudah terisi) |
| Waitlist hari ini | Ada member di daftar tunggu kelas hari ini | "Buka Jadwal" — promosikan bila ada kursi |

---

### 6.2 Member

**Fungsi:** basis data seluruh peserta.

#### A. Mencari member
1. Buka **Member**.
2. Ketik nama atau nomor WhatsApp di kotak pencarian. Hasil langsung terfilter.

#### B. Menambah member baru
1. Klik **"+ Tambah Member"**.
2. Isi:
   - **Nama lengkap** — wajib.
   - **Nomor WhatsApp** — wajib, format `08…`, 9–15 digit. Dipakai untuk semua tombol WA.
   - **Nama Instagram, tanggal lahir** — opsional. *Tanggal lahir penting: dipakai untuk pengingat ulang tahun di Dashboard.*
   - **Kondisi khusus / cedera** — opsional tapi **sangat disarankan** (mis. "cedera lutut kanan") agar instruktur & admin aware.
   - **Catatan admin** — bebas.
   - Centang/hilangkan **"Member aktif"**.
3. Klik **Tambah Member**. Validasi otomatis: nama & WA wajib diisi, WA 9–15 digit; pesan error berwarna merah di bawah kolomnya.

#### C. Halaman detail member (klik nama member)
Berisi seluruh riwayat member:
- **Catatan Penting** — tanggal lahir, kondisi khusus, catatan admin.
- **Paket** — semua paket yang pernah dibeli: tanggal, kadaluarsa, sisa/total sesi, harga, status bayar. Baris bawah menampilkan berapa paket aktif saat ini.
- **Riwayat Booking** — semua kelas yang pernah didaftarkan member + status. Tombol **Batalkan** tersedia untuk booking yang belum check-in.
- **Riwayat Pembayaran** — semua transaksi member ini.
- **Edit** — ubah data; **Chat WhatsApp** — buka WA dengan sapaan terisi.

> **Penting — Hapus vs Nonaktif:** tombol **Hapus** hanya berfungsi untuk member yang **belum punya riwayat** apa pun (salah input, duplikat). Member yang sudah pernah booking/beli paket/bayar **tidak bisa dihapus** — ubah jadi **Nonaktif** lewat Edit agar riwayat & laporan tetap utuh. Aplikasi menolak otomatis dengan penjelasan bila dicoba.

---

### 6.3 Jadwal & Booking

**Fungsi:** mengatur kelas dan mendaftarkan peserta. Halaman tersibuk admin.

#### A. Membaca kalender
- **Kalender Mingguan** (Senin–Minggu): tiap kotak hari menampilkan hingga 3 kelas + indikator "+N lainnya". **Klik kotak hari** untuk melihat detailnya di bawah. Panah **← →** pindah minggu; **"Minggu ini"** kembali ke minggu sekarang.
- **List Harian**: kelas pada hari terpilih, urut jam, lengkap dengan terisi/kuota dan tanda PENUH.
- **Di HP**: kalender tampil 2 kolom — cukup tap harinya.

#### B. Membuat kelas baru
1. Pilih hari target di kalender, lalu klik **"+ Buat Kelas"**.
2. Isi: nama kelas, tanggal, jam mulai & selesai, instruktur (hanya yang aktif), kapasitas, ruang, catatan.
3. Klik **Simpan**. Validasi: semua wajib, jam selesai harus setelah jam mulai, kapasitas ≥ 1.
4. Kelas muncul di kalender dan list harian.

#### C. Mengedit / menghapus kelas
- **Edit** — ubah semua field.
- **Hapus** — **akan ditolak bila masih ada peserta terdaftar**. Batalkan dulu booking pesertanya (lewat Detail), baru hapus.

#### D. Booking peserta (inti operasional)
1. Klik **Detail** pada kelas yang dituju → jendela detail kelas terbuka (peserta + waitlist + aksi).
2. Klik **"+ Booking Peserta"**.
3. Pilih **Member**. Baru setelah itu muncul bagian paket:
   - **Punya paket aktif 1** → kolom paket muncul, tinggal pilih.
   - **Punya ≥ 2 paket aktif** → **Anda harus memilih satu**. Lihat sisa sesi & kadaluarsa di teks opsinya, pilih yang masuk akal (biasanya yang lebih cepat kadaluarsa).
   - **Tidak punya paket aktif** → muncul peringatan kuning. Pilihan Anda: centang **"Booking drop-in"** (transaksi Rp150.000 Lunas otomatis tercatat), atau batalkan dan belikan paket dulu di halaman Paket.
4. Bila kelas **penuh**: muncul opsi **"daftarkan ke waitlist"** — centang bila member bersedia menunggu; tanpa dicentang, booking ditolak.
5. **Peringatan kuning bentrok jadwal** akan muncul otomatis bila member punya booking lain di jam yang tumpang tindih hari itu. **Anda yang memutuskan** — peringatan bukan larangan.
6. Klik **Booking**. Peserta baru tampil di daftar dengan status **Terkonfirmasi** (atau **Waitlist** bila penuh).

#### E. Mengelola peserta di detail kelas

| Status peserta | Tombol yang tersedia | Efek |
|---|---|---|
| Terkonfirmasi | **Check-in**, No-show, Batalkan, WA | — |
| Hadir | **Batal check-in** | Sesi dikembalikan, waktu check-in dihapus |
| No-show | **Potong sesi** (bila pakai paket & belum pernah dipotong) | 1 sesi dikurangi, hanya sekali |
| Terkonfirmasi/Waitlist | **Batalkan** | Sesi tidak terpotong |

Tombol **WA** per peserta membuka WhatsApp dengan info kelas yang sudah terisi — praktis untuk mengingatkan.

#### F. Waitlist
- Daftar tunggu tampil terpisah di bawah peserta.
- **Promosikan** → pindah ke Terkonfirmasi. Ditolak bila kelas masih penuh (berarti masih ada yang harus batal dulu).

#### G. Salin jadwal ke minggu depan
1. Pindah kalender ke minggu yang jadwalnya ingin diduplikasi (biasanya minggu ini).
2. Klik **"Salin ke minggu depan"**.
3. Selesai: semua kelas tersalin ke tanggal +7 hari. Notifikasi di pojok layar memberi tahu: berapa dibuat, berapa **dilewati** karena sudah ada (jadi aman bila tombol terklik dua kali).
4. Booking peserta **tidak** ikut tersalin — hanya jadwalnya.

---

### 6.4 Check-in

**Fungsi:** halaman tercepat — dipakai saat peserta datang. Dirancang untuk HP/tablet di meja resepsionis.

#### A. Melakukan check-in
1. Buka **Check-in** → tab kelas hari ini tampil di atas (grid kartu seragam; di HP 2 kolom).
2. Klik kelas yang berjalan.
3. Daftar peserta tampil: nama, **sumber sesi** (paket mana / Drop-in), status, jam check-in.
4. Klik **Check-in** pada peserta yang datang:
   - Status berubah **Hadir**, jam WIB tercatat.
   - **Sesi paketnya otomatis berkurang 1** (drop-in tidak memengaruhi paket).
   - Notifikasi hijau muncul di pojok layar (bawah di HP, kanan-atas di desktop) dan hilang sendiri.
5. Klik dua kali? **Aman** — aplikasi menolak dengan pesan "Sudah check-in sebelumnya." Sesi tetap hanya berkurang satu.

#### B. Peserta tidak datang (No-show)
1. Klik **No-show** pada pesertanya (dengan konfirmasi). Status berubah **No-show** — sesi **belum** terpotong.
2. Bila kebijakan studio memotong sesi no-show: klik **"Potong sesi no-show"** → konfirmasi → 1 sesi dikurangi. Tanda "(sesi dipotong)" muncul di baris itu. **Tombol hilang setelahnya** — tidak bisa dipotong dua kali.
3. Bila admin memaafkan: tidak perlu apa-apa. Sesi tetap utuh.

#### C. Salah check-in (batal check-in)
1. Klik **"Batal check-in"** pada peserta berstatus Hadir → dialog konfirmasi.
2. Hasil: status kembali **Terkonfirmasi**, **1 sesi dikembalikan** ke paketnya, dan kejadian tercatat di audit log. Tidak ada yang hilang.

#### D. Membatalkan booking
Tombol **"Batalkan booking"** untuk peserta yang Terkonfirmasi/Waitlist. Sesi tidak terpotong (memang belum check-in). Untuk peserta Hadir/No-show, tombol ini tidak tersedia — lakukan "Batal check-in" dulu bila perlu.

#### E. Waitlist di halaman ini
Ditampilkan di bawah tabel peserta (read-only). Promosi waitlist dilakukan dari **Jadwal & Booking → Detail kelas**.

---

### 6.5 Paket

**Fungsi:** dua bagian — master paket (produk) dan pembelian paket oleh member.

#### A. Master Paket
- Tampil sebagai kartu: nama, jumlah sesi, masa aktif (hari), harga.
- **+ Tambah Paket** / **Edit**: nama wajib, sesi ≥ 1, harga ≥ 0, masa aktif ≥ 1 hari. Hapus centang "Paket dijual" untuk menonaktifkan (tidak hilang dari riwayat).
- **Hapus** hanya bisa untuk master paket yang belum pernah dibeli member (koreksi salah input). Yang sudah dibeli → nonaktifkan saja.
- Paket awal bawaan: **Drop-in** (1 sesi, 150rb, 7 hari), **Paket 10 Sesi** (10, 1,35jt, 35 hari), **Paket 15 Sesi** (15, 1,95jt, 49 hari).

#### B. Belikan paket untuk member
1. Klik **"+ Beli Paket"**.
2. Pilih **Member** dan **Paket**. Harga aktual otomatis terisi dari master (boleh diubah, mis. untuk diskon).
3. Isi tanggal beli & tanggal mulai (boleh berbeda — mis. dibeli hari ini, mulai besok).
4. Pilih metode (Transfer/QRIS/Cash/Lainnya) dan status:
   - **Lunas** → paket langsung bisa dipakai.
   - **Menunggu pembayaran** → paket tercatat tapi **belum bisa dipakai** sampai ditandai Lunas.
5. Simpan. Aplikasi otomatis:
   - Menghitung **tanggal kadaluarsa** = tanggal mulai + masa aktif (mis. mulai 8 Sep + 35 hari = 13 Okt).
   - Membuat **transaksi pembayaran** bernomor `SWJ-…` di halaman Pembayaran.

#### C. Sesuaikan paket (koreksi manual)
Tombol **Sesuaikan** pada baris paket member — untuk kasus khusus: mengubah sisa sesi (mis. hadiah 1 sesi, kompensasi) atau menggeser tanggal kadaluarsa (mis. member sakit). Setiap penyesuaian tercatat di audit log (nilai sebelum → sesudah). Gunakan seperlunya; check-in/pembatalan tetap cara normal mengubah angka.

Tombol **Hapus** pada baris paket member — untuk pembelian yang salah input. Hanya bisa bila paket **belum dipakai booking**; transaksi pembayaran yang dibuat bersamaan ikut terhapus agar buku kas konsisten.

#### D. Tandai Lunas dari sini
Baris dengan status "Menunggu pembayaran" memiliki tombol **Tandai Lunas** — efeknya sama dengan di halaman Pembayaran.

---

### 6.6 Pembayaran

**Fungsi:** buku kas studio. Semua uang masuk tercatat di sini.

#### A. Membaca tabel
| Kolom | Arti |
|---|---|
| Nomor | `SWJ-YYYYMMDD-XXX` unik per transaksi |
| Tanggal | Tanggal transaksi (bisa dipilih saat input manual) |
| Member & Item | Siapa, beli apa |
| Nominal | Selalu format `Rp1.350.000` tanpa desimal |
| Metode | Transfer / QRIS / Cash / Lainnya |
| Status | Lunas (hijau) / Menunggu pembayaran (kuning) / Dibatalkan / Refund |

Di bawah filter tampil **total lunas hasil filter** — angka untuk rekonsiliasi harian.

#### B. Memfilter
Isi kombinasi: dari–sampai tanggal, member, metode, status. Hasil langsung terfilter. Klik **Export CSV** → file `pembayaran-<hari ini>.csv` terunduh **sesuai filter yang sedang aktif** — siap dibuka di Excel.

#### C. Mencatat pembayaran manual
Dipakai untuk pembayaran yang tidak lewat booking paket (mis. member transfer langsung, pembayaran kompensasi).
1. Klik **"+ Catat Pembayaran"**.
2. Pilih member, tulis item (cth. "Paket 10 Sesi" / "Sewa studio"), nominal (angka, tanpa titik), tanggal, metode, status, dan catatan/referensi transfer (mis. "BCA a/n Bella").
3. Simpan — nomor transaksi dibuat otomatis.

#### D. Tandai Lunas + pengingat WA
- **Tandai Lunas** (dengan dialog konfirmasi) mengubah status menjadi Lunas **dan** mengaktifkan paket terkait — member langsung bisa booking.
- **Pengingat WA** membuka WhatsApp dengan pesan nominal & item sudah terisi. Tinggal kirim.

#### E. Menghapus transaksi yang salah
Tombol **Hapus** (merah) di tiap baris menghapus permanen dengan konfirmasi dan tercatat di audit log. Transaksi yang **terkait pembelian paket** ditolak di sini — hapus lewat Paket → Paket Member supaya paket dan transaksinya hilang bersamaan.

---

### 6.7 Laporan

**Fungsi:** melihat performa studio dalam periode tertentu.

1. Pilih **rentang tanggal** (atau tombol cepat: Hari ini / 7 hari / 30 hari).
2. Baca ringkasannya:

| Bagian | Cara membacanya |
|---|---|
| Pendapatan total | Hanya transaksi **Lunas** dalam periode. Yang menunggu tidak dihitung. |
| Transaksi lunas | Banyaknya transaksi berstatus Lunas. |
| Booking / kehadiran | Booking = semua booking non-waitlist; kehadiran = yang statusnya Hadir. |
| Tingkat kehadiran | Hadir ÷ (booking − yang batal). Angka 80–90% sehat; turun terus → bahas kebijakan no-show. |
| Kelas Terpopuler | Bar chart berdasarkan jumlah booking. Dipakai untuk menentukan kelas & jam yang ditambah. |
| Kinerja Instruktur | Jumlah kelas yang dipegang + total kehadiran pesertanya. |
| Paket Terjual | Banyaknya pembelian per jenis paket dalam periode. |
| Member | Kiri: member aktif (pernah Hadir dalam 30 hari terakhir). Kanan: **member aktif tapi tidak hadir > 30 hari** beserta daftar namanya — hubungi mereka sebelum benar-benar hilang. |

---

### 6.8 Pengaturan

**Fungsi:** konfigurasi & pembukuan aksi.

| Panel | Isi & penggunaannya |
|---|---|
| Informasi Studio | Nama studio, zona waktu WIB, mata uang Rupiah, mode aplikasi (Demo/Supabase). Read-only. |
| **Instruktur** | **+ Tambah Instruktur** (nama, WA, status), **Edit**, atau **Hapus** (hanya bila belum pernah dijadwalkan; kalau sudah, nonaktifkan). Instruktur nonaktif otomatis hilang dari pilihan saat membuat kelas baru (kelas lamanya tidak terganggu). Kartu menampilkan jumlah kelas mendatang & tombol Chat WA. |
| Audit Log Terbaru | 15 aksi terakhir: check-in, pengembalian sesi, perubahan pembayaran, salin jadwal, dst. — waktu WIB + pelakunya. Gunakan saat lupa "kemarin siapa yang dibatalkan?". |
| Mode Demo | Tombol **Reset Data Demo**: mengembalikan semua data ke contoh awal. Dipakai saat latihan kacau atau setelah demo ke calon klien. |

---

## 7. Pesan Error dan Artinya

Aplikasi sengaja bicara dengan jelas. Tabel ini untuk memastikan tidak salah paham:

| Pesan yang muncul | Artinya | Yang harus dilakukan |
|---|---|---|
| "Member sudah terdaftar di kelas ini." | Booking duplikat | Cek daftar peserta — namanya sudah ada di situ |
| "Paket tidak dapat dipakai (harus Lunas, belum kadaluarsa, dan masih punya sisa sesi)." | Paket terpilih tidak memenuhi syarat | Tandai Lunas dulu, atau pilih paket lain, atau pakai drop-in |
| "Kelas sudah penuh. Tandai opsi waitlist…" | Kuota habis | Centang waitlist saat booking, atau tawarkan kelas lain |
| "Sudah check-in sebelumnya." | Tombol Check-in diklik dua kali | Tidak perlu apa-apa — sesi aman, hanya terpotong sekali |
| "Paket sudah kadaluarsa, tidak bisa dipakai check-in." | Paket lewat masa aktif | Bantu member beli/panjatkan paket baru |
| "Sisa sesi paket sudah habis." | Sesi 0 | Belikan paket baru atau drop-in |
| "Booking tidak berstatus Terkonfirmasi." | Aksi di booking yang sudah Hadir/Batal/No-show | Cek statusnya dulu; bila Hadir, gunakan "Batal check-in" |
| "Booking drop-in tidak punya paket yang bisa dipotong." | Potong sesi pada booking drop-in | Tidak ada sesi yang bisa dipotong — kebijakan drop-in no-show tentukan manual |
| "Sesi no-show sudah pernah dipotong." | Tombol dipakai dua kali | Sudah diproses sebelumnya — selesai |
| "Kelas masih penuh, tidak bisa promosi dari waitlist." | Promosi waitlist sebelum ada yang batal | Batalkan/kosongkan satu kursi dulu |
| "Masih ada peserta terdaftar. Batalkan booking mereka dulu." | Hapus kelas yang masih ada pesertanya | Batalkan booking peserta, baru hapus kelas |
| "Member sudah punya riwayat … Gunakan status Nonaktif" | Hapus member yang pernah booking/beli/bayar | Edit → hilangkan centang Aktif |
| "Paket ini sudah dipakai booking …" | Hapus paket member yang sudah dipakai | Batalkan booking terkait, atau gunakan Sesuaikan |
| "Transaksi ini terkait pembelian paket …" | Hapus transaksi hasil beli paket dari halaman Pembayaran | Hapus lewat Paket → Paket Member |
| "Nomor WhatsApp tidak valid (9–15 digit)." | Format nomor salah saat input | Tulis 08xxxxxxxxxx tanpa spasi/simbol |

---

## 8. FAQ

**Q: Saya refresh halaman dan data saya hilang.**
A: Disengaja di Mode Demo: refresh (F5) atau tab baru mengembalikan data contoh agar tiap tester mulai bersih. Berpindah halaman biasa (klik menu, back/forward, ketik alamat /booking) **tidak** menghilangkan data. Saat Supabase diaktifkan, data akan permanen.

**Q: Saya refresh di halaman Member dan muncul halaman yang sama, apakah itu error?**
A: Bukan — refresh di halaman mana pun sekarang aman (sudah diperbaiki). Bila pernah melihat 404 NOT_FOUND di versi lama, cukup buka ulang alamat utama.

**Q: Bedanya "Batalkan" dan "No-show"?**
A: **Batalkan** = member menyampaikan sebelum kelas → sesi aman. **No-show** = terdaftar tapi tak datang tanpa kabar → admin yang memutuskan memotong sesi atau tidak.

**Q: Kenapa sesi member berkurang padahal saya tidak melakukan apa-apa?**
A: Cek audit log di Pengaturan — setiap pengurangan sesi tercatat (biasanya check-in di kelas lain hari itu, atau potongan no-show).

**Q: Member punya 2 paket aktif, paket mana yang terpotong saat check-in?**
A: **Paket yang dipilih saat booking** — tersimpan di booking itu. Karena itu saat membooking, pilih dengan sadar (disarankan yang lebih cepat kadaluarsa).

**Q: Apakah membatalkan booking setelah check-in bisa memotong sesi?**
A: Tidak. Pembatalan booking hanya untuk yang belum Hadir. Yang sudah Hadir jalurnya "Batal check-in" yang justru **mengembalikan** sesi.

**Q: Bisa kirim broadcast WhatsApp ke semua member?**
A: Belum. Aplikasi hanya membuka `wa.me` per member dengan pesan siap kirim (sesuai batasan MVP — tanpa WhatsApp API).

**Q: Laporan pendapatanku beda dengan rekening koran?**
A: Laporan hanya menghitung transaksi **Lunas**. Cek transaksi "Menunggu pembayaran" yang lupa ditandai Lunas, atau transaksi Refund/Dibatalkan.

---

## 9. Panduan Customer — Halaman Booking Mandiri

Halaman terpisah untuk **member** book kelas tanpa bantuan admin. **Tidak perlu login/kata sandi** — identitas lewat nomor WhatsApp yang terdaftar.

> Bagikan alamat ini ke member: **https://sawiji-demo.vercel.app/booking**

### 9.1 Cara masuk (untuk member)

1. Buka alamat `/booking` di browser (bisa dari HP).
2. Ketik **nomor WhatsApp yang terdaftar** di studio (format `08…`).
3. Tap **Masuk**. Bila cocok, langsung masuk tanpa kata sandi.
4. Nomor tidak dikenal? Muncul pesan untuk memastikan nomor benar atau menghubungi admin (ada tombol WA-nya).

> **Catatan keamanan:** halaman ini hanya menampilkan data member itu sendiri (jadwalnya, paketnya) dan daftar kelas (nama, jam, sisa kursi). Data member lain tidak pernah tampil. Siapa pun yang mengetahui nomor Anda bisa melihat jadwal Anda — karena itu halaman ini sengaja tidak menampilkan data sensitif (harga, kontak, riwayat pembayaran).

### 9.2 Tab "Kelas Tersedia"

- Daftar semua kelas mendatang, dikelompokkan per tanggal.
- Tiap kelas menampilkan: jam, nama, instruktur, ruang, dan **sisa kursi** (atau "PENUH — bisa masuk waitlist").
- Kelas yang sudah Anda booking ditandai badge **"Sudah dibooking"** (tidak bisa double-book — sesuai aturan studio).
- **Cara booking:**
  1. Tap **Book** pada kelas pilihan.
  2. Bila punya **1 paket aktif** → paket terpilih otomatis, tinggal tap **Booking Sekarang**.
  3. Bila punya **≥ 2 paket aktif** → pilih paket yang ingin dipakai (tertera sisa sesi & kadaluarsa masing-masing). Paket yang dipilih inilah yang akan terpotong saat check-in.
  4. Bila **belum punya paket aktif** → tombol booking terkunci, muncul panduan menghubungi admin (beli paket / drop-in Rp150.000).
  5. Bila kelas **penuh** → centang **"Daftarkan saya ke daftar tunggu"** lalu **Masuk Waitlist**.
- **Peringatan bentrok**: bila Anda punya booking lain di jam yang sama, muncul peringatan kuning — booking tetap bisa dilanjutkan, tapi pikirkan dulu.

### 9.3 Tab "Jadwal Saya"

- Daftar semua booking mendatang milik Anda: kelas, tanggal, jam, instruktur, dan status (Terkonfirmasi / Waitlist).
- Yang berstatus **Waitlist** belum dapat kursi — admin akan menghubungi bila ada yang batal.
- **Membatalkan sendiri:** tap **Batal** → konfirmasi. Kursi langsung dikosongkan dan **sesi paket Anda TIDAK terpotong** (sesuai kebijakan studio: batal sebelum check-in selalu gratis). Admin langsung melihat pembatalan ini.

### 9.4 Tab "Paket Saya"

- Semua paket Anda: nama, **sisa/total sesi** (angka besar), tanggal kadaluarsa.
- Paket **menunggu pembayaran** diberi tanda kuning — belum bisa dipakai booking sampai admin menandainya Lunas.
- Paket lewat kadaluarsa ditandai merah — perlu beli paket baru.
- Sesi **berkurang otomatis saat Anda check-in di studio**, bukan saat booking.

### 9.5 Yang perlu customer pahami

1. **Book ≠ potong sesi.** Sesi baru berkurang ketika check-in di studio.
2. **Batal sendiri selalu aman** — sesi kembali/utuh, selama belum check-in.
3. **Waitlist bukan booking.** Belum dapat kursi sampai dipromosikan admin.
4. **Paket harus Lunas, belum kadaluarsa, dan bersisa** untuk bisa book. Ketiganya dicek otomatis.
5. **Satu kelas satu kali per member.** Aplikasi mencegah double-booking di kelas yang sama.
6. Sudah book tapi ternyata berhalangan? **Batalkan lewat tab Jadwal Saya** supaya kursinya bisa dipakai member lain — atau chat admin.

### 9.6 Untuk admin: kaitannya dengan pekerjaan Anda

- Booking/batal dari customer memakai **aturan bisnis yang sama** dengan booking manual — kuota, duplikat, paket, waitlist, dan bentrok tetap divalidasi otomatis.
- Setiap booking mandiri **langsung tampil** di Dashboard, Jadwal, dan Check-in admin. Tidak ada sinkronisasi yang perlu dilakukan.
- Pembatalan oleh customer muncul sebagai booking berstatus Batal — riwayatnya tetap terbaca di detail member.
- Customer **tidak bisa** mengubah data apa pun selain booking/batal miliknya sendiri (paket, member, pembayaran tidak tersentuh).

---

