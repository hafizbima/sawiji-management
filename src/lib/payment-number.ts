/** Nomor berikutnya mengikuti urutan terbesar pada tanggal transaksi. */
export function nextPaymentNumber(ymd: string, payments: ReadonlyArray<{ nomor: string }>): string {
  const prefix = `SWJ-${ymd.replaceAll('-', '')}-`
  let highest = 0
  for (const { nomor } of payments) {
    if (!nomor.startsWith(prefix)) continue
    const suffix = nomor.slice(prefix.length)
    if (!/^\d+$/.test(suffix)) continue
    highest = Math.max(highest, Number(suffix))
  }
  return `${prefix}${String(highest + 1).padStart(3, '0')}`
}
