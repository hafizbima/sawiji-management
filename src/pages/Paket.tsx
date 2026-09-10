import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge, Button, Card, Confirm, Empty, Field, Modal, Pager, inputCls, usePagination } from '../components/ui'
import { beliPaket, hapusPaketMember, hapusProduk, namaMember, namaProduk, sesuaikanPaket, setStatusPembayaran, tambahProduk, ubahProduk, useDb } from '../data/db'
import type { MemberPackage, PackageProduct } from '../types'
import { labelTanggal, rupiah, todayWIB } from '../lib/format'
import { toast } from '../components/toast'


function ProdukModal({ open, editing, onClose }: { open: boolean; editing?: PackageProduct; onClose: () => void }) {
  const [f, setF] = useState({
    nama: editing?.nama ?? '', jumlah_sesi: String(editing?.jumlah_sesi ?? ''), harga: String(editing?.harga ?? ''), masa_aktif_hari: String(editing?.masa_aktif_hari ?? 30), aktif: editing?.aktif ?? true,
  })
  const [err, setErr] = useState<Record<string, string>>({})
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })

  function submit() {
    const e: Record<string, string> = {}
    if (!f.nama.trim()) e.nama = 'Nama paket wajib diisi.'
    const sesi = Number(f.jumlah_sesi), harga = Number(f.harga), hari = Number(f.masa_aktif_hari)
    if (!Number.isInteger(sesi) || sesi < 1) e.jumlah_sesi = 'Jumlah sesi minimal 1.'
    if (!Number.isInteger(harga) || harga < 0) e.harga = 'Harga tidak valid.'
    if (!Number.isInteger(hari) || hari < 1) e.masa_aktif_hari = 'Masa aktif minimal 1 hari.'
    setErr(e)
    if (Object.keys(e).length) return
    const payload = { nama: f.nama, jumlah_sesi: sesi, harga, masa_aktif_hari: hari, aktif: f.aktif }
    const res = editing ? ubahProduk(editing.id, payload) : tambahProduk(payload)
    if (!res.ok) { setErr({ nama: res.error ?? 'Gagal.' }); return }
    toast.ok(editing ? 'Master paket diperbarui.' : 'Master paket ditambahkan.')
    onClose()
  }

  return (
    <Modal title={editing ? 'Edit Master Paket' : 'Tambah Master Paket'} open={open} onClose={onClose} onSubmit={submit}>
      <div className="grid gap-4">
        <Field label="Nama paket" required error={err.nama}><input className={inputCls} value={f.nama} onChange={set('nama')} /></Field>
        <div className="grid grid-cols-3 gap-4">
          <Field label="Jumlah sesi" required error={err.jumlah_sesi}><input inputMode="numeric" className={inputCls} value={f.jumlah_sesi} onChange={set('jumlah_sesi')} /></Field>
          <Field label="Harga (Rp)" required error={err.harga}><input inputMode="numeric" className={inputCls} value={f.harga} onChange={set('harga')} /></Field>
          <Field label="Masa aktif (hari)" required error={err.masa_aktif_hari}><input inputMode="numeric" className={inputCls} value={f.masa_aktif_hari} onChange={set('masa_aktif_hari')} /></Field>
        </div>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" checked={f.aktif} onChange={set('aktif')} /> Paket dijual
        </label>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>Batal</Button>
        <Button onClick={submit}>Simpan</Button>
      </div>
    </Modal>
  )
}

