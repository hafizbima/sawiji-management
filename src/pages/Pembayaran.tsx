import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge, Button, Card, Confirm, Empty, Field, Modal, Pager, inputCls, usePagination } from '../components/ui'
import { catatPembayaran, hapusPembayaran, namaMember, setStatusPembayaran, useDb } from '../data/db'
import type { Payment } from '../types'
import { labelTanggal, linkWa, rupiah, todayWIB } from '../lib/format'
import { WA_TEMPLATES } from '../lib/config'
import { toast } from '../components/toast'



function CatatModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const db = useDb()
  const [f, setF] = useState({ member_id: '', keterangan: '', nominal: '', metode: 'Transfer', status: 'Lunas', tanggal: todayWIB(), catatan: '' })
  const [err, setErr] = useState<Record<string, string>>({})
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value })

  function submit() {
    const e: Record<string, string> = {}
    if (!f.member_id) e.member_id = 'Pilih member.'
    if (!f.keterangan.trim()) e.keterangan = 'Keterangan item wajib diisi.'
    const n = Number(f.nominal)
    if (!Number.isInteger(n) || n <= 0) e.nominal = 'Nominal harus angka lebih dari 0.'
    setErr(e)
    if (Object.keys(e).length) return
    const res = catatPembayaran({
      member_id: f.member_id, keterangan: f.keterangan, nominal: n, metode: f.metode as Payment['metode'],
      status: f.status as Payment['status'], tanggal: f.tanggal, catatan: f.catatan || undefined,
    })
    if (!res.ok) { setErr({ member_id: res.error ?? 'Gagal menyimpan.' }); return }
    toast.ok('Pembayaran dicatat.')
    onClose()
  }

  return (
    <Modal title="Catat Pembayaran Manual" open={open} onClose={onClose} onSubmit={submit}>
      <div className="grid gap-4">
        <Field label="Member" required error={err.member_id}>
          <select className={inputCls} value={f.member_id} onChange={set('member_id')}>
            <option value="">— Pilih member —</option>
            {db.members.map((m) => <option key={m.id} value={m.id}>{m.nama_lengkap}</option>)}
          </select>
        </Field>
        <Field label="Item yang dibeli" required error={err.keterangan}>
          <input className={inputCls} placeholder="cth: Paket 10 Sesi / Drop-in" value={f.keterangan} onChange={set('keterangan')} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Nominal (Rp)" required error={err.nominal}>
            <input inputMode="numeric" className={inputCls} value={f.nominal} onChange={set('nominal')} />
          </Field>
          <Field label="Tanggal" required>
            <input type="date" className={inputCls} value={f.tanggal} onChange={set('tanggal')} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Metode">
            <select className={inputCls} value={f.metode} onChange={set('metode')}>
              {['Transfer', 'QRIS', 'Cash', 'Lainnya'].map((m) => <option key={m}>{m}</option>)}
            </select>
          </Field>
          <Field label="Status">
            <select className={inputCls} value={f.status} onChange={set('status')}>
              {['Lunas', 'Menunggu pembayaran', 'Dibatalkan', 'Refund'].map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Catatan / referensi transfer">
          <input className={inputCls} value={f.catatan} onChange={set('catatan')} />
        </Field>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>Batal</Button>
        <Button onClick={submit}>Simpan</Button>
      </div>
    </Modal>
  )
}

