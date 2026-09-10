import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Badge, Button, Card, Confirm, Empty } from '../components/ui'
import { MemberFormModal } from './Member'
import { batalkanBooking, hapusMember, namaProduk, paketAktif, useDb } from '../data/db'
import { labelTanggal, linkWa, rupiah } from '../lib/format'
import { WA_TEMPLATES } from '../lib/config'
import { toast } from '../components/toast'

export default function MemberDetail() {
  const { id } = useParams()
  const db = useDb()
  const navigate = useNavigate()
  const m = db.members.find((x) => x.id === id)
  const [edit, setEdit] = useState(false)
  const [hapus, setHapus] = useState(false)
  const [cancelId, setCancelId] = useState<string | null>(null)

  if (!m) return <Empty>Member tidak ditemukan. <Link to="/member" className="underline">Kembali</Link></Empty>

  const bookings = db.bookings
    .filter((b) => b.member_id === m.id)
    .map((b) => ({ b, s: db.sessions.find((s) => s.id === b.class_session_id) }))
    .sort((a, b) => (b.s!.tanggal + b.s!.jam_mulai).localeCompare(a.s!.tanggal + a.s!.jam_mulai))
  const pakets = db.memberPackages.filter((p) => p.member_id === m.id).sort((a, b) => b.tanggal_beli.localeCompare(a.tanggal_beli))
  const payments = db.payments.filter((p) => p.member_id === m.id).sort((a, b) => b.tanggal.localeCompare(a.tanggal))

  return (
    <div className="grid gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link to="/member" className="text-sm text-muted hover:underline">← Daftar Member</Link>
          <h2 className="mt-1 font-display text-2xl font-bold">{m.nama_lengkap}</h2>
          <div className="text-sm text-muted">
            {m.nomor_whatsapp}{m.instagram ? ` · @${m.instagram.replace('@', '')}` : ''} · <Badge label={m.aktif ? 'Aktif' : 'Nonaktif'} />
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setEdit(true)}>Edit</Button>
          <Button variant="ghost" className="text-red-700" onClick={() => setHapus(true)}>Hapus</Button>
          <a href={linkWa(m.nomor_whatsapp, WA_TEMPLATES.sapaan(m.nama_lengkap))} target="_blank" rel="noreferrer">
            <Button>Chat WhatsApp</Button>
          </a>
        </div>
      </div>

      {(m.kondisi_khusus || m.catatan_admin || m.tanggal_lahir) && (
        <Card title="Catatan Penting">
          <ul className="grid gap-1.5 text-sm">
            {m.tanggal_lahir && <li>🎂 Lahir: {labelTanggal(m.tanggal_lahir)}</li>}
            {m.kondisi_khusus && <li>⚠️ Kondisi khusus: {m.kondisi_khusus}</li>}
            {m.catatan_admin && <li>📝 Catatan admin: {m.catatan_admin}</li>}
          </ul>
        </Card>
      )}

      <Card title="Paket">
        {pakets.length === 0 ? <Empty>Belum punya paket.</Empty> : (
          <div className="overflow-x-auto">
            <table className="rtable w-full min-w-[520px] text-sm">
              <thead><tr className="text-left text-xs text-muted uppercase"><th className="py-2 pr-4">Paket</th><th className="py-2 pr-4">Beli</th><th className="py-2 pr-4">Kadaluarsa</th><th className="py-2 pr-4">Sesi</th><th className="py-2 pr-4">Harga</th><th className="py-2">Pembayaran</th></tr></thead>
              <tbody>
                {pakets.map((p) => (
                  <tr key={p.id} className="border-t border-line">
                    <td className="py-3 pr-4 font-semibold">{namaProduk(p.package_product_id)}</td>
                    <td className="py-3 pr-4">{labelTanggal(p.tanggal_beli)}</td>
                    <td className="py-3 pr-4">{labelTanggal(p.tanggal_kadaluarsa)}</td>
                    <td className="py-3 pr-4">{p.sesi_tersisa}/{p.sesi_awal}</td>
                    <td className="py-3 pr-4">{rupiah(p.harga_aktual)}</td>
                    <td className="py-3"><Badge label={p.status_pembayaran} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="mt-2 text-xs text-muted">Paket aktif sekarang: {paketAktif(m.id).length}</div>
      </Card>

      <Card title="Riwayat Booking">
        {bookings.length === 0 ? <Empty>Belum ada booking.</Empty> : (
          <div className="overflow-x-auto">
            <table className="rtable w-full min-w-[520px] text-sm">
              <thead><tr className="text-left text-xs text-muted uppercase"><th className="py-2 pr-4">Kelas</th><th className="py-2 pr-4">Tanggal</th><th className="py-2 pr-4">Status</th><th className="py-2">Aksi</th></tr></thead>
              <tbody>
                {bookings.map(({ b, s }) => (
                  <tr key={b.id} className="border-t border-line">
                    <td className="py-3 pr-4 font-semibold">{s!.nama} · {s!.jam_mulai}</td>
                    <td className="py-3 pr-4">{labelTanggal(s!.tanggal)}</td>
                    <td className="py-3 pr-4"><Badge label={b.status} /></td>
                    <td className="py-3">
                      {(b.status === 'Terkonfirmasi' || b.status === 'Waitlist') && (
                        <Button variant="ghost" className="!px-2.5 !py-1.5 text-xs" onClick={() => setCancelId(b.id)}>Batalkan</Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card title="Riwayat Pembayaran">
        {payments.length === 0 ? <Empty>Belum ada pembayaran.</Empty> : (
          <div className="overflow-x-auto">
            <table className="rtable w-full min-w-[480px] text-sm">
            <thead><tr className="text-left text-xs text-muted uppercase"><th className="py-2 pr-4">Nomor</th><th className="py-2 pr-4">Tanggal</th><th className="py-2 pr-4">Item</th><th className="py-2 pr-4">Nominal</th><th className="py-2">Status</th></tr></thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-t border-line">
                  <td className="py-3 pr-4 font-mono text-xs">{p.nomor}</td>
                  <td className="py-3 pr-4">{labelTanggal(p.tanggal)}</td>
                  <td className="py-3 pr-4">{p.keterangan}</td>
                  <td className="py-3 pr-4 font-semibold">{rupiah(p.nominal)}</td>
                  <td className="py-3"><Badge label={p.status} /></td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        )}
      </Card>

      {edit && <MemberFormModal key={m.id} open editing={m} onClose={() => setEdit(false)} />}
      <Confirm
        open={!!cancelId}
        title="Batalkan booking?"
        message="Booking akan dibatalkan. Sesi paket tidak terpotong karena belum check-in."
        danger
        onCancel={() => setCancelId(null)}
        onConfirm={() => { const r = batalkanBooking(cancelId!); r.ok ? toast.ok('Booking dibatalkan.') : toast.err(r.error ?? 'Gagal.'); setCancelId(null) }}
      />
      <Confirm
        open={hapus}
        title={`Hapus member ${m.nama_lengkap}?`}
        message="Hanya member yang belum punya riwayat booking/paket/pembayaran yang bisa dihapus. Member dengan riwayat sebaiknya dinonaktifkan lewat Edit."
        danger
        onCancel={() => setHapus(false)}
        onConfirm={() => {
          const r = hapusMember(m.id)
          setHapus(false)
          if (r.ok) { toast.ok('Member dihapus.'); navigate('/member') } else toast.err(r.error ?? 'Gagal.')
        }}
      />
    </div>
  )
}
