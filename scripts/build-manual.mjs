// Generate HTML siap-cetak untuk manual PDF (cover, daftar isi, flow, isi)
// Jalankan: node scripts/build-manual.mjs  ->  dist/manual.html + public/MANUAL-SAWIJI-STUDIO.pdf
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { marked } from 'marked'

const md = readFileSync('PANDUAN-PENGGUNA.md', 'utf8')
// buang judul + intro + Daftar Isi versi md (sudah digantikan halaman TOC khusus)
const start = md.indexOf('## 1. Pengenalan')
if (start < 0) throw new Error('Bagian 1 tidak ditemukan di PANDUAN-PENGGUNA.md')
const body = marked.parse(md.slice(start))

const css = `
  @page { size: A4; margin: 18mm 16mm; }
  * { box-sizing: border-box; }
  body { font-family: "Segoe UI", Arial, sans-serif; color: #2c1a1e; font-size: 10.5pt; line-height: 1.55; margin: 0; }
  h1, h2, h3, h4 { font-family: Georgia, serif; color: #4a0012; line-height: 1.25; }
  h1 { font-size: 17pt; border-bottom: 2px solid #941b36; padding-bottom: 6px; margin: 28px 0 12px; }
  h2 { font-size: 14pt; margin: 22px 0 8px; }
  h3 { font-size: 11.5pt; margin: 18px 0 6px; color: #7b0a24; }
  h4 { font-size: 10.5pt; margin: 14px 0 4px; }
  p { margin: 6px 0; }
  a { color: #941b36; text-decoration: none; }
  table { border-collapse: collapse; width: 100%; margin: 8px 0; font-size: 9.5pt; }
  th { background: #f9eee6; text-align: left; }
  th, td { border: 1px solid #eedcd1; padding: 5px 8px; vertical-align: top; }
  code { background: #f9eee6; border-radius: 4px; padding: 1px 5px; font-size: 9pt; font-family: Consolas, monospace; }
  pre { background: #fff9f4; border: 1px solid #eedcd1; border-radius: 8px; padding: 10px 12px; font-size: 8.5pt; overflow-x: hidden; white-space: pre-wrap; }
  blockquote { margin: 10px 0; padding: 8px 14px; background: #f5d8c5; border-left: 4px solid #941b36; border-radius: 0 8px 8px 0; }
  blockquote p { margin: 2px 0; }
  ul, ol { margin: 6px 0; padding-left: 22px; }
  li { margin: 3px 0; }
  hr { border: 0; border-top: 1px solid #eedcd1; margin: 20px 0; }

  .cover { page-break-after: always; text-align: center; padding-top: 70mm; }
  .cover .studio { font-size: 12pt; letter-spacing: 6px; color: #941b36; text-transform: uppercase; }
  .cover h1 { font-size: 30pt; border: 0; margin: 12px 0 4px; }
  .cover .sub { font-size: 13pt; color: #7d6269; margin-bottom: 40mm; }
  .cover .meta { font-size: 10pt; color: #7d6269; }
  .cover .garis { width: 60mm; height: 2px; background: #941b36; margin: 10mm auto; }

  .toc { page-break-after: always; }
  .toc h1 { margin-top: 0; }
  .toc table td:first-child { width: 82%; }
  .toc td { border: 0; border-bottom: 1px dotted #eedcd1; padding: 6px 4px; }

  .flow { }
  .flowbox { border: 1px solid #eedcd1; border-radius: 10px; padding: 4px 14px; margin: 8px 0; background: #fff9f4; }
  .flowbox pre { border: 0; background: transparent; margin: 6px 0; padding: 0; }
  .badge { display: inline-block; background: #4a0012; color: #fff9f4; border-radius: 999px; padding: 2px 12px; font-size: 9pt; font-weight: 600; letter-spacing: 1px; }
  .badge.rose { background: #941b36; }

  h2 { page-break-before: always; margin-top: 4px; }
  .pagenote { color: #7d6269; font-size: 8.5pt; text-align: center; margin-top: 26mm; }
`

