# Sawiji Studio Admin

Aplikasi web admin untuk **Sawiji Studio Pilates**: kelola member, paket, jadwal kelas, booking, check-in, pembayaran manual, dan laporan operasional.

> 📖 **Untuk pemakaian sehari-hari (owner/admin/resepsionis), baca [PANDUAN-PENGGUNA.md](PANDUAN-PENGGUNA.md)** — flow harian, manual per halaman, glosarium, dan daftar pesan error.
> 📄 **Versi PDF** (cover + daftar isi + flow + isi): [`MANUAL-SAWIJI-STUDIO.pdf`](MANUAL-SAWIJI-STUDIO.pdf) — juga tersedia online di `/MANUAL-SAWIJI-STUDIO.pdf`. Regenerasi setelah mengubah manual: `node scripts/build-manual.mjs`

## Dokumen Bisnis (untuk penjualan)

Tersedia di folder [`bisnis/`](bisnis) sebagai Markdown **dan PDF** siap kirim:

| Dokumen | Isi | PDF |
|---|---|---|
| Penawaran | Surat penawaran resmi: ruang lingkup, harga, termin, S&K, tanda tangan | `bisnis/1-PENAWARAN.pdf` |
| Katalog Harga | Price sheet: perbandingan paket, modul, add-on, FAQ | `bisnis/2-KATALOG-HARGA.pdf` |
| Studi Kasus ROI | Perhitungan manfaat, payback, sensitivitas, lembar hitung sendiri | `bisnis/3-STUDI-KASUS-ROI.pdf` |

Regenerasi PDF setelah mengubah markdown: `npm run bisnis`

Dibangun dengan **React + Vite + TypeScript + Tailwind CSS**, dengan **Supabase** untuk autentikasi & database (opsional — aplikasi tetap bisa dijalankan dalam **Mode Demo** tanpa Supabase).

## Menjalankan Proyek

```bash
npm install
npm run dev        # buka http://localhost:5173
npm run build      # typecheck + build produksi
npm run preview
```

## Alur Branch (Pengembangan vs Produksi)

| Branch | Peran | Hasil deploy otomatis |
|---|---|---|
| `main` | Pengembangan — fitur & perbaikan, bebas bereksperimen | **Preview** (URL preview, tidak menyentuh live) |
| `production` | Versi live — hanya menerima perubahan yang sudah stabil | **Production** → https://sawiji-demo.vercel.app |

**Kerja harian:** commit & push ke `main`. **Rilis:** gabungkan `main` → `production`.

```bash
git checkout main
git push origin main          # perubahan harian → preview otomatis

# rilis ke produksi
git checkout production
git merge main
git push origin production    # → live otomatis
```

Konfigurasi Vercel yang sudah aktif: repo terhubung, **Production Branch = `production`**.
Ada juga Deploy Hook untuk branch `production` (memungkinkan memicu rilis tanpa push, mis. dari otomatisasi).

## Mode Demo

Jika `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` tidak diisi, aplikasi berjalan di **Mode Demo**:

- Data contoh realistis (8 member, 3 instruktur, 3 paket, jadwal 7 hari, booking & pembayaran bervariasi) dimuat dari `src/data/db.ts`.
- Semua tombol berfungsi: tambah/edit member & paket, booking (termasuk waitlist & drop-in), check-in, tandai lunas, laporan.
- Data disimpan di memori browser — muat ulang halaman untuk kembali ke data awal, atau gunakan tombol **Reset Data Demo** di halaman Pengaturan.

## Mengaktifkan Supabase