function BeliPaketModal({ open, onClose, memberId }: { open: boolean; onClose: () => void; memberId?: string }) {
  const db = useDb()
  const [f, setF] = useState({
    member_id: memberId ?? '', product_id: db.products[0]?.id ?? '', tanggal_beli: todayWIB(), tanggal_mulai: todayWIB(),
    harga_aktual: String(db.products[0]?.harga ?? ''), metode: 'Transfer', status_pembayaran: 'Lunas', catatan: '',
  })
  const [err, setErr] = useState<Record<string, string>>({})
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let v = e.target.value
    if (k === 'product_id') v = e.target.value
    setF((old) => ({ ...old, [k]: v, ...(k === 'product_id' ? { harga_aktual: String(db.products.find((p) => p.id === v)?.harga ?? '') } : {}) }))
  }

  function submit() {
    const e: Record<string, string> = {}
    if (!f.member_id) e.member_id = 'Pilih member.'
    if (!f.product_id) e.product_id = 'Pilih paket.'
    if (!f.tanggal_mulai) e.tanggal_mulai = 'Tanggal mulai wajib diisi.'
    const harga = Number(f.harga_aktual)
    if (!Number.isInteger(harga) || harga < 0) e.harga_aktual = 'Harga tidak valid.'
    setErr(e)
    if (Object.keys(e).length) return
    const res = beliPaket({
      member_id: f.member_id, product_id: f.product_id, tanggal_beli: f.tanggal_beli, tanggal_mulai: f.tanggal_mulai,
      harga_aktual: harga, metode: f.metode as 'Transfer', status_pembayaran: f.status_pembayaran as 'Lunas', catatan: f.catatan || undefined,
    })
    if (!res.ok) { setErr({ member_id: res.error ?? 'Gagal menyimpan.' }); return }
    toast.ok('Pembelian paket tersimpan.')
    onClose()
  }

  return (
    <Modal title="Beli Paket untuk Member" open={open} onClose={onClose} onSubmit={submit} wide>
      <div className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Member" required error={err.member_id}>
            <select className={inputCls} value={f.member_id} onChange={set('member_id')}>
              <option value="">— Pilih member —</option>
              {db.members.filter((m) => m.aktif).map((m) => <option key={m.id} value={m.id}>{m.nama_lengkap}</option>)}
            </select>
          </Field>
          <Field label="Paket" required error={err.product_id}>
            <select className={inputCls} value={f.product_id} onChange={set('product_id')}>
              {db.products.filter((p) => p.aktif).map((p) => <option key={p.id} value={p.id}>{p.nama} — {rupiah(p.harga)} / {p.jumlah_sesi} sesi</option>)}
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Field label="Tanggal beli" required><input type="date" className={inputCls} value={f.tanggal_beli} onChange={set('tanggal_beli')} /></Field>
          <Field label="Tanggal mulai" required error={err.tanggal_mulai}><input type="date" className={inputCls} value={f.tanggal_mulai} onChange={set('tanggal_mulai')} /></Field>
          <Field label="Harga aktual (Rp)" required error={err.harga_aktual}><input inputMode="numeric" className={inputCls} value={f.harga_aktual} onChange={set('harga_aktual')} /></Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Metode pembayaran">
            <select className={inputCls} value={f.metode} onChange={set('metode')}>
              {['Transfer', 'QRIS', 'Cash', 'Lainnya'].map((m) => <option key={m}>{m}</option>)}
            </select>
          </Field>
          <Field label="Status pembayaran">
            <select className={inputCls} value={f.status_pembayaran} onChange={set('status_pembayaran')}>
              <option>Lunas</option>
              <option>Menunggu pembayaran</option>
            </select>
          </Field>
        </div>
        <Field label="Catatan"><input className={inputCls} value={f.catatan} onChange={set('catatan')} /></Field>
        <p className="text-xs text-muted">
          Tanggal kadaluarsa dihitung otomatis dari tanggal mulai + masa aktif paket. Paket baru bisa dipakai booking/check-in setelah status Lunas.
        </p>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>Batal</Button>
        <Button onClick={submit}>Simpan Pembelian</Button>
      </div>
    </Modal>
  )
}

function UbahSesiPaketModal({ pkg, onClose }: { pkg: MemberPackage; onClose: () => void }) {
  const [sisa, setSisa] = useState(String(pkg.sesi_tersisa))
  const [kadaluarsa, setKadaluarsa] = useState(pkg.tanggal_kadaluarsa)
  const [err, setErr] = useState('')
  function submit() {
    const r = sesuaikanPaket(pkg.id, Number(sisa), kadaluarsa)
    if (!r.ok) { setErr(r.error ?? 'Gagal.'); return }
    toast.ok('Paket disesuaikan (tercatat di audit log).')
    onClose()
  }
  return (
    <Modal title="Sesuaikan Paket Member" open onClose={onClose} onSubmit={submit}>
      <div className="grid gap-4">
        <div className="text-sm text-muted">{namaMember(pkg.member_id)} · {namaProduk(pkg.package_product_id)}</div>
        <Field label="Sesi tersisa" error={err}><input inputMode="numeric" className={inputCls} value={sisa} onChange={(e) => setSisa(e.target.value)} /></Field>
        <Field label="Tanggal kadaluarsa"><input type="date" className={inputCls} value={kadaluarsa} onChange={(e) => setKadaluarsa(e.target.value)} /></Field>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>Batal</Button>
        <Button onClick={submit}>Simpan</Button>
      </div>
    </Modal>
  )
}

