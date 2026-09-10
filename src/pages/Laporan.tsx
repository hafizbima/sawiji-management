import { useMemo, useState } from 'react'
import { Card, Empty, Field, inputCls } from '../components/ui'
import { namaInstruktur, useDb } from '../data/db'
import { rupiah, tambahHari, todayWIB } from '../lib/format'

function Bar({ label, value, max, right }: { label: string; value: number; max: number; right: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="grid grid-cols-[7.5rem_1fr_5.5rem] items-center gap-3 text-sm sm:grid-cols-[10rem_1fr_6rem]">
      <div className="truncate text-muted">{label}</div>
      <div className="h-4 overflow-hidden rounded-full bg-cream-100">
        <div className="h-full rounded-full bg-brand-900" style={{ width: `${Math.max(pct, 1)}%` }} />
      </div>
      <div className="text-right text-xs text-muted">{right}</div>
    </div>
  )
}

export default function Laporan() {
  const db = useDb()
  const [dari, setDari] = useState(() => tambahHari(todayWIB(), -30))
  const [sampai, setSampai] = useState(() => todayWIB())

  const data = useMemo(() => {
    const sessions = db.sessions.filter((s) => s.tanggal >= dari && s.tanggal <= sampai)
    const sid = new Set(sessions.map((s) => s.id))
    const bookings = db.bookings.filter((b) => sid.has(b.class_session_id) && b.status !== 'Waitlist')
    const hadir = bookings.filter((b) => b.status === 'Hadir')
    const payments = db.payments.filter((p) => p.tanggal >= dari && p.tanggal <= sampai)
    const lunas = payments.filter((p) => p.status === 'Lunas')

    const byKelas = new Map<string, number>()
    for (const b of bookings.filter((x) => x.status !== 'Batal')) {
      const s = sessions.find((x) => x.id === b.class_session_id)!
      byKelas.set(s.nama, (byKelas.get(s.nama) ?? 0) + 1)
    }
    const byInstruktur = new Map<string, { kelas: number; hadir: number }>()
    for (const s of sessions) {
      const cur = byInstruktur.get(s.instructor_id) ?? { kelas: 0, hadir: 0 }
      cur.kelas += 1
      cur.hadir += db.bookings.filter((b) => b.class_session_id === s.id && b.status === 'Hadir').length
      byInstruktur.set(s.instructor_id, cur)
    }
    const byPaket = new Map<string, number>()
    for (const mp of db.memberPackages.filter((m) => m.tanggal_beli >= dari && m.tanggal_beli <= sampai)) {
      byPaket.set(mp.package_product_id, (byPaket.get(mp.package_product_id) ?? 0) + 1)
    }

    const aktif30 = db.members.filter((m) => m.aktif && db.bookings.some((b) => {
      if (b.member_id !== m.id || b.status !== 'Hadir') return false
      const s = db.sessions.find((x) => x.id === b.class_session_id)
      return s ? s.tanggal >= tambahHari(sampai, -30) : false
    }))
    const pasif = db.members.filter((m) => m.aktif && !aktif30.includes(m))

    return {
      pendapatan: lunas.reduce((s, p) => s + p.nominal, 0),
      jmlLunas: lunas.length,
      jmlBooking: bookings.length,
      jmlHadir: hadir.length,
      kehadiran: bookings.length ? Math.round((hadir.length / bookings.filter((b) => b.status !== 'Batal').length || 0) * 100) : 0,
      kelasPopuler: [...byKelas.entries()].sort((a, b) => b[1] - a[1]),
      instruktur: [...byInstruktur.entries()].sort((a, b) => b[1].kelas - a[1].kelas),
      paketTerjual: [...byPaket.entries()].sort((a, b) => b[1] - a[1]),
      aktif30: aktif30.length,
      pasif,
    }
  }, [db, dari, sampai])

  const maxKelas = Math.max(1, ...data.kelasPopuler.map(([, v]) => v))

  return (
    <div className="grid gap-6">
      <Card title="Periode Laporan">
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Dari"><input type="date" className={inputCls} value={dari} onChange={(e) => setDari(e.target.value)} /></Field>
          <Field label="Sampai"><input type="date" className={inputCls} value={sampai} onChange={(e) => setSampai(e.target.value)} /></Field>
          <div className="flex items-end gap-2">
            <button className="cursor-pointer rounded-xl border border-line px-3 py-2 text-sm hover:bg-cream-100" onClick={() => { setDari(todayWIB()); setSampai(todayWIB()) }}>Hari ini</button>
            <button className="cursor-pointer rounded-xl border border-line px-3 py-2 text-sm hover:bg-cream-100" onClick={() => { setDari(tambahHari(todayWIB(), -7)); setSampai(todayWIB()) }}>7 hari</button>
            <button className="cursor-pointer rounded-xl border border-line px-3 py-2 text-sm hover:bg-cream-100" onClick={() => { setDari(tambahHari(todayWIB(), -30)); setSampai(todayWIB()) }}>30 hari</button>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card><div className="text-sm text-muted">Pendapatan total (lunas)</div><div className="mt-1 font-display text-2xl font-bold">{rupiah(data.pendapatan)}</div></Card>
        <Card><div className="text-sm text-muted">Transaksi lunas</div><div className="mt-1 font-display text-2xl font-bold">{data.jmlLunas}</div></Card>
        <Card><div className="text-sm text-muted">Booking / kehadiran</div><div className="mt-1 font-display text-2xl font-bold">{data.jmlBooking} / {data.jmlHadir}</div></Card>
        <Card><div className="text-sm text-muted">Tingkat kehadiran</div><div className="mt-1 font-display text-2xl font-bold">{data.kehadiran}%</div></Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Kelas Terpopuler (booking)">
          {data.kelasPopuler.length === 0 ? <Empty>Belum ada data.</Empty> : (
            <div className="grid gap-2.5">
              {data.kelasPopuler.map(([nama, v]) => <Bar key={nama} label={nama} value={v} max={maxKelas} right={`${v} booking`} />)}
            </div>
          )}
        </Card>

        <Card title="Kinerja Instruktur">
          {data.instruktur.length === 0 ? <Empty>Belum ada data.</Empty> : (
            <div className="overflow-x-auto">
            <table className="rtable w-full min-w-[360px] text-sm">
              <thead><tr className="text-left text-xs text-muted uppercase"><th className="py-2 pr-4">Instruktur</th><th className="py-2 pr-4">Jumlah kelas</th><th className="py-2">Total kehadiran</th></tr></thead>
              <tbody>
                {data.instruktur.map(([id, v]) => (
                  <tr key={id} className="border-t border-line">
                    <td className="py-3 pr-4 font-semibold">{namaInstruktur(id)}</td>
                    <td className="py-3 pr-4">{v.kelas}</td>
                    <td className="py-3">{v.hadir}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </Card>

        <Card title="Paket Terjual">
          {data.paketTerjual.length === 0 ? <Empty>Belum ada pembelian pada periode ini.</Empty> : (
            <div className="overflow-x-auto">
              <table className="rtable w-full min-w-[320px] text-sm">
                <tbody>
                  {data.paketTerjual.map(([id, v]) => (
                    <tr key={id} className="border-t border-line first:border-t-0">
                      <td className="py-3 pr-4 font-semibold">{db.products.find((p) => p.id === id)?.nama ?? id}</td>
                      <td className="py-3 text-right">{v} pembelian</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card title="Member">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="rounded-xl bg-cream-100 p-4">
              <div className="font-display text-2xl font-bold">{data.aktif30}</div>
              <div className="text-xs text-muted">member aktif (hadir 30 hari terakhir)</div>
            </div>
            <div className="rounded-xl bg-cream-100 p-4">
              <div className="font-display text-2xl font-bold">{data.pasif.length}</div>
              <div className="text-xs text-muted">tidak hadir &gt; 30 hari</div>
            </div>
          </div>
          {data.pasif.length > 0 && (
            <ul className="mt-4 grid gap-1 text-sm text-muted">
              {data.pasif.map((m) => <li key={m.id}>• {m.nama_lengkap}</li>)}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}
