import { useSyncExternalStore } from 'react'
import type {
  AuditLog,
  Booking,
  ClassSession,
  Instructor,
  Member,
  MemberPackage,
  PackageProduct,
  Payment,
  PaymentMethod,
  PaymentStatus,
} from '../types'
import { tambahHari, todayWIB } from '../lib/format'
import { buatDemoData } from './demo'
import { nextPaymentNumber as generatePaymentNumber } from '../lib/payment-number'

// ponytail: MVP single-studio, data demo in-memory; swap ke Supabase via supabase/adapter nanti
export interface DB {
  members: Member[]
  instructors: Instructor[]
  products: PackageProduct[]
  memberPackages: MemberPackage[]
  sessions: ClassSession[]
  bookings: Booking[]
  payments: Payment[]
  auditLogs: AuditLog[]
}

let seq = 0
function uid(prefix: string): string {
  seq += 1
  return `${prefix}_${Date.now().toString(36)}${seq.toString(36)}`
}

function audit(d: DB, aksi: string, entitas: string, entitas_id: string, detail: string, aktor = 'Admin Sawiji') {
  d.auditLogs.unshift({ id: uid('log'), aksi, entitas, entitas_id, detail, waktu: new Date().toISOString(), aktor })
}

/* ============ persistensi sesi demo ============
   Perubahan tester disimpan di sessionStorage (per tab) agar tetap ada saat pindah halaman,
   tombol back/forward, atau buka /booking lewat address bar. Refresh (F5) sengaja me-reset
   ke data demo awal; tab baru selalu mulai bersih. */
const KUNCI_SESI = 'sawiji-demo-db'

function iniReload(): boolean {
  const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
  return nav?.type === 'reload'
}

function muatAwal(): DB {
  try {
    if (!iniReload()) {
      const raw = sessionStorage.getItem(KUNCI_SESI)
      if (raw) return JSON.parse(raw) as DB
    }
  } catch { /* storage tidak tersedia / rusak → pakai demo */ }
  sessionStorage.removeItem(KUNCI_SESI)
  return buatDemoData()
}

function simpan() {
  try { sessionStorage.setItem(KUNCI_SESI, JSON.stringify(db)) } catch { /* kuota penuh / private mode: abaikan */ }
}

let db: DB = muatAwal()
let version = 0
const listeners = new Set<() => void>()

function emit() {
  version += 1
  simpan()
  listeners.forEach((l) => l())
}

function subscribe(l: () => void) {
  listeners.add(l)
  return () => void listeners.delete(l)
}

export function useDb(): DB {
  useSyncExternalStore(subscribe, () => version)
  return db
}

export function resetDemo() {
  db = buatDemoData()
  emit()
}

/* ============ selector ============ */

export function namaMember(id: string): string {
  return db.members.find((m) => m.id === id)?.nama_lengkap ?? '—'
}
export function namaInstruktur(id: string): string {
  return db.instructors.find((i) => i.id === id)?.nama ?? '—'
}
export function namaProduk(id: string): string {
  return db.products.find((p) => p.id === id)?.nama ?? '—'
}

/** Paket yang boleh dipakai booking/check-in: Lunas, belum kadaluarsa, sisa > 0 */
export function paketAktif(memberId: string): MemberPackage[] {
  const t = todayWIB()
  return db.memberPackages.filter(
    (p) => p.member_id === memberId && p.status_pembayaran === 'Lunas' && p.tanggal_kadaluarsa >= t && p.sesi_tersisa > 0,
  )
}

export function pesertaKelas(sessionId: string): Booking[] {
  return db.bookings
    .filter((b) => b.class_session_id === sessionId && (b.status === 'Terkonfirmasi' || b.status === 'Hadir' || b.status === 'No-show'))
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
}

export function waitlistKelas(sessionId: string): Booking[] {
  return db.bookings
    .filter((b) => b.class_session_id === sessionId && b.status === 'Waitlist')
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
}

export function jumlahTerisi(sessionId: string): number {
  return pesertaKelas(sessionId).length
}

export function kelasPenuh(s: ClassSession): boolean {
  return jumlahTerisi(s.id) >= s.kapasitas
}

