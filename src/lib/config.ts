// Konfigurasi studio — SATU sumber kebenaran.
// Untuk klien/deployment baru: cukup isi env di .env, tidak perlu menyentuh kode.

const env = import.meta.env

export const STUDIO = {
  nama: env.VITE_STUDIO_NAMA ?? 'Sawiji',
  namaLengkap: env.VITE_STUDIO_NAMA_LENGKAP ?? 'Sawiji Studio Pilates',
  namaAplikasi: env.VITE_STUDIO_NAMA_LENGKAP ? `${env.VITE_STUDIO_NAMA_LENGKAP} Admin` : 'Sawiji Studio Admin',
  kota: env.VITE_STUDIO_KOTA ?? 'Yogyakarta',
  tahun: new Date().getFullYear(),
  /** Nomor WA admin/resepsionis (format 08…); dipakai semua tombol bantuan customer */
  waAdmin: env.VITE_STUDIO_WA_ADMIN ?? '081234567890',
} as const

/** Template pesan WhatsApp — satu tempat, konsisten di semua halaman */
export const WA_TEMPLATES = {
  sapaan: (nama: string) => `Halo ${nama}, dari ${STUDIO.namaLengkap} 🌸`,
  sapaanCustomer: (nama: string) => `Halo ${STUDIO.namaLengkap}, saya ${nama}`,
  daftarMember: () => `Halo ${STUDIO.namaLengkap}, saya ingin daftar member baru 🌸`,
  beliPaket: (nama: string) => `Halo ${STUDIO.namaLengkap}, saya ${nama} ingin beli paket / daftar drop-in 🌸`,
  ulangTahun: (nama: string) =>
    `Halo ${nama}, selamat ulang tahun! 🎂 Semoga sehat dan bahagia. Dari keluarga besar ${STUDIO.namaLengkap} 🌸`,
  paketMauHabis: (nama: string, produk: string, tanggal: string) =>
    `Halo ${nama}, paket ${produk} Anda di ${STUDIO.namaLengkap} akan kadaluarsa ${tanggal}. Yuk book sesi berikutnya 🌸`,
  pengingatBayar: (nama: string, item: string, nominal: string) =>
    `Halo ${nama}, pengingat pembayaran ${item} sebesar ${nominal} di ${STUDIO.namaLengkap}. Terima kasih 🌸`,
  pengingatKelas: (kelas: string, tanggal: string, jam: string) =>
    `Halo, dari ${STUDIO.namaLengkap}: jadwal ${kelas} ${tanggal} pukul ${jam}.`,
} as const