const html = `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<title>Manual Book — Sawiji Studio Admin</title>
<style>${css}</style>
</head>
<body>

<!-- ============ HALAMAN 1: COVER ============ -->
<div class="cover">
  <div class="studio">Sawiji Studio</div>
  <h1>Manual Book</h1>
  <div class="sub">Sawiji Studio Admin<br>Panduan Lengkap Penggunaan Aplikasi</div>
  <div class="garis"></div>
  <div class="meta">
    Untuk Admin, Resepsionis, Owner &amp; Customer<br>
    Aplikasi: sawiji-demo.vercel.app<br>
    Versi 1.0 — September 2026
  </div>
</div>

<!-- ============ HALAMAN 2: DAFTAR ISI ============ -->
<div class="toc">
  <h1>Daftar Isi</h1>
  <table>
    <tr><td><b>Bagian 1 — Untuk ADMIN</b> (Dashboard, Member, Jadwal, Check-in, Paket, Pembayaran, Laporan, Pengaturan)</td><td><b>Hal. 3</b></td></tr>
    <tr><td>Flow Penggunaan Harian Admin (alur kerja pagi → sore)</td><td>3</td></tr>
    <tr><td>10 Aturan Emas &amp; Glosarium</td><td>4</td></tr>
    <tr><td>Manual Per Halaman (8 halaman admin)</td><td>5</td></tr>
    <tr><td>Pesan Error &amp; FAQ Admin</td><td>9</td></tr>
    <tr><td><b>Bagian 2 — Untuk CUSTOMER</b> (Booking Mandiri tanpa login)</td><td><b>11</b></td></tr>
    <tr><td>Flow Booking Customer (masuk → book → check-in)</td><td>11</td></tr>
    <tr><td>Cara Masuk, Kelas Tersedia, Jadwal Saya, Paket Saya</td><td>12</td></tr>
    <tr><td>Yang Perlu Customer Pahami (6 poin)</td><td>13</td></tr>
  </table>
</div>

<!-- ============ HALAMAN 3: FLOW PENGGUNAAN ============ -->
<div class="flow">
  <h1>Flow Penggunaan Aplikasi</h1>

  <span class="badge">BAGIAN 1 · ADMIN</span>
  <div class="flowbox"><pre>  PAGI — Persiapan
  1. Buka Dashboard  →  cek "Kelas Hari Ini" + "Perlu Ditindaklanjuti"
     (ulang tahun member, paket mau habis, tagihan belum lunas, waitlist)
  2. Kirim pengingat via tombol WhatsApp yang tersedia

  SEBELUM KELAS — Booking walk-in / via chat
  3. Jadwal &amp; Booking  →  pilih hari  →  Detail kelas
     →  "+ Booking Peserta"  →  pilih member
     →  pilih paket (Lunas + belum kadaluarsa + bersisa)  atau  drop-in
     →  kelas penuh? daftarkan ke waitlist

  SAAT KELAS — Check-in
  4. Check-in  →  pilih kelas  →  klik "Check-in" per peserta yang datang
     (sesi paket terpotong otomatis — hanya sekali, aman dari klik ganda)
  5. Peserta tak datang  →  "No-show"  →  (opsional) "Potong sesi no-show"
  6. Salah check-in?  →  "Batal check-in"  →  sesi otomatis dikembalikan

  SETELAH KELAS — Keuangan &amp; jadwal
  7. Pembayaran  →  catat transaksi manual / "Tandai Lunas" / Export CSV
  8. Jadwal  →  "Salin ke minggu depan"  →  sesuaikan
  9. Laporan  →  pantau pendapatan &amp; tingkat kehadiran mingguan</pre></div>

  <span class="badge rose">BAGIAN 2 · CUSTOMER</span>
  <div class="flowbox"><pre>  1. Buka  /booking  di browser (tanpa login)
  2. Masukkan nomor WhatsApp terdaftar  →  Masuk
  3. Tab "Kelas Tersedia"  →  pilih kelas  →  Book
     →  paket aktif otomatis dipakai (1 paket) / pilih paket (≥ 2 paket)
     →  belum punya paket?  hubungi admin via WA (tombol tersedia)
     →  kelas penuh?  masuk waitlist
  4. Tab "Jadwal Saya"  →  lihat status booking
     →  berhalangan?  "Batal" sendiri  →  sesi TIDAK terpotong
  5. Datang ke studio  →  admin lakukan check-in  →  barulah sesi berkurang
  6. Tab "Paket Saya"  →  pantau sisa sesi &amp; tanggal kadaluarsa</pre></div>

  <p class="pagenote">Detail langkah setiap flow ada di manual di halaman-halaman berikutnya.</p>
</div>

<!-- ============ ISI MANUAL (dari PANDUAN-PENGGUNA.md) ============ -->
${body}

</body>
</html>`

mkdirSync('dist', { recursive: true })
writeFileSync('dist/manual.html', html)
console.log('OK -> dist/manual.html')

// Cetak ke PDF lewat Edge headless, lalu taruh di public/ agar ikut ter-deploy
const candidates = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
]
const edgePath = candidates.find((c) => existsSync(c))
if (!edgePath) {
  console.log('Edge tidak ditemukan — PDF tidak dicetak. HTML ada di dist/manual.html')
  process.exit(0)
}
const url = `file:///${process.cwd().replaceAll('\\', '/')}/dist/manual.html`
execFileSync(edgePath, ['--headless', '--disable-gpu', '--no-pdf-header-footer', `--print-to-pdf=${process.cwd()}\\public\\MANUAL-SAWIJI-STUDIO.pdf`, url])
copyFileSync('public/MANUAL-SAWIJI-STUDIO.pdf', 'MANUAL-SAWIJI-STUDIO.pdf')
console.log('OK -> public/MANUAL-SAWIJI-STUDIO.pdf (+ salinan di root)')