/** Booking aktif member di sesi lain yang waktunya berbenturan */
export function bookingBentrok(memberId: string, s: ClassSession): Booking | null {
  for (const b of db.bookings) {
    if (b.member_id !== memberId || b.status === 'Batal' || b.status === 'No-show') continue
    if (b.class_session_id === s.id) continue
    const other = db.sessions.find((x) => x.id === b.class_session_id)
    if (!other || other.tanggal !== s.tanggal) continue
    if (other.jam_mulai < s.jam_selesai && s.jam_mulai < other.jam_selesai) return b
  }
  return null
}

function nextPaymentNumber(ymd: string): string {
  return generatePaymentNumber(ymd, db.payments)
}

/* ============ fitur booking mandiri customer (halaman publik /booking) ============ */

/** Cari member aktif berdasar nomor WA (toleran format: spasi/tanda hubung diabaikan) */
export function cekMemberByWa(waInput: string): Member | null {
  const norm = (v: string) => v.replace(/\D/g, '').replace(/^62/, '0')
  const q = norm(waInput)
  if (q.length < 9) return null
  return db.members.find((m) => m.aktif && norm(m.nomor_whatsapp) === q) ?? null
}

/** Kelas mendatang (mulai hari ini), urut tanggal & jam — untuk halaman publik */
export function kelasPublik(): Array<ClassSession & { sisa: number; penuh: boolean }> {
  const t = todayWIB()
  return db.sessions
    .filter((s) => s.tanggal >= t)
    .sort((a, b) => (a.tanggal + a.jam_mulai).localeCompare(b.tanggal + b.jam_mulai))
    .map((s) => ({ ...s, sisa: Math.max(0, s.kapasitas - jumlahTerisi(s.id)), penuh: kelasPenuh(s) }))
}

/** Booking mendatang milik member (untuk "Jadwal Saya") */
export function bookingMendatang(memberId: string): Array<Booking & { sesi: ClassSession }> {
  const t = todayWIB()
  return db.bookings
    .filter((b) => b.member_id === memberId && (b.status === 'Terkonfirmasi' || b.status === 'Waitlist'))
    .map((b) => ({ ...b, sesi: db.sessions.find((s) => s.id === b.class_session_id)! }))
    .filter((b) => b.sesi && b.sesi.tanggal >= t)
    .sort((a, b) => (a.sesi.tanggal + a.sesi.jam_mulai).localeCompare(b.sesi.tanggal + b.sesi.jam_mulai))
}

/* ============ mutasi ============ */

export interface Hasil {
  ok: boolean
  error?: string
  warning?: string
}

export function createBooking(
  sessionId: string,
  memberId: string,
  packageId: string | null,
  opts: { allowWaitlist?: boolean; metodeDropin?: PaymentMethod } = {},
): Hasil & { waitlisted?: boolean } {
  const s = db.sessions.find((x) => x.id === sessionId)
  if (!s) return { ok: false, error: 'Kelas tidak ditemukan.' }
  if (db.bookings.some((b) => b.class_session_id === sessionId && b.member_id === memberId && b.status !== 'Batal'))
    return { ok: false, error: 'Member sudah terdaftar di kelas ini.' }

  if (packageId) {
    const pkg = db.memberPackages.find((p) => p.id === packageId)
    const valid = pkg && pkg.member_id === memberId && pkg.status_pembayaran === 'Lunas' && pkg.tanggal_kadaluarsa >= s.tanggal && pkg.sesi_tersisa > 0
    if (!valid) return { ok: false, error: 'Paket tidak dapat dipakai (harus Lunas, belum kadaluarsa, dan masih punya sisa sesi).' }
  }

  const penuh = kelasPenuh(s)
  if (penuh && !opts.allowWaitlist) return { ok: false, error: 'Kelas sudah penuh. Tandai opsi waitlist untuk mendaftarkan ke daftar tunggu.' }

  const bentrok = bookingBentrok(memberId, s)
  const warning = bentrok
    ? `Perhatian: ${namaMember(memberId)} juga terdaftar di ${bentrok ? db.sessions.find((x) => x.id === (bentrok as Booking).class_session_id)?.nama : ''} pada jam yang berbenturan.`
    : undefined

  db.bookings.push({
    id: uid('bk'),
    class_session_id: sessionId,
    member_id: memberId,
    member_package_id: packageId ?? undefined,
    status: penuh ? 'Waitlist' : 'Terkonfirmasi',
    created_at: new Date().toISOString(),
  })

  if (!packageId) {
    const dropin = db.products.find((p) => p.nama.toLowerCase().includes('drop')) ?? db.products[0]
    db.payments.push({
      id: uid('pay'),
      nomor: nextPaymentNumber(todayWIB()),
      tanggal: todayWIB(),
      member_id: memberId,
      keterangan: 'Drop-in',
      nominal: dropin.harga,
      metode: opts.metodeDropin ?? 'Cash',
      status: 'Lunas',
      catatan: `Drop-in ${s.nama} ${s.jam_mulai}`,
      created_at: new Date().toISOString(),
    })
  }

  audit(db, 'booking_create', 'bookings', sessionId, `${namaMember(memberId)} dibooking ke ${s.nama} ${s.jam_mulai}${penuh ? ' (waitlist)' : ''}${packageId ? '' : ' (drop-in)'}`)
  emit()
  return { ok: true, warning, waitlisted: penuh }
}