1. Buat project di [supabase.com](https://supabase.com).
2. Buka **SQL Editor**, jalankan seluruh isi `supabase/migration.sql` (membuat 9 tabel, RLS, trigger, dan seed master paket awal).
3. Salin `.env.example` menjadi `.env`, isi:

   ```
   VITE_SUPABASE_URL=https://<project>.supabase.co
   VITE_SUPABASE_ANON_KEY=<anon key>
   ```

4. Buat user di **Authentication → Users**, lalu set `role = 'owner'` pada barisnya di tabel `profiles` bila perlu.
5. Restart `npm run dev`. Badge "Mode Demo" di header akan hilang saat kredensial terdeteksi.

### Integrasi kode

- Konfigurasi Supabase dideteksi di `src/lib/mode.ts` (`supabaseConfigured`).
- Seluruh akses data terpusat di `src/data/db.ts` (satu repository) — fungsi di sana (`createBooking`, `checkinBooking`, `beliPaket`, dst.) adalah titik sambung ketika adapter Supabase diaktifkan, sehingga halaman tidak perlu diubah.
- Aturan bisnis penting yang sudah terimplementasi: check-in idempotent (sesi berkurang tepat satu kali), pembatalan check-in mengembalikan sesi + tercatat di audit log, paket kedaluwarsa/belum lunas tidak bisa dipakai, booking duplikat ditolak, waitlist saat penuh, potong sesi no-show manual, nomor transaksi `SWJ-YYYYMMDD-###`, zona waktu `Asia/Jakarta`.

## Struktur

```
src/
  components/   Layout (sidebar+header), komponen UI dasar (Button, Card, Modal, dsb.)
  data/
    db.ts       Store reaktif + seluruh logika bisnis (satu repository)
    demo.ts     Data contoh mode demo (fixture, terpisah dari logika)
  lib/
    config.ts   Identitas studio & template WA (SATU sumber; bisa dioverride via .env)
    format.ts   Format Rupiah, tanggal/jam WIB
    mode.ts     Deteksi mode demo vs Supabase
  pages/        Dashboard, Member(+Detail), Jadwal, Checkin, Paket, Pembayaran,
                Laporan, Pengaturan, CustomerBooking (halaman publik /booking)
scripts/
  build-manual.mjs  Generator PDF manual (npm run manual)
supabase/
  migration.sql Skema + RLS + seed untuk Supabase
```

## White-label untuk Klien Baru

Identitas studio **tidak di-hardcode** — semua mengalir dari `src/lib/config.ts`, yang membaca env:

1. Salin `.env.example` → `.env`, isi `VITE_STUDIO_NAMA`, `VITE_STUDIO_NAMA_LENGKAP`, `VITE_STUDIO_KOTA`, `VITE_STUDIO_WA_ADMIN`.
2. Ganti data demo di `src/data/demo.ts` bila ingin preview dengan data klien.
3. Deploy. Nama studio, footer, dan seluruh template pesan WhatsApp ikut berubah otomatis.

## Halaman Booking Customer (`/booking`)

Route publik **`/booking`** untuk member book kelas tanpa login:

- Masuk dengan **nomor WhatsApp terdaftar** (dicocokkan ke tabel member; tanpa kata sandi).
- **Kelas Tersedia** — kelas mendatang + sisa kursi; booking dengan paket aktif (validasi Lunas/kadaluarsa/sisa sesi otomatis); kelas penuh → waitlist; belum punya paket → diarahkan ke admin (WA).
- **Jadwal Saya** — booking mendatang + status, bisa batalkan sendiri (sesi tidak terpotong, aturan sama dengan admin).
- **Paket Saya** — sisa sesi & kadaluarsa (read-only).
- Semua aksi memakai fungsi bisnis yang sama di `db.ts` — kuota, duplikat, waitlist, dan validasi paket tetap dijalankan; admin melihat hasilnya langsung di Dashboard/Jadwal/Check-in.
- Batasan Mode Demo: data customer & admin di browser berbeda tidak tersinkron (in-memory per browser). Saat Supabase aktif, keduanya memakai satu database.

## Di Luar Cakupan MVP

Payment gateway otomatis, WhatsApp API/broadcast, QR check-in, multi-cabang. Struktur (kolom `studio_id`, repository tunggal) disiapkan agar mudah ditambahkan kemudian.
