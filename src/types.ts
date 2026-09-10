// Tipe domain Sawiji Studio Admin

export type Role = 'owner' | 'admin' | 'instructor'

export interface Profile {
  id: string
  nama: string
  role: Role
}

export interface Member {
  id: string
  nama_lengkap: string
  nomor_whatsapp: string
  instagram?: string
  tanggal_lahir?: string // yyyy-mm-dd
  kondisi_khusus?: string
  catatan_admin?: string
  aktif: boolean
  created_at: string
}

export interface Instructor {
  id: string
  nama: string
  nomor_whatsapp: string
  aktif: boolean
}

export interface PackageProduct {
  id: string
  nama: string
  jumlah_sesi: number
  harga: number
  masa_aktif_hari: number
  aktif: boolean
}

export type PaymentStatus = 'Lunas' | 'Menunggu pembayaran' | 'Dibatalkan' | 'Refund'
export type PaymentMethod = 'Transfer' | 'QRIS' | 'Cash' | 'Lainnya'

export interface Payment {
  id: string
  nomor: string // SWJ-20260908-001
  tanggal: string // ISO
  member_id: string
  keterangan: string // item: nama paket / drop-in
  nominal: number
  metode: PaymentMethod
  status: PaymentStatus
  catatan?: string
  created_at: string
}

export interface MemberPackage {
  id: string
  member_id: string
  package_product_id: string
  tanggal_beli: string // yyyy-mm-dd
  tanggal_mulai: string // yyyy-mm-dd
  tanggal_kadaluarsa: string // yyyy-mm-dd
  sesi_awal: number
  sesi_tersisa: number
  harga_aktual: number
  status_pembayaran: PaymentStatus
  payment_id?: string
  catatan?: string
  created_at: string
}

export interface ClassSession {
  id: string
  nama: string
  tanggal: string // yyyy-mm-dd (WIB)
  jam_mulai: string // HH:mm
  jam_selesai: string // HH:mm
  instructor_id: string
  kapasitas: number
  lokasi?: string
  catatan?: string
}

export type BookingStatus = 'Terkonfirmasi' | 'Hadir' | 'Batal' | 'Waitlist' | 'No-show'
export type CheckinStatus = 'Belum hadir' | 'Hadir' | 'Batal' | 'No-show'

export interface Booking {
  id: string
  class_session_id: string
  member_id: string
  member_package_id?: string // sumber sesi; kosong = drop-in
  status: BookingStatus
  waktu_checkin?: string // ISO
  no_show_dipotong?: boolean
  catatan?: string
  created_at: string
}

export interface AuditLog {
  id: string
  aksi: string
  entitas: string
  entitas_id: string
  detail: string
  waktu: string // ISO
  aktor: string
}