export function checkinBooking(id: string): Hasil {
  const b = db.bookings.find((x) => x.id === id)
  if (!b) return { ok: false, error: 'Booking tidak ditemukan.' }
  if (b.status === 'Hadir') return { ok: false, error: 'Sudah check-in sebelumnya.' }
  if (b.status !== 'Terkonfirmasi') return { ok: false, error: 'Booking tidak berstatus Terkonfirmasi.' }
  const s = db.sessions.find((x) => x.id === b.class_session_id)
  if (!s) return { ok: false, error: 'Kelas tidak ditemukan.' }

  if (b.member_package_id) {
    const pkg = db.memberPackages.find((p) => p.id === b.member_package_id)
    if (!pkg) return { ok: false, error: 'Paket tidak ditemukan.' }
    if (pkg.tanggal_kadaluarsa < s.tanggal) return { ok: false, error: 'Paket sudah kadaluarsa, tidak bisa dipakai check-in.' }
    if (pkg.sesi_tersisa <= 0) return { ok: false, error: 'Sisa sesi paket sudah habis.' }
    pkg.sesi_tersisa -= 1
  }

  b.status = 'Hadir'
  b.waktu_checkin = new Date().toISOString()
  audit(db, 'checkin', 'bookings', b.id, `Check-in ${namaMember(b.member_id)} pada ${s.nama} ${s.jam_mulai}${b.member_package_id ? ' (sesi paket dikurangi)' : ' (drop-in)'}`)
  emit()
  return { ok: true }
}

export function batalCheckin(id: string): Hasil {
  const b = db.bookings.find((x) => x.id === id)
  if (!b) return { ok: false, error: 'Booking tidak ditemukan.' }
  if (b.status !== 'Hadir') return { ok: false, error: 'Booking tidak sedang berstatus Hadir.' }
  const s = db.sessions.find((x) => x.id === b.class_session_id)
  b.status = 'Terkonfirmasi'
  b.waktu_checkin = undefined
  if (b.member_package_id) {
    const pkg = db.memberPackages.find((p) => p.id === b.member_package_id)
    if (pkg) pkg.sesi_tersisa += 1
  }
  audit(db, 'checkin_batal', 'bookings', b.id, `Pembatalan check-in ${namaMember(b.member_id)} pada ${s?.nama ?? ''} (sesi paket dikembalikan)`)
  emit()
  return { ok: true }
}

export function batalkanBooking(id: string): Hasil {
  const b = db.bookings.find((x) => x.id === id)
  if (!b) return { ok: false, error: 'Booking tidak ditemukan.' }
  if (b.status !== 'Terkonfirmasi' && b.status !== 'Waitlist')
    return { ok: false, error: 'Booking sudah check-in / no-show. Batalkan check-in terlebih dahulu.' }
  b.status = 'Batal'
  audit(db, 'booking_batal', 'bookings', b.id, `Booking ${namaMember(b.member_id)} dibatalkan (sesi tidak terpotong)`)
  emit()
  return { ok: true }
}

