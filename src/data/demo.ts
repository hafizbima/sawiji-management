import type {
  Booking,
  BookingStatus,
  ClassSession,
  Instructor,
  Member,
  MemberPackage,
  PackageProduct,
  Payment,
  PaymentMethod,
  PaymentStatus,
} from '../types'
import type { DB } from './db'
import { tambahHari, todayWIB } from '../lib/format'

let seq = 0
function uid(prefix: string): string {
  seq += 1
  return `${prefix}_${Date.now().toString(36)}${seq.toString(36)}`
}
export function buatDemoData(): DB {
  const t0 = todayWIB()
  const t = (n: number) => tambahHari(t0, n)
  const iso = (n: number) => new Date(t(n) + 'T07:00:00+07:00').toISOString()

  const members: Member[] = [
    { id: 'm1', nama_lengkap: 'Anindya Saraswati', nomor_whatsapp: '081234567890', instagram: 'anindya.sara', kondisi_khusus: 'Cedera lutut kanan, hindari deep lunge', aktif: true, created_at: iso(-60) },
    { id: 'm2', nama_lengkap: 'Bella Kirana', nomor_whatsapp: '081298764321', instagram: 'bellakrn', aktif: true, created_at: iso(-55) },
    { id: 'm3', nama_lengkap: 'Clarissa Handoyo', nomor_whatsapp: '081355512345', kondisi_khusus: 'Skoliosis ringan', aktif: true, created_at: iso(-45) },
    { id: 'm4', nama_lengkap: 'Dewi Anggraini', nomor_whatsapp: '081711223344', tanggal_lahir: `1993-${tambahHari(t0, 3).slice(5)}`, aktif: true, created_at: iso(-10) },
    { id: 'm5', nama_lengkap: 'Farah Nabila', nomor_whatsapp: '082145678900', instagram: 'farahnabila', aktif: true, created_at: iso(-40) },
    { id: 'm6', nama_lengkap: 'Intan Permata', nomor_whatsapp: '081933445566', tanggal_lahir: `1995-${tambahHari(t0, 1).slice(5)}`, kondisi_khusus: 'Trimester awal kehamilan kedua, opsional modif', aktif: true, created_at: iso(-35) },
    { id: 'm7', nama_lengkap: 'Kirana Maheswari', nomor_whatsapp: '081200990011', aktif: true, created_at: iso(-50) },
    { id: 'm8', nama_lengkap: 'Laila Rahmi', nomor_whatsapp: '085611223344', catatan_admin: 'Cuti panjang sampai akhir tahun', aktif: false, created_at: iso(-80) },
  ]

  const instructors: Instructor[] = [
    { id: 'i1', nama: 'Alya Prameswari', nomor_whatsapp: '08112233445', aktif: true },
    { id: 'i2', nama: 'Bunga Larasati', nomor_whatsapp: '08134455667', aktif: true },
    { id: 'i3', nama: 'Citra Wulandari', nomor_whatsapp: '08187788990', aktif: true },
  ]

  const products: PackageProduct[] = [
    { id: 'pr1', nama: 'Drop-in', jumlah_sesi: 1, harga: 150000, masa_aktif_hari: 7, aktif: true },
    { id: 'pr2', nama: 'Paket 10 Sesi', jumlah_sesi: 10, harga: 1350000, masa_aktif_hari: 35, aktif: true },
    { id: 'pr3', nama: 'Paket 15 Sesi', jumlah_sesi: 15, harga: 1950000, masa_aktif_hari: 49, aktif: true },
  ]

  const mp = (id: string, member_id: string, product_id: string, beli: number, mulai: number, sisa: number, status_pembayaran: PaymentStatus, payment_id?: string): MemberPackage => ({
    id,
    member_id,
    package_product_id: product_id,
    tanggal_beli: t(beli),
    tanggal_mulai: t(mulai),
    tanggal_kadaluarsa: t(mulai + products.find((p) => p.id === product_id)!.masa_aktif_hari),
    sesi_awal: products.find((p) => p.id === product_id)!.jumlah_sesi,
    sesi_tersisa: sisa,
    harga_aktual: products.find((p) => p.id === product_id)!.harga,
    status_pembayaran,
    payment_id,
    created_at: iso(beli),
  })

  const memberPackages: MemberPackage[] = [
    mp('mp1', 'm1', 'pr2', -12, -12, 3, 'Lunas', 'pay1'),
    mp('mp2', 'm2', 'pr3', -20, -20, 9, 'Lunas', 'pay2'),
    mp('mp3', 'm3', 'pr2', -30, -30, 2, 'Lunas', 'pay3'),
    mp('mp4', 'm4', 'pr2', -3, -3, 10, 'Menunggu pembayaran', 'pay4'),
    mp('mp5', 'm5', 'pr3', -26, -26, 3, 'Lunas', 'pay5'),
    mp('mp6', 'm6', 'pr2', -10, -10, 7, 'Lunas', 'pay6'),
    mp('mp7', 'm7', 'pr3', -40, -40, 11, 'Lunas', 'pay7'),
    mp('mp8', 'm8', 'pr2', -40, -40, 6, 'Lunas', 'pay8'),
  ]

  const plan: Record<number, Array<[string, string, string, number, number, string?]>> = {
    0: [
      ['Reformer Fundamental', '07:00', '08:00', 0, 5, 'Studio A'],
      ['Mat Pilates', '09:00', '10:00', 1, 8, 'Studio B'],
      ['Reformer Intermediate', '17:00', '18:00', 0, 5, 'Studio A'],
      ['Stretch & Mobility', '18:30', '19:30', 2, 10, 'Studio B'],
    ],
    1: [
      ['Reformer Fundamental', '07:00', '08:00', 0, 5, 'Studio A'],
      ['Private Reformer', '10:00', '11:00', 2, 1, 'Studio A'],
      ['Mat Pilates', '18:00', '19:00', 1, 8, 'Studio B'],
    ],
    2: [
      ['Reformer Intermediate', '07:00', '08:00', 0, 5, 'Studio A'],
      ['Stretch & Mobility', '09:30', '10:30', 2, 10, 'Studio B'],
      ['Reformer Fundamental', '17:30', '18:30', 1, 5, 'Studio A'],
    ],
    3: [
      ['Mat Pilates', '07:00', '08:00', 1, 8, 'Studio B'],
      ['Reformer Fundamental', '17:00', '18:00', 0, 5, 'Studio A'],
      ['Reformer Intermediate', '18:30', '19:30', 0, 5, 'Studio A'],
    ],
    4: [
      ['Reformer Fundamental', '07:00', '08:00', 1, 5, 'Studio A'],
      ['Stretch & Mobility', '09:00', '10:00', 2, 10, 'Studio B'],
      ['Mat Pilates', '17:30', '18:30', 1, 8, 'Studio B'],
    ],
    5: [
      ['Reformer Intermediate', '08:00', '09:00', 0, 5, 'Studio A'],
      ['Mat Pilates', '10:00', '11:00', 1, 8, 'Studio B'],
      ['Private Reformer', '11:30', '12:30', 2, 1, 'Studio A'],
    ],
    6: [
      ['Stretch & Mobility', '09:00', '10:00', 2, 10, 'Studio B'],
      ['Reformer Fundamental', '10:30', '11:30', 0, 5, 'Studio A'],
    ],
  }

  const sessions: ClassSession[] = []
  for (const [off, list] of Object.entries(plan)) {
    list.forEach(([nama, jam_mulai, jam_selesai, instr, kapasitas, lokasi], i) => {
      sessions.push({
        id: `s${off}_${i}`,
        nama,
        tanggal: t(Number(off)),
        jam_mulai,
        jam_selesai,
        instructor_id: instructors[instr].id,
        kapasitas,
        lokasi,
      })
    })
  }
  const S = (off: number, i: number) => sessions.find((s) => s.id === `s${off}_${i}`)!

  const bk = (id: string, session: ClassSession, member_id: string, status: BookingStatus, member_package_id?: string, waktu_checkin?: string): Booking => ({
    id,
    class_session_id: session.id,
    member_id,
    member_package_id,
    status,
    waktu_checkin,
    created_at: iso(-1),
  })

  const bookings: Booking[] = [
    bk('b1', S(0, 0), 'm1', 'Terkonfirmasi', 'mp1'),
    bk('b2', S(0, 0), 'm2', 'Terkonfirmasi', 'mp2'),
    bk('b3', S(0, 0), 'm3', 'Hadir', 'mp3', new Date(t0 + 'T06:55:00+07:00').toISOString()),
    bk('b4', S(0, 0), 'm5', 'Terkonfirmasi', 'mp5'),
    bk('b5', S(0, 0), 'm6', 'Terkonfirmasi', 'mp6'),
    bk('b6', S(0, 0), 'm7', 'Waitlist', 'mp7'),
    bk('b7', S(0, 1), 'm2', 'No-show', 'mp2'),
    bk('b8', S(0, 1), 'm6', 'Hadir', 'mp6', new Date(t0 + 'T08:56:00+07:00').toISOString()),
    bk('b9', S(0, 1), 'm7', 'Terkonfirmasi', 'mp7'),
    bk('b10', S(0, 2), 'm1', 'Terkonfirmasi', 'mp1'),
    bk('b11', S(0, 2), 'm2', 'Terkonfirmasi', 'mp2'),
    bk('b12', S(0, 2), 'm5', 'Terkonfirmasi', 'mp5'),
    bk('b13', S(0, 2), 'm6', 'Terkonfirmasi', 'mp6'),
    bk('b14', S(0, 2), 'm3', 'Batal', 'mp3'),
    bk('b15', S(0, 3), 'm7', 'Terkonfirmasi', 'mp7'),
    bk('b16', S(0, 3), 'm6', 'Terkonfirmasi'),
    bk('b17', S(1, 0), 'm2', 'Terkonfirmasi', 'mp2'),
    bk('b18', S(1, 2), 'm1', 'Terkonfirmasi', 'mp1'),
    bk('b19', S(2, 0), 'm5', 'Terkonfirmasi', 'mp5'),
  ]

  const nomorCount: Record<string, number> = {}
  const pay = (id: string, tanggal: string, member_id: string, keterangan: string, nominal: number, metode: PaymentMethod, status: PaymentStatus, catatan?: string): Payment => ({
    id,
    nomor: `SWJ-${tanggal.replaceAll('-', '')}-${String(nomorCount[tanggal] ?? 1).padStart(3, '0')}`,
    tanggal,
    member_id,
    keterangan,
    nominal,
    metode,
    status,
    catatan,
    created_at: iso(0),
  })

  const db2: DB = { members, instructors, products, memberPackages, sessions, bookings, payments: [], auditLogs: [] }
  const payments: Payment[] = [
    pay('pay1', t(-12), 'm1', 'Paket 10 Sesi', 1350000, 'Transfer', 'Lunas'),
    pay('pay2', t(-20), 'm2', 'Paket 15 Sesi', 1950000, 'QRIS', 'Lunas'),
    pay('pay3', t(-30), 'm3', 'Paket 10 Sesi', 1350000, 'Cash', 'Lunas'),
    pay('pay4', t(-3), 'm4', 'Paket 10 Sesi', 1350000, 'Transfer', 'Menunggu pembayaran', 'Invoice dikirim via WA, menunggu transfer'),
    pay('pay5', t(-26), 'm5', 'Paket 15 Sesi', 1950000, 'Transfer', 'Lunas'),
    pay('pay6', t(0), 'm6', 'Drop-in', 150000, 'QRIS', 'Lunas', 'Drop-in Stretch & Mobility'),
    pay('pay7', t(-40), 'm7', 'Paket 15 Sesi', 1950000, 'Transfer', 'Lunas'),
    pay('pay8', t(-40), 'm8', 'Paket 10 Sesi', 1350000, 'QRIS', 'Lunas'),
  ]
  db2.payments = payments

  db2.auditLogs = [
    { id: uid('log'), aksi: 'checkin', entitas: 'bookings', entitas_id: 'b3', detail: 'Check-in Clarissa Handoyo pada Reformer Fundamental 07:00 (sesi mp3 dikurangi)', waktu: new Date(t0 + 'T06:55:00+07:00').toISOString(), aktor: 'Admin Sawiji' },
    { id: uid('log'), aksi: 'payment_create', entitas: 'payments', entitas_id: 'pay6', detail: 'Drop-in Intan Permata Rp150.000 via QRIS (Lunas)', waktu: new Date(t0 + 'T07:10:00+07:00').toISOString(), aktor: 'Admin Sawiji' },
    { id: uid('log'), aksi: 'paket_beli', entitas: 'member_packages', entitas_id: 'mp4', detail: 'Dewi Anggraini membeli Paket 10 Sesi (status: Menunggu pembayaran)', waktu: new Date(t(-3) + 'T07:00:00+07:00').toISOString(), aktor: 'Admin Sawiji' },
  ]

  return db2
}