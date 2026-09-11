// Cetak "Penjelasan Fitur & Flowchart" ke PDF.
// Jalankan: npm run fitur  ->  FITUR-DAN-FLOWCHART.pdf (+ public/)
import { writeFileSync, mkdirSync, copyFileSync, existsSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

const css = `
  @page { size: A4; margin: 18mm 16mm; }
  * { box-sizing: border-box; }
  body { font-family: "Segoe UI", Arial, sans-serif; color: #2c1a1e; font-size: 10.5pt; line-height: 1.55; margin: 0; }
  .cover { height: 260mm; background: #4a0012; color: #fff9f4; border-radius: 14px; padding: 40mm 20mm; text-align: center; page-break-after: always; }
  .cover .brand { font-family: Georgia, serif; font-size: 30pt; font-weight: 700; margin-top: 30mm; }
  .cover .sub { letter-spacing: 5px; color: #f5d8c5; font-size: 11pt; text-transform: uppercase; margin-top: 2mm; }
  .cover h1 { font-family: Georgia, serif; font-size: 26pt; margin: 28mm 0 4mm; }
  .cover .desc { color: #f5d8c5; font-size: 11pt; }
  .cover .meta { margin-top: 26mm; font-size: 10pt; color: #f5d8c5; }
  .toc { page-break-after: always; }
  h1 { font-family: Georgia, serif; font-size: 18pt; color: #4a0012; margin: 0 0 12px; }
  h2 { font-family: Georgia, serif; font-size: 14.5pt; color: #4a0012; margin: 0 0 6px; border-bottom: 2px solid #941b36; padding-bottom: 4px; }
  h3 { font-size: 11pt; color: #7b0a24; margin: 14px 0 4px; }
  section.hal { page-break-before: always; }
  p { margin: 5px 0; }
  .lbl { font-size: 8.5pt; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #941b36; margin: 10px 0 4px; }
  ol, ul { margin: 4px 0; padding-left: 20px; }
  li { margin: 2px 0; }
  table { border-collapse: collapse; width: 100%; font-size: 9.5pt; }
  th { background: #4a0012; color: #fff9f4; text-align: left; }
  th, td { border: 1px solid #eedcd1; padding: 5px 9px; vertical-align: top; }
  tr:nth-child(even) td { background: #fff9f4; }
  .catatan { background: #f5d8c5; border-left: 4px solid #941b36; border-radius: 0 8px 8px 0; padding: 7px 12px; font-size: 9.5pt; margin: 10px 0; }

  /* flowchart */
  .fc { display: flex; flex-direction: column; align-items: center; margin: 6px 0 2px; }
  .node { border: 1.5px solid #610018; border-radius: 10px; padding: 5px 14px; background: #fff; font-size: 9pt; text-align: center; max-width: 96mm; line-height: 1.35; }
  .node.mulai { background: #4a0012; color: #fff9f4; border-color: #4a0012; font-weight: 700; border-radius: 999px; }
  .node.putusan { background: #f5d8c5; border-color: #941b36; font-weight: 600; }
  .node.baik { border-color: #15803d; background: #f0fdf4; }
  .node.gagal { border-color: #b91c1c; background: #fef2f2; }
  .arr { color: #941b36; font-size: 11pt; line-height: 1.2; margin: 1px 0; font-weight: 700; }
  .branch { display: flex; gap: 12px; width: 100%; justify-content: center; align-items: stretch; margin: 2px 0; }
  .col { flex: 1; display: flex; flex-direction: column; align-items: center; }
  .cap { font-size: 8pt; font-weight: 700; color: #7d6269; text-transform: uppercase; letter-spacing: 1px; margin: 1px 0; }
  .arr-l { width: 100%; display: flex; justify-content: space-around; color: #941b36; font-weight: 700; font-size: 11pt; line-height: 1.2; }
`

const arr = '<div class="arr">▼</div>'
const node = (teks, cls = '') => `<div class="node ${cls}">${teks}</div>`
const putusan = (t) => node(t, 'putusan')
const mulai = (t) => node(t, 'mulai')
const cabang = (kiri, kanan) => `<div class="branch"><div class="col"><div class="cap">${kiri[0]}</div>${kiri.slice(1).join('')}</div><div class="col"><div class="cap">${kanan[0]}</div>${kanan.slice(1).join('')}</div></div>`
const arrDua = '<div class="arr-l"><span>◀</span><span>▶</span></div>'

const fitur = [
  {
    no: 1, judul: 'Dashboard',
    fungsi: 'Pusat informasi harian: kondisi studio dalam satu layar — tanpa perlu membuka halaman lain.',
    langkah: [
      'Buka aplikasi → Dashboard tampil otomatis.',
      'Baca 4 kartu: booking hari ini, sudah check-in, kelas berjalan/berikutnya, pendapatan bulan ini.',
      'Lihat daftar <b>Kelas Hari Ini</b> (jam, instruktur, terisi/kuota) — tombol Detail langsung ke Check-in.',
      'Tangani daftar <b>Perlu Ditindaklanjuti</b>: ulang tahun member, paket mau habis, tagihan belum lunas, waitlist.',
    ],
    flow: mulai('Buka Dashboard') + arr + node('Sistem merangkum data hari ini (otomatis, zona waktu WIB)') + arr + putusan('Ada item di "Perlu Ditindaklanjuti"?') + arrDua +
      cabang(['Ya', node('Ulang tahun → kirim WA', 'baik'), node('Paket mau habis → WA member', 'baik'), node('Tagihan → Tandai Lunas / WA', 'baik'), node('Waitlist → buka Jadwal', 'baik')], ['Tidak', node('Semua beres ✓', 'baik')]) +
      arr + node('Selesai — kembali bekerja seperti biasa'),
    catatan: '"Pendapatan bulan ini" hanya menghitung transaksi berstatus <b>Lunas</b> — yang belum lunas tidak masuk angka.',
  },
  {
    no: 2, judul: 'Member',
    fungsi: 'Basis data seluruh peserta: identitas, kontak, kondisi khusus, dan seluruh riwayat (booking, paket, pembayaran).',
    langkah: [
      'Menu <b>Member</b> → gunakan kotak pencarian (nama / nomor WA).',
      '<b>+ Tambah Member</b>: isi nama (wajib), nomor WA (wajib, 9–15 digit), data opsional.',
      'Klik nama member → halaman detail: riwayat booking, paket, pembayaran, tombol Chat WhatsApp.',
      'Ubah data lewat <b>Edit</b>; member berhenti cukup dinonaktifkan — riwayat tetap utuh.',
    ],
    flow: mulai('Daftar Member') + arr + putusan('Member sudah ada?') + arrDua +
      cabang(['Ya, cari', node('Ketik nama / nomor WA'), node('Buka detail member')], ['Belum', node('+ Tambah Member'), node('Validasi: nama & WA wajib')]) +
      arr + putusan('Ada kesalahan input?') + arrDua +
      cabang(['Tanpa riwayat', node('Hapus (tersedia di detail)', 'gagal')], ['Sudah ada riwayat', node('Edit / Nonaktifkan saja', 'baik')]),
    catatan: 'Member tidak pernah terhapus bila sudah punya riwayat — sistem menolak otomatis agar laporan & audit log tidak berlubang.',
  },
  {
    no: 3, judul: 'Paket',
    fungsi: 'Master paket (produk) dan pembelian paket oleh member, termasuk sisa sesi & tanggal kedaluwarsa otomatis.',
    langkah: [
      'Menu <b>Paket</b> → bagian Master Paket: tambah/edit produk (Drop-in, Paket 10 Sesi, dst.).',
      '<b>+ Beli Paket</b>: pilih member & paket → tanggal beli/mulai, harga aktual, metode, status bayar.',
      'Tanggal kedaluwarsa dihitung otomatis: tanggal mulai + masa aktif (mis. 35 hari).',
      'Paket "Menunggu pembayaran" belum bisa dipakai — klik <b>Tandai Lunas</b> untuk mengaktifkan.',
    ],
    flow: mulai('Beli Paket') + arr + node('Pilih member + paket + tanggal mulai') + arr + putusan('Status pembayaran?') + arrDua +
      cabang(['Lunas', node('Paket langsung AKTIF', 'baik')], ['Menunggu', node('Belum bisa dipakai', 'gagal'), node('Tandai Lunas nanti → aktif', 'baik')]) +
      arr + node('Transaksi SWJ-… otomatis dibuat  •  kedaluwarsa = mulai + masa aktif'),
    catatan: 'Salah input? Pembelian paket bisa <b>dihapus</b> bila belum dipakai booking — transaksi pasangannya ikut terhapus.',
  },
  {
    no: 4, judul: 'Jadwal & Booking',
    fungsi: 'Kalender mingguan, pembuatan kelas, dan pendaftaran peserta dengan 5 validasi otomatis.',
    langkah: [
      'Kalender: klik hari → list kelas hari itu. <b>+ Buat Kelas</b> untuk jadwal baru; <b>Salin ke minggu depan</b> untuk duplikasi.',
      'Klik <b>Detail</b> pada kelas → lihat peserta & waitlist.',
      '<b>+ Booking Peserta</b>: pilih member → paket dipilih otomatis (bila cuma satu) atau pilih manual.',
      'Kelas penuh → centang waitlist. Sistem memeriksa duplikat, validitas paket, dan bentrok jadwal.',
    ],
    flow: mulai('+ Booking Peserta') + arr + putusan('Sudah terdaftar di kelas ini?') + arrDua +
      cabang(['Ya', node('DITOLAK — duplikat', 'gagal')], ['Tidak', node('Pilih paket yang dipakai')]) +
      arr + putusan('Paket Lunas, belum kadaluarsa, bersisa?') + arrDua +
      cabang(['Tidak', node('DITOLAK / gunakan drop-in', 'gagal')], ['Ya', node('Bentrok jadwal? → peringatan kuning (boleh lanjut)')]) +
      arr + putusan('Kuota penuh?') + arrDua +
      cabang(['Penuh', node('Masuk WAITLIST', 'putusan')], ['Kosong', node('TERKONFIRMASI ✓', 'baik')]),
    catatan: 'Drop-in membuat transaksi Rp150.000 Lunas otomatis. Waitlist bisa dipromosikan ke Terkonfirmasi bila ada kursi kosong.',
  },
  {
    no: 5, judul: 'Check-in',
    fungsi: 'Halaman tercepat resepsionis — menandai kehadiran dan mengelola sesi secara akurat.',
    langkah: [
      'Menu <b>Check-in</b> → pilih kelas hari ini (kartu seragam, 2 kolom di HP).',
      'Peserta datang → klik <b>Check-in</b>: status Hadir, jam WIB tercatat, sesi paket −1 (hanya sekali).',
      'Tidak datang → <b>No-show</b>; bila kebijakan studio memotong sesi → <b>Potong sesi no-show</b> (sekali).',
      'Salah klik → <b>Batal check-in</b>: sesi dikembalikan utuh, tercatat di audit log.',
    ],
    flow: mulai('Kelas dimulai') + arr + putusan('Peserta datang?') + arrDua +
      cabang(['Ya', node('Klik CHECK-IN'), node('Hadir ✓ • sesi −1 (idempotent)', 'baik'), node('Salah klik → Batal check-in → sesi kembali')], ['Tidak', node('Tandai NO-SHOW', 'gagal'), node('Kebijakan potong sesi?'), node('Potong 1 sesi (sekali saja)')]) +
      arr + node('Kelas selesai — data masuk laporan kehadiran'),
    catatan: 'Klik ganda pada Check-in aman: sistem menolak dengan pesan "Sudah check-in sebelumnya."',
  },
  {
    no: 6, judul: 'Pembayaran',
    fungsi: 'Buku kas studio: setiap transaksi bernomor otomatis SWJ-YYYYMMDD-XXX, dengan filter, pengingat WA, dan export CSV.',
    langkah: [
      'Semua pembelian paket & drop-in otomatis tercatat di sini.',
      'Pembayaran di luar sistem (transfer langsung) → <b>+ Catat Pembayaran</b> manual.',
      'Tagihan belum lunas → <b>Tandai Lunas</b> (paket terkait langsung aktif) atau <b>Pengingat WA</b>.',
      'Butuh rekap? <b>Export CSV</b> mengikuti filter aktif — siap dibuka di Excel.',
    ],
    flow: mulai('Transaksi masuk') + arr + node('Belanja paket / drop-in (otomatis)  atau  catat manual') + arr + putusan('Status?') + arrDua +
      cabang(['Lunas', node('Masuk pendapatan laporan', 'baik')], ['Menunggu', node('Pengingat WA ke member'), node('Member bayar → Tandai Lunas', 'baik')]) +
      arr + node('Salah catat? → tombol Hapus (tercatat di audit log)') + arr + node('Export CSV untuk rekonsiliasi'),
    catatan: 'Nomor transaksi tidak akan dobel walau ada transaksi dihapus — penomoran mengikuti urutan terbesar hari itu.',
  },
  {
    no: 7, judul: 'Laporan',
    fungsi: 'Ringkasan bisnis per periode: pendapatan, kehadiran, kelas terlaris, kinerja instruktur, dan member yang mulai pasif.',
    langkah: [
      'Menu <b>Laporan</b> → pilih rentang tanggal (atau preset 7/30 hari).',
      'Baca 4 kartu: pendapatan lunas, transaksi lunas, booking vs kehadiran, tingkat kehadiran.',
      'Grafik batang: kelas terpopuler. Tabel: kinerja instruktur, paket terjual.',
      'Cek daftar member pasif (>30 hari tidak hadir) untuk dihubungi.',
    ],
    flow: mulai('Pilih periode') + arr + node('Sistem menghitung otomatis dari seluruh data') + arrDua +
      cabang(['Keuangan', node('Pendapatan lunas + jumlah transaksi', 'baik')], ['Operasional', node('Kehadiran • kelas populer • instruktur', 'baik')]) +
      arr + putusan('Ada member pasif > 30 hari?') + arrDua +
      cabang(['Ya', node('Hubungi / tawarkan paket baru', 'baik')], ['Tidak', node('Retensi sehat ✓', 'baik')]),
    catatan: 'Tingkat kehadiran = Hadir ÷ (booking − yang dibatalkan). Kenaikan konsisten = sinyal kelas & jam sudah tepat.',
  },
  {
    no: 8, judul: 'Pengaturan',
    fungsi: 'Pengelolaan instruktur, jejak audit seluruh aksi penting, dan kontrol data demo.',
    langkah: [
      '<b>Instruktur</b>: tambah/edit/hapus (hapus hanya bila belum pernah dijadwalkan) — nonaktif tak muncul di kelas baru.',
      '<b>Audit Log</b>: 15 aksi terakhir (check-in, pengembalian sesi, pembayaran, hapus data) — waktu WIB + pelakunya.',
      '<b>Reset Data Demo</b>: mengembalikan seluruh data ke contoh awal — aman dipakai latihan.',
      'Informasi studio: nama, zona waktu WIB, mata uang Rupiah, mode aplikasi.',
    ],
    flow: mulai('Pengaturan') + arr + node('Kelola instruktur (CRUD + status aktif)') + arr + putusan('Instruktur sudah dijadwalkan?') + arrDua +
      cabang(['Ya', node('HAPUS DITOLAK — nonaktifkan saja', 'gagal')], ['Belum', node('Boleh dihapus', 'baik')]) +
      arr + node('Semua aksi penting tercatat di Audit Log (siapa, apa, kapan WIB)'),
    catatan: 'Audit log adalah bukti saat ada selisih: "kemarin sesi member ini berkurang siapa?" — terjawab di sini.',
  },
  {
    no: 9, judul: 'Booking Customer (halaman publik /booking)',
    fungsi: 'Member book sendiri dari HP tanpa login — identitas via nomor WhatsApp terdaftar. Resepsionis tidak perlu membalas chat satu per satu.',
    langkah: [
      'Buka <b>/booking</b> → ketik nomor WhatsApp terdaftar → Masuk.',
      'Tab <b>Kelas Tersedia</b>: lihat sisa kursi; kelas yang sudah dibooking bertanda.',
      'Tab <b>Jadwal Saya</b>: lihat status; batalkan sendiri bila berhalangan (sesi tidak terpotong).',
      'Tab <b>Paket Saya</b>: sisa sesi & kedaluwarsa — hanya bisa dibaca, tidak bisa diubah.',
    ],
    flow: mulai('Buka /booking') + arr + node('Masukkan nomor WhatsApp') + arr + putusan('Cocok dengan member aktif?') + arrDua +
      cabang(['Tidak', node('Arahkan hubungi admin (tombol WA)', 'gagal')], ['Ya', node('Pilih kelas → Book')]) +
      arr + putusan('Punya paket aktif?') + arrDua +
      cabang(['Tidak', node('Hubungi admin (beli paket/drop-in)', 'gagal')], ['Ya', node('Kelas penuh? → WAITLIST / Book')]) +
      arr + node('Booking tersimpan — langsung terlihat di admin') + arr + node('Check-in di studio → barulah sesi −1'),
    catatan: 'Batal mandiri selalu aman (sesi utuh) selama belum check-in. Data member lain tidak pernah tampil di halaman ini.',
  },
  {
    no: 10, judul: 'Fitur Pendukung',
    fungsi: 'Perekat yang membuat seluruh sistem nyaman dipakai sehari-hari.',
    langkah: [
      '<b>Notifikasi toast</b>: hijau = berhasil, merah = gagal + alasannya, kuning = peringatan. Hilang sendiri.',
      '<b>Modal</b>: tutup dengan ✕ / Esc / klik luar; tekan Enter untuk menyimpan.',
      '<b>Pagination</b> otomatis di tabel Member, Pembayaran, Paket member.',
      '<b>Export CSV</b> (Pembayaran), tombol WA di banyak titik, dan halaman responsif untuk HP.',
    ],
    flow: mulai('Alur rilis aplikasi (untuk pengembang)') + arr + putusan('Push ke branch mana?') + arrDua +
      cabang(['main (pengembangan)', node('Preview deployment', 'putusan')], ['production (rilis)', node('LIVE di sawiji-demo.vercel.app', 'baik')]) +
      arr + node('Deploy otomatis oleh Vercel — tanpa langkah manual'),
    catatan: 'Identitas studio (nama, WA admin, kota) bisa diganti lewat file .env tanpa mengubah kode — siap untuk klien lain.',
  },
]

const daftar = fitur.map((f) => `<tr><td style="width:6mm">${f.no}</td><td style="width:52mm"><b>${f.judul}</b></td><td>${f.fungsi.split('.')[0]}.</td></tr>`).join('')

const bab = fitur
  .map(
    (f) => `<section class="hal">
  <h2>${f.no}. ${f.judul}</h2>
  <div class="lbl">Fungsi</div>
  <p>${f.fungsi}</p>
  <div class="lbl">Cara Pakai</div>
  <ol>${f.langkah.map((l) => `<li>${l}</li>`).join('')}</ol>
  <div class="lbl">Flowchart</div>
  <div class="fc">${f.flow}</div>
  ${f.catatan ? `<div class="catatan"><b>Catatan penting:</b> ${f.catatan}</div>` : ''}
</section>`,
  )
  .join('\n')

const html = `<!doctype html>
<html lang="id"><head><meta charset="utf-8"><title>Penjelasan Fitur & Flowchart — Sawiji Studio Admin</title>
<style>${css}</style></head><body>
<div class="cover">
  <div class="brand">Sawiji</div>
  <div class="sub">Studio Pilates</div>
  <h1>Penjelasan Fitur<br>&amp; Flowchart</h1>
  <div class="desc">10 fitur dijabarkan satu per satu:<br>fungsi, cara pakai, dan diagram alurnya</div>
  <div class="meta">Sawiji Studio Admin • sawiji-demo.vercel.app<br>September 2026</div>
</div>
<div class="toc">
  <h1>Daftar Isi</h1>
  <p class="lbl">10 Fitur</p>
  <table><thead><tr><th>#</th><th>Fitur</th><th>Fungsi singkat</th></tr></thead><tbody>${daftar}</tbody></table>
  <p style="margin-top:12px; font-size:9.5pt; color:#7d6269">Setiap fitur punya halaman sendiri berisi: fungsi, cara pakai langkah demi langkah, flowchart alurnya, dan catatan penting agar tidak salah paham.</p>
</div>
${bab}
</body></html>`

mkdirSync('dist', { recursive: true })
writeFileSync('dist/fitur.html', html)
console.log('OK -> dist/fitur.html')

const edge = ['C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', 'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'].find((c) => existsSync(c))
if (!edge) { console.log('Edge tidak ditemukan'); process.exit(1) }
execFileSync(edge, ['--headless', '--disable-gpu', '--no-pdf-header-footer', `--print-to-pdf=${process.cwd()}\\FITUR-DAN-FLOWCHART.pdf`, `file:///${process.cwd().replaceAll('\\', '/')}/dist/fitur.html`])
mkdirSync('public', { recursive: true })
copyFileSync('FITUR-DAN-FLOWCHART.pdf', 'public/FITUR-DAN-FLOWCHART.pdf')
console.log('OK -> FITUR-DAN-FLOWCHART.pdf (+ public/)')