export function tandaiNoShow(id: string): Hasil {
  const b = db.bookings.find((x) => x.id === id)
  if (!b) return { ok: false, error: 'Booking tidak ditemukan.' }
  if (b.status !== 'Terkonfirmasi') return { ok: false, error: 'Hanya booking Terkonfirmasi yang bisa ditandai no-show.' }
  b.status = 'No-show'
  audit(db, 'no_show', 'bookings', b.id, `${namaMember(b.member_id)} ditandai no-show (sesi belum terpotong)`)
  emit()
  return { ok: true }
}

export function potongSesiNoShow(id: string): Hasil {
  const b = db.bookings.find((x) => x.id === id)
  if (!b) return { ok: false, error: 'Booking tidak ditemukan.' }
  if (b.status !== 'No-show') return { ok: false, error: 'Booking tidak berstatus No-show.' }
  if (b.no_show_dipotong) return { ok: false, error: 'Sesi no-show sudah pernah dipotong.' }
  if (!b.member_package_id) return { ok: false, error: 'Booking drop-in tidak punya paket yang bisa dipotong.' }
  const pkg = db.memberPackages.find((p) => p.id === b.member_package_id)
  if (!pkg) return { ok: false, error: 'Paket tidak ditemukan.' }
  if (pkg.sesi_tersisa <= 0) return { ok: false, error: 'Sisa sesi paket sudah 0.' }
  pkg.sesi_tersisa -= 1
  b.no_show_dipotong = true
  audit(db, 'no_show_potong', 'bookings', b.id, `Sesi no-show ${namaMember(b.member_id)} dipotong dari paket (sisa ${pkg.sesi_tersisa})`)
  emit()
  return { ok: true }
}

export function promosikanWaitlist(id: string): Hasil {
  const b = db.bookings.find((x) => x.id === id)
  if (!b) return { ok: false, error: 'Booking tidak ditemukan.' }
  if (b.status !== 'Waitlist') return { ok: false, error: 'Booking tidak berstatus Waitlist.' }
  const s = db.sessions.find((x) => x.id === b.class_session_id)
  if (!s) return { ok: false, error: 'Kelas tidak ditemukan.' }
  if (jumlahTerisi(s.id) >= s.kapasitas) return { ok: false, error: 'Kelas masih penuh, tidak bisa promosi dari waitlist.' }
  b.status = 'Terkonfirmasi'
  audit(db, 'waitlist_promosi', 'bookings', b.id, `${namaMember(b.member_id)} dipromosikan dari waitlist ke ${s.nama}`)
  emit()
  return { ok: true }
}

export function setStatusPembayaran(paymentId: string, status: PaymentStatus): Hasil {
  const p = db.payments.find((x) => x.id === paymentId)
  if (!p) return { ok: false, error: 'Transaksi tidak ditemukan.' }
  p.status = status
  const pkg = db.memberPackages.find((mp) => mp.payment_id === paymentId)
  if (pkg) pkg.status_pembayaran = status
  audit(db, 'payment_status', 'payments', paymentId, `${p.nomor} (${namaMember(p.member_id)}) → ${status}`)
  emit()
  return { ok: true }
}

export interface BeliPaketInput {
  member_id: string
  product_id: string
  tanggal_beli: string
  tanggal_mulai: string
  harga_aktual: number
  metode: PaymentMethod
  status_pembayaran: PaymentStatus
  catatan?: string
}

