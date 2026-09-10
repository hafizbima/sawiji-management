// Format Rupiah & tanggal (zona waktu Asia/Jakarta)

export function rupiah(n: number): string {
  return 'Rp' + Math.round(n).toLocaleString('id-ID')
}

const dateFmt = new Intl.DateTimeFormat('id-ID', {
  timeZone: 'Asia/Jakarta',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

const timeFmt = new Intl.DateTimeFormat('id-ID', {
  timeZone: 'Asia/Jakarta',
  hour: '2-digit',
  minute: '2-digit',
})

export function tanggalPanjang(iso: string): string {
  return dateFmt.format(new Date(iso))
}

export function jam(iso: string): string {
  return timeFmt.format(new Date(iso)).replace('.', ':')
}

/** Tanggal hari ini di WIB, yyyy-mm-dd */
export function todayWIB(): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Jakarta' }).format(new Date())
}

/** yyyy-mm-dd -> label singkat "Sen, 8 Sep" */
export function labelTanggal(ymd: string): string {
  const d = new Date(ymd + 'T00:00:00+07:00')
  return new Intl.DateTimeFormat('id-ID', { weekday: 'short', day: 'numeric', month: 'short' }).format(d)
}

/** Nama hari Indonesia */
export function namaHari(ymd: string): string {
  const d = new Date(ymd + 'T00:00:00+07:00')
  return new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(d)
}

/** ISO (bisa UTC) -> yyyy-mm-dd di WIB */
export function ymdWIB(iso: string): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Jakarta' }).format(new Date(iso))
}

export function tambahHari(ymd: string, n: number): string {
  const d = new Date(ymd + 'T00:00:00+07:00')
  d.setDate(d.getDate() + n)
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Jakarta' }).format(d)
}

/** Selisih hari (to - from), negatif artinya sudah lewat */
export function daysUntil(from: string, to: string): number {
  const a = new Date(from + 'T00:00:00+07:00').getTime()
  const b = new Date(to + 'T00:00:00+07:00').getTime()
  return Math.round((b - a) / 86400000)
}

/** Jam sekarang di WIB, format HH:mm */
export function nowHM(): string {
  return new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date())
}

/** Senin sebagai awal minggu */
export function awalMinggu(ymd: string): string {
  const d = new Date(ymd + 'T00:00:00+07:00')
  const day = (d.getDay() + 6) % 7
  return tambahHari(ymd, -day)
}

export function linkWa(nomor: string, pesan: string): string {
  const digits = nomor.replace(/\D/g, '').replace(/^0/, '62')
  return `https://wa.me/${digits}?text=${encodeURIComponent(pesan)}`
}
