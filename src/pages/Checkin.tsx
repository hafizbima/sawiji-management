import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Badge, Button, Card, Confirm, Empty, inputCls } from '../components/ui'
import {
  batalCheckin, batalkanBooking, checkinBooking, namaMember, namaProduk, pesertaKelas,
  potongSesiNoShow, tandaiNoShow, useDb, waitlistKelas,
} from '../data/db'
import { jam, labelTanggal, namaHari, todayWIB } from '../lib/format'
import { toast } from '../components/toast'


export default function Checkin() {
  const db = useDb()
  const [sp, setSp] = useSearchParams()
  const [aksi, setAksi] = useState<{ kind: 'undo' | 'noshow' | 'potong' | 'batal'; id: string; nama: string } | null>(null)
  const [cari, setCari] = useState('')

  const t = todayWIB()
  const hariIni = db.sessions.filter((s) => s.tanggal === t).sort((a, b) => a.jam_mulai.localeCompare(b.jam_mulai))
  const dipilih = hariIni.find((s) => s.id === sp.get('session')) ?? hariIni[0]

  function jalankan() {
    if (!aksi) return
    const fn = { undo: batalCheckin, noshow: tandaiNoShow, potong: potongSesiNoShow, batal: batalkanBooking }[aksi.kind]
    const r = fn(aksi.id)
    r.ok ? toast.ok('Tersimpan.') : toast.err(r.error ?? 'Gagal.')
    setAksi(null)
  }

  const msgAksi: Record<string, string> = {
    undo: 'Batalkan check-in? 1 sesi akan dikembalikan ke paket peserta dan tercatat di riwayat.',
    noshow: 'Tandai peserta sebagai no-show? Sesi belum terpotong.',
    potong: 'Potong 1 sesi dari paket peserta sebagai konsekuensi no-show?',
    batal: 'Batalkan booking peserta ini?',
  }

  if (hariIni.length === 0) return <Empty>Tidak ada kelas hari ini ({labelTanggal(t)}).</Empty>

  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {hariIni.map((s) => {
          const peserta = pesertaKelas(s.id).length
          const sel = dipilih?.id === s.id
          return (
            <button
              key={s.id}
              onClick={() => setSp({ session: s.id })}
              className={`cursor-pointer rounded-xl border px-4 py-2.5 text-left ${sel ? 'border-brand-700 bg-rose-100' : 'border-line bg-white hover:bg-cream-100'}`}
            >
              <div className="truncate text-sm font-bold">{s.jam_mulai} · {s.nama}</div>
              <div className="text-xs text-muted">{peserta}/{s.kapasitas} peserta</div>
            </button>
          )
        })}
      </div>

      {dipilih && (
        <Card
          title={`${dipilih.nama} · ${dipilih.jam_mulai}–${dipilih.jam_selesai}`}
          action={<span className="text-sm text-muted">{namaHari(t)}, {labelTanggal(t)} · {pesertaKelas(dipilih.id).length}/{dipilih.kapasitas}</span>}
        >
          {pesertaKelas(dipilih.id).length > 8 && (
            <input className={`${inputCls} mb-3 max-w-xs`} placeholder="Cari nama peserta…" value={cari} onChange={(e) => setCari(e.target.value)} />
          )}
          <div className="-mx-1 overflow-x-auto px-1">
            <table className="rtable w-full min-w-[620px] text-sm">
            <thead>
              <tr className="text-left text-xs tracking-wide text-muted uppercase">
                <th className="py-2 pr-4">Peserta</th>
                <th className="py-2 pr-4">Sumber sesi</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Jam check-in</th>
                <th className="py-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {pesertaKelas(dipilih.id).filter((b) => !cari || namaMember(b.member_id).toLowerCase().includes(cari.toLowerCase())).map((b) => (
                <tr key={b.id} className="border-t border-line">
                  <td className="py-3 pr-4 font-semibold">{namaMember(b.member_id)}</td>
                  <td className="py-3 pr-4 text-muted">{b.member_package_id ? namaProduk(db.memberPackages.find((p) => p.id === b.member_package_id)!.package_product_id) : 'Drop-in'}</td>
                  <td className="py-3 pr-4">
                    <Badge label={b.status} />
                    {b.no_show_dipotong && <span className="ml-1 text-xs text-muted">(sesi dipotong)</span>}
                  </td>
                  <td className="py-3 pr-4 text-muted">{b.waktu_checkin ? jam(b.waktu_checkin) + ' WIB' : '—'}</td>
                  <td className="py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {b.status === 'Terkonfirmasi' && (
                        <Button onClick={() => { const r = checkinBooking(b.id); r.ok ? toast.ok(`${namaMember(b.member_id)} berhasil check-in.`) : toast.err(r.error ?? 'Gagal.') }}>
                          Check-in
                        </Button>
                      )}
                      {b.status === 'Hadir' && (
                        <Button variant="ghost" onClick={() => setAksi({ kind: 'undo', id: b.id, nama: namaMember(b.member_id) })}>Batal check-in</Button>
                      )}
                      {b.status === 'Terkonfirmasi' && (
                        <Button variant="ghost" onClick={() => setAksi({ kind: 'noshow', id: b.id, nama: namaMember(b.member_id) })}>No-show</Button>
                      )}
                      {b.status === 'No-show' && !b.no_show_dipotong && b.member_package_id && (
                        <Button variant="ghost" onClick={() => setAksi({ kind: 'potong', id: b.id, nama: namaMember(b.member_id) })}>Potong sesi no-show</Button>
                      )}
                      {(b.status === 'Terkonfirmasi' || b.status === 'Waitlist') && (
                        <Button variant="ghost" onClick={() => setAksi({ kind: 'batal', id: b.id, nama: namaMember(b.member_id) })}>Batalkan booking</Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>

          {waitlistKelas(dipilih.id).length > 0 && (
            <div className="mt-5">
              <h3 className="mb-2 text-sm font-semibold">Waitlist</h3>
              <div className="overflow-x-auto">
                <table className="rtable w-full min-w-[420px] text-sm">
                  <tbody>
                    {waitlistKelas(dipilih.id).map((b) => (
                      <tr key={b.id} className="border-t border-line">
                        <td className="py-3 pr-4 font-semibold">{namaMember(b.member_id)}</td>
                        <td className="py-3 pr-4"><Badge label="Waitlist" /></td>
                        <td className="py-3 text-right text-xs text-muted">Promosikan dari halaman Jadwal & Booking</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Card>
      )}

      <Confirm
        open={!!aksi}
        title={aksi?.nama ?? ''}
        message={aksi ? msgAksi[aksi.kind] : ''}
        danger={aksi?.kind === 'potong' || aksi?.kind === 'batal'}
        onCancel={() => setAksi(null)}
        onConfirm={jalankan}
      />
    </div>
  )
}