export function beliPaket(input: BeliPaketInput): Hasil {
  const product = db.products.find((p) => p.id === input.product_id)
  if (!product) return { ok: false, error: 'Paket tidak ditemukan.' }
  const payment: Payment = {
    id: uid('pay'),
    nomor: nextPaymentNumber(input.tanggal_beli),
    tanggal: input.tanggal_beli,
    member_id: input.member_id,
    keterangan: product.nama,
    nominal: input.harga_aktual,
    metode: input.metode,
    status: input.status_pembayaran,
    catatan: input.catatan,
    created_at: new Date().toISOString(),
  }
  const mp: MemberPackage = {
    id: uid('mp'),
    member_id: input.member_id,
    package_product_id: product.id,
    tanggal_beli: input.tanggal_beli,
    tanggal_mulai: input.tanggal_mulai,
    tanggal_kadaluarsa: tambahHari(input.tanggal_mulai, product.masa_aktif_hari),
    sesi_awal: product.jumlah_sesi,
    sesi_tersisa: product.jumlah_sesi,
    harga_aktual: input.harga_aktual,
    status_pembayaran: input.status_pembayaran,
    payment_id: payment.id,
    catatan: input.catatan,
    created_at: new Date().toISOString(),
  }
  db.payments.push(payment)
  db.memberPackages.push(mp)
  audit(db, 'paket_beli', 'member_packages', mp.id, `${namaMember(input.member_id)} membeli ${product.nama} (${input.status_pembayaran})`)
  emit()
  return { ok: true }
}

/** Koreksi manual sisa sesi / kadaluarsa paket (kompensasi, cuti sakit, dsb.) — tercatat di audit */
export function sesuaikanPaket(id: string, sesiTersisa: number, tanggalKadaluarsa: string): Hasil {
  const p = db.memberPackages.find((x) => x.id === id)
  if (!p) return { ok: false, error: 'Paket tidak ditemukan.' }
  if (!Number.isInteger(sesiTersisa) || sesiTersisa < 0) return { ok: false, error: 'Sisa sesi harus bilangan bulat ≥ 0.' }
  if (!tanggalKadaluarsa) return { ok: false, error: 'Tanggal kadaluarsa wajib diisi.' }
  const sebelum = `${p.sesi_tersisa} sesi, exp ${p.tanggal_kadaluarsa}`
  p.sesi_tersisa = sesiTersisa
  p.tanggal_kadaluarsa = tanggalKadaluarsa
  audit(db, 'paket_sesuaikan', 'member_packages', id, `${namaMember(p.member_id)} — ${namaProduk(p.package_product_id)}: ${sebelum} → ${sesiTersisa} sesi, exp ${tanggalKadaluarsa}`)
  emit()
  return { ok: true }
}

export interface PembayaranInput {
  member_id: string
  keterangan: string
  nominal: number
  metode: PaymentMethod
  status: PaymentStatus
  tanggal?: string
  catatan?: string
}

export function catatPembayaran(input: PembayaranInput): Hasil {
  const tanggal = input.tanggal ?? todayWIB()
  db.payments.push({
    id: uid('pay'),
    nomor: nextPaymentNumber(tanggal),
    tanggal,
    member_id: input.member_id,
    keterangan: input.keterangan,
    nominal: input.nominal,
    metode: input.metode,
    status: input.status,
    catatan: input.catatan,
    created_at: new Date().toISOString(),
  })
  audit(db, 'payment_create', 'payments', input.member_id, `Pembayaran manual ${input.keterangan} ${input.nominal} (${input.status})`)
  emit()
  return { ok: true }
}

export interface MemberInput {
  nama_lengkap: string
  nomor_whatsapp: string
  instagram?: string
  tanggal_lahir?: string
  kondisi_khusus?: string
  catatan_admin?: string
  aktif: boolean
}

export function tambahMember(input: MemberInput): Hasil {
  db.members.push({ id: uid('m'), ...input, created_at: new Date().toISOString() })
  audit(db, 'member_create', 'members', input.nama_lengkap, `Member baru: ${input.nama_lengkap}`)
  emit()
  return { ok: true }
}

export function ubahMember(id: string, input: MemberInput): Hasil {
  const m = db.members.find((x) => x.id === id)
  if (!m) return { ok: false, error: 'Member tidak ditemukan.' }
  Object.assign(m, input)
  audit(db, 'member_update', 'members', id, `Data member ${input.nama_lengkap} diperbarui`)
  emit()
  return { ok: true }
}

export interface ProdukInput {
  nama: string
  jumlah_sesi: number
  harga: number
  masa_aktif_hari: number
  aktif: boolean
}

export function tambahProduk(input: ProdukInput): Hasil {
  db.products.push({ id: uid('pr'), ...input })
  audit(db, 'produk_create', 'package_products', input.nama, `Paket baru: ${input.nama}`)
  emit()
  return { ok: true }
}