export default function Paket() {
  const db = useDb()
  const [produkModal, setProdukModal] = useState(false)
  const [editProduk, setEditProduk] = useState<PackageProduct | null>(null)
  const [beli, setBeli] = useState(false)
  const [editPaket, setEditPaket] = useState<MemberPackage | null>(null)
  const [hapus, setHapus] = useState<{ jenis: 'produk' | 'paket'; id: string; label: string } | null>(null)
  const paketRows = db.memberPackages.slice().sort((a, b) => b.tanggal_beli.localeCompare(a.tanggal_beli))
  const pg = usePagination(paketRows, 20)

  return (
    <div className="grid gap-6">
      <Card title="Master Paket" action={<Button onClick={() => setProdukModal(true)}>+ Tambah Paket</Button>}>
        <div className="grid gap-3 sm:grid-cols-3">
          {db.products.map((p) => (
            <div key={p.id} className="rounded-xl border border-line bg-cream-50 p-4">
              <div className="flex items-start justify-between">
                <div className="font-display text-lg font-bold">{p.nama}</div>
                {!p.aktif && <Badge label="Nonaktif" />}
              </div>
              <div className="mt-1 text-sm text-muted">{p.jumlah_sesi} sesi · masa aktif {p.masa_aktif_hari} hari</div>
              <div className="mt-2 font-display text-xl font-bold text-brand-900">{rupiah(p.harga)}</div>
              <div className="mt-3 flex gap-2">
                <Button variant="ghost" className="text-xs" onClick={() => setEditProduk(p)}>Edit</Button>
                <Button variant="ghost" className="text-xs text-red-700" onClick={() => setHapus({ jenis: 'produk', id: p.id, label: p.nama })}>Hapus</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card
        title="Paket Member"
        action={<Button onClick={() => setBeli(true)}>+ Beli Paket</Button>}
      >
        {db.memberPackages.length === 0 ? <Empty>Belum ada pembelian paket.</Empty> : (
          <div className="overflow-x-auto">
            <table className="rtable w-full min-w-[720px] text-sm">
              <thead>
                <tr className="text-left text-xs tracking-wide text-muted uppercase">
                  <th className="py-2 pr-4">Member</th><th className="py-2 pr-4">Paket</th><th className="py-2 pr-4">Mulai</th>
                  <th className="py-2 pr-4">Kadaluarsa</th><th className="py-2 pr-4">Sesi</th><th className="py-2 pr-4">Pembayaran</th><th className="py-2">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {pg.slice.map((mp) => (
                    <tr key={mp.id} className="border-t border-line">
                      <td className="py-3 pr-4 font-semibold"><Link className="hover:underline" to={`/member/${mp.member_id}`}>{namaMember(mp.member_id)}</Link></td>
                      <td className="py-3 pr-4">{namaProduk(mp.package_product_id)}</td>
                      <td className="py-3 pr-4">{labelTanggal(mp.tanggal_mulai)}</td>
                      <td className="py-3 pr-4">{labelTanggal(mp.tanggal_kadaluarsa)}</td>
                      <td className="py-3 pr-4 font-semibold">{mp.sesi_tersisa}/{mp.sesi_awal}</td>
                      <td className="py-3 pr-4"><Badge label={mp.status_pembayaran} /></td>
                      <td className="py-3">
                        {mp.status_pembayaran === 'Menunggu pembayaran' && mp.payment_id && (
                          <Button variant="secondary" className="!px-2.5 !py-1.5 text-xs" onClick={() => { const r = setStatusPembayaran(mp.payment_id!, 'Lunas'); r.ok ? toast.ok('Ditandai Lunas — paket siap dipakai.') : toast.err(r.error ?? 'Gagal.') }}>Tandai Lunas</Button>
                        )}{' '}
                        <Button variant="ghost" className="!px-2.5 !py-1.5 text-xs" onClick={() => setEditPaket(mp)}>Sesuaikan</Button>{' '}
                        <Button variant="ghost" className="!px-2.5 !py-1.5 text-xs text-red-700" onClick={() => setHapus({ jenis: 'paket', id: mp.id, label: `${namaProduk(mp.package_product_id)} — ${namaMember(mp.member_id)}` })}>Hapus</Button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
        <Pager p={pg} />
      </Card>

      {produkModal && <ProdukModal open onClose={() => setProdukModal(false)} />}
      {editProduk && <ProdukModal key={editProduk.id} open editing={editProduk} onClose={() => setEditProduk(null)} />}
      {beli && <BeliPaketModal open onClose={() => setBeli(false)} />}
      {editPaket && <UbahSesiPaketModal key={editPaket.id} pkg={editPaket} onClose={() => setEditPaket(null)} />}
      <Confirm
        open={!!hapus}
        title={`Hapus ${hapus?.label ?? ''}?`}
        message={hapus?.jenis === 'produk'
          ? 'Master paket hanya bisa dihapus bila belum pernah dibeli member. Bila sudah, nonaktifkan lewat Edit.'
          : 'Pembelian paket hanya bisa dihapus bila belum dipakai booking. Transaksi pembayaran yang terkait ikut terhapus.'}
        danger
        onCancel={() => setHapus(null)}
        onConfirm={() => {
          if (!hapus) return
          const r = hapus.jenis === 'produk' ? hapusProduk(hapus.id) : hapusPaketMember(hapus.id)
          r.ok ? toast.ok('Berhasil dihapus.') : toast.err(r.error ?? 'Gagal.')
          setHapus(null)
        }}
      />
    </div>
  )
}