export default function Pembayaran() {
  const db = useDb()
  const [catat, setCatat] = useState(false)
  const [lunasi, setLunasi] = useState<Payment | null>(null)
  const [hapus, setHapus] = useState<Payment | null>(null)
  const [f, setF] = useState({ dari: '', sampai: '', member: '', metode: '', status: '', cari: '' })

  const rows = useMemo(() => db.payments
    .filter((p) => (!f.dari || p.tanggal >= f.dari) && (!f.sampai || p.tanggal <= f.sampai))
    .filter((p) => !f.member || p.member_id === f.member)
    .filter((p) => !f.metode || p.metode === f.metode)
    .filter((p) => !f.status || p.status === f.status)
    .filter((p) => !f.cari || p.nomor.toLowerCase().includes(f.cari.toLowerCase()) || p.keterangan.toLowerCase().includes(f.cari.toLowerCase()))
    .sort((a, b) => b.tanggal.localeCompare(a.tanggal) || b.nomor.localeCompare(a.nomor)),
  [db, f])

  const totalLunas = rows.filter((p) => p.status === 'Lunas').reduce((s, p) => s + p.nominal, 0)
  const pg = usePagination(rows, 20, JSON.stringify(f))

  return (
    <div className="grid gap-6">
      <Card
        title="Filter"
        action={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => {
              const head = 'Nomor,Tanggal,Member,Item,Nominal,Metode,Status,Catatan'
              const lines = rows.map((p) => [p.nomor, p.tanggal, namaMember(p.member_id), p.keterangan, p.nominal, p.metode, p.status, p.catatan ?? ''].map((v) => `"${String(v).replaceAll('"', '""')}"`).join(','))
              const blob = new Blob(['\uFEFF' + [head, ...lines].join('\n')], { type: 'text/csv;charset=utf-8' })
              const a = document.createElement('a')
              a.href = URL.createObjectURL(blob)
              a.download = `pembayaran-${todayWIB()}.csv`
              a.click()
              URL.revokeObjectURL(a.href)
              toast.ok(`${rows.length} transaksi diekspor.`)
            }}>Export CSV</Button>
            <Button onClick={() => setCatat(true)}>+ Catat Pembayaran</Button>
          </div>
        }
      >
        <div className="grid gap-3 sm:grid-cols-4">
          <Field label="Cari nomor / item"><input className={inputCls} placeholder="SWJ-… atau nama paket" value={f.cari} onChange={(e) => setF({ ...f, cari: e.target.value })} /></Field>
          <Field label="Dari tanggal"><input type="date" className={inputCls} value={f.dari} onChange={(e) => setF({ ...f, dari: e.target.value })} /></Field>
          <Field label="Sampai tanggal"><input type="date" className={inputCls} value={f.sampai} onChange={(e) => setF({ ...f, sampai: e.target.value })} /></Field>
          <Field label="Member">
            <select className={inputCls} value={f.member} onChange={(e) => setF({ ...f, member: e.target.value })}>
              <option value="">Semua member</option>
              {db.members.map((m) => <option key={m.id} value={m.id}>{m.nama_lengkap}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-1 gap-3 sm:col-span-2 sm:grid-cols-2">
            <Field label="Metode">
              <select className={inputCls} value={f.metode} onChange={(e) => setF({ ...f, metode: e.target.value })}>
                <option value="">Semua</option>
                {['Transfer', 'QRIS', 'Cash', 'Lainnya'].map((m) => <option key={m}>{m}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select className={inputCls} value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}>
                <option value="">Semua</option>
                {['Lunas', 'Menunggu pembayaran', 'Dibatalkan', 'Refund'].map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
          </div>
        </div>
        <div className="mt-3 text-sm font-semibold">Total lunas (hasil filter): {rupiah(totalLunas)}</div>
      </Card>

      <Card title={`Transaksi (${rows.length})`}>
        {rows.length === 0 ? <Empty>Belum ada transaksi sesuai filter.</Empty> : (
          <div className="overflow-x-auto">
            <table className="rtable w-full min-w-[760px] text-sm">
              <thead>
                <tr className="text-left text-xs tracking-wide text-muted uppercase">
                  <th className="py-2 pr-4">Nomor</th><th className="py-2 pr-4">Tanggal</th><th className="py-2 pr-4">Member</th>
                  <th className="py-2 pr-4">Item</th><th className="py-2 pr-4">Nominal</th><th className="py-2 pr-4">Metode</th>
                  <th className="py-2 pr-4">Status</th><th className="py-2">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {pg.slice.map((p) => {
                  const m = db.members.find((x) => x.id === p.member_id)
                  const waPengingat = linkWa(
                    m?.nomor_whatsapp ?? '',
                    WA_TEMPLATES.pengingatBayar(m?.nama_lengkap ?? '', p.keterangan, rupiah(p.nominal)),
                  )
                  return (
                    <tr key={p.id} className="border-t border-line">
                      <td className="py-3 pr-4 font-mono text-xs">{p.nomor}</td>
                      <td className="py-3 pr-4">{labelTanggal(p.tanggal)}</td>
                      <td className="py-3 pr-4 font-semibold"><Link className="hover:underline" to={`/member/${p.member_id}`}>{namaMember(p.member_id)}</Link></td>
                      <td className="py-3 pr-4">{p.keterangan}{p.catatan ? <span className="block text-xs text-muted">{p.catatan}</span> : null}</td>
                      <td className="py-3 pr-4 font-semibold">{rupiah(p.nominal)}</td>
                      <td className="py-3 pr-4">{p.metode}</td>
                      <td className="py-3 pr-4"><Badge label={p.status} /></td>
                      <td className="py-3">
                        <div className="flex flex-wrap gap-1.5">
                          {p.status === 'Menunggu pembayaran' && (
                            <Button variant="secondary" className="!px-2.5 !py-1.5 text-xs" onClick={() => setLunasi(p)}>Tandai Lunas</Button>
                          )}
                          {p.status === 'Menunggu pembayaran' && (
                            <a href={waPengingat} target="_blank" rel="noreferrer">
                              <Button variant="ghost" className="!px-2.5 !py-1.5 text-xs">Pengingat WA</Button>
                            </a>
                          )}
                          <Button variant="ghost" className="!px-2.5 !py-1.5 text-xs text-red-700" onClick={() => setHapus(p)}>Hapus</Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
        <Pager p={pg} />
      </Card>

      {catat && <CatatModal open onClose={() => setCatat(false)} />}
      <Confirm
        open={!!lunasi}
        title="Tandai Lunas?"
        message={lunasi ? `${lunasi.nomor} — ${namaMember(lunasi.member_id)} — ${rupiah(lunasi.nominal)} akan menjadi Lunas. Paket terkait langsung dapat dipakai booking.` : ''}
        onCancel={() => setLunasi(null)}
        onConfirm={() => { const r = setStatusPembayaran(lunasi!.id, 'Lunas'); r.ok ? toast.ok('Ditandai Lunas.') : toast.err(r.error ?? 'Gagal.'); setLunasi(null) }}
      />
      <Confirm
        open={!!hapus}
        title="Hapus transaksi?"
        message={hapus ? `${hapus.nomor} — ${namaMember(hapus.member_id)} — ${rupiah(hapus.nominal)} akan dihapus permanen dan tercatat di audit log. Transaksi yang terkait pembelian paket harus dihapus lewat halaman Paket.` : ''}
        danger
        onCancel={() => setHapus(null)}
        onConfirm={() => { const r = hapusPembayaran(hapus!.id); r.ok ? toast.ok('Transaksi dihapus.') : toast.err(r.error ?? 'Gagal.'); setHapus(null) }}
      />
    </div>
  )
}