export function ubahProduk(id: string, input: ProdukInput): Hasil {
  const p = db.products.find((x) => x.id === id)
  if (!p) return { ok: false, error: 'Paket tidak ditemukan.' }
  Object.assign(p, input)
  audit(db, 'produk_update', 'package_products', id, `Master paket ${input.nama} diperbarui`)
  emit()
  return { ok: true }
}

export interface SesiInput {
  nama: string
  tanggal: string
  jam_mulai: string
  jam_selesai: string
  instructor_id: string
  kapasitas: number
  lokasi?: string
  catatan?: string
}

export function tambahSesi(input: SesiInput): Hasil {
  db.sessions.push({ id: uid('s'), ...input })
  audit(db, 'sesi_create', 'class_sessions', input.nama, `Sesi baru ${input.nama} ${input.tanggal} ${input.jam_mulai}`)
  emit()
  return { ok: true }
}

export function ubahSesi(id: string, input: SesiInput): Hasil {
  const s = db.sessions.find((x) => x.id === id)
  if (!s) return { ok: false, error: 'Kelas tidak ditemukan.' }
  Object.assign(s, input)
  audit(db, 'sesi_update', 'class_sessions', id, `Sesi ${input.nama} ${input.tanggal} diperbarui`)
  emit()
  return { ok: true }
}

export function hapusSesi(id: string): Hasil {
  const s = db.sessions.find((x) => x.id === id)
  if (!s) return { ok: false, error: 'Kelas tidak ditemukan.' }
  const aktif = db.bookings.filter((b) => b.class_session_id === id && b.status !== 'Batal')
  if (aktif.length > 0) return { ok: false, error: 'Masih ada peserta terdaftar. Batalkan booking mereka dulu.' }
  db.sessions = db.sessions.filter((x) => x.id !== id)
  audit(db, 'sesi_hapus', 'class_sessions', id, `Sesi ${s.nama} ${s.tanggal} ${s.jam_mulai} dihapus`)
  emit()
  return { ok: true }
}

/* ============ instruktur (master data) ============ */

export interface InstrukturInput {
  nama: string
  nomor_whatsapp: string
  aktif: boolean
}

export function tambahInstruktur(input: InstrukturInput): Hasil {
  if (!input.nama.trim()) return { ok: false, error: 'Nama instruktur wajib diisi.' }
  db.instructors.push({ id: uid('i'), ...input })
  audit(db, 'instruktur_create', 'instructors', input.nama, `Instruktur baru: ${input.nama}`)
  emit()
  return { ok: true }
}

export function ubahInstruktur(id: string, input: InstrukturInput): Hasil {
  const i = db.instructors.find((x) => x.id === id)
  if (!i) return { ok: false, error: 'Instruktur tidak ditemukan.' }
  Object.assign(i, input)
  audit(db, 'instruktur_update', 'instructors', id, `Data instruktur ${input.nama} diperbarui`)
  emit()
  return { ok: true }
}

/* ============ duplikat jadwal mingguan ============ */

export function duplikatMingguan(awalMingguSumber: string): { ok: boolean; dibuat?: number; dilewati?: number; error?: string } {
  const sumber = db.sessions.filter((s) => s.tanggal >= awalMingguSumber && s.tanggal <= tambahHari(awalMingguSumber, 6))
  if (sumber.length === 0) return { ok: false, error: 'Tidak ada kelas pada minggu sumber untuk disalin.' }
  let dibuat = 0
  let dilewati = 0
  for (const s of sumber) {
    const target = tambahHari(s.tanggal, 7)
    const ada = db.sessions.some(
      (x) => x.tanggal === target && x.nama === s.nama && x.jam_mulai === s.jam_mulai && x.jam_selesai === s.jam_selesai,
    )
    if (ada) {
      dilewati += 1
      continue
    }
    db.sessions.push({ ...s, id: uid('s'), tanggal: target })
    dibuat += 1
  }
  audit(db, 'sesi_duplikat', 'class_sessions', awalMingguSumber, `Salin jadwal mingguan: ${dibuat} kelas dibuat, ${dilewati} dilewati (sudah ada)`)
  emit()
  return { ok: true, dibuat, dilewati }
}

/* ============ hapus (koreksi kesalahan input) ============
   Aturan: data yang sudah punya riwayat/relasi TIDAK boleh dihapus — hanya entri salah yang masih "bersih".
   Ini menjaga integritas laporan & audit; untuk member yang berhenti, gunakan status nonaktif. */

export function hapusMember(id: string): Hasil {
  const m = db.members.find((x) => x.id === id)
  if (!m) return { ok: false, error: 'Member tidak ditemukan.' }
  const punyaRiwayat =
    db.bookings.some((b) => b.member_id === id) ||
    db.memberPackages.some((p) => p.member_id === id) ||
    db.payments.some((p) => p.member_id === id)
  if (punyaRiwayat) return { ok: false, error: 'Member sudah punya riwayat booking/paket/pembayaran. Gunakan status Nonaktif, bukan hapus.' }
  db.members = db.members.filter((x) => x.id !== id)
  audit(db, 'member_hapus', 'members', id, `Member ${m.nama_lengkap} dihapus (belum punya riwayat)`)
  emit()
  return { ok: true }
}

export function hapusProduk(id: string): Hasil {
  const p = db.products.find((x) => x.id === id)
  if (!p) return { ok: false, error: 'Paket tidak ditemukan.' }
  if (db.memberPackages.some((mp) => mp.package_product_id === id))
    return { ok: false, error: 'Paket sudah pernah dibeli member. Nonaktifkan lewat Edit (hilangkan centang "Paket dijual").' }
  db.products = db.products.filter((x) => x.id !== id)
  audit(db, 'produk_hapus', 'package_products', id, `Master paket ${p.nama} dihapus`)
  emit()
  return { ok: true }
}

export function hapusPaketMember(id: string): Hasil {
  const mp = db.memberPackages.find((x) => x.id === id)
  if (!mp) return { ok: false, error: 'Paket member tidak ditemukan.' }
  if (db.bookings.some((b) => b.member_package_id === id))
    return { ok: false, error: 'Paket ini sudah dipakai booking. Batalkan booking terkait dulu, atau sesuaikan sisa sesinya.' }
  db.memberPackages = db.memberPackages.filter((x) => x.id !== id)
  let catatanBayar = ''
  if (mp.payment_id) {
    const pay = db.payments.find((p) => p.id === mp.payment_id)
    if (pay) {
      db.payments = db.payments.filter((p) => p.id !== pay.id)
      catatanBayar = ` beserta transaksi ${pay.nomor}`
    }
  }
  audit(db, 'paket_member_hapus', 'member_packages', id, `Pembelian ${namaProduk(mp.package_product_id)} oleh ${namaMember(mp.member_id)} dihapus${catatanBayar}`)
  emit()
  return { ok: true }
}

export function hapusInstruktur(id: string): Hasil {
  const i = db.instructors.find((x) => x.id === id)
  if (!i) return { ok: false, error: 'Instruktur tidak ditemukan.' }
  if (db.sessions.some((s) => s.instructor_id === id))
    return { ok: false, error: 'Instruktur masih tercatat di jadwal kelas. Nonaktifkan lewat Edit, atau ganti instruktur kelasnya dulu.' }
  db.instructors = db.instructors.filter((x) => x.id !== id)
  audit(db, 'instruktur_hapus', 'instructors', id, `Instruktur ${i.nama} dihapus`)
  emit()
  return { ok: true }
}

export function hapusPembayaran(id: string): Hasil {
  const p = db.payments.find((x) => x.id === id)
  if (!p) return { ok: false, error: 'Transaksi tidak ditemukan.' }
  if (db.memberPackages.some((mp) => mp.payment_id === id))
    return { ok: false, error: 'Transaksi ini terkait pembelian paket. Hapus lewat halaman Paket → Paket Member agar keduanya konsisten.' }
  db.payments = db.payments.filter((x) => x.id !== id)
  audit(db, 'payment_hapus', 'payments', id, `Transaksi ${p.nomor} (${namaMember(p.member_id)}, ${p.keterangan}, Rp${p.nominal.toLocaleString('id-ID')}) dihapus`)
  emit()
  return { ok: true }
}
