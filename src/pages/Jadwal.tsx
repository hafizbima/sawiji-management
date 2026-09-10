import { useMemo, useState } from 'react'
import { Badge, Button, Card, Confirm, Empty, Field, Modal, inputCls } from '../components/ui'
import {
  batalCheckin, batalkanBooking, bookingBentrok, checkinBooking, createBooking, duplikatMingguan, hapusSesi, jumlahTerisi,
  kelasPenuh, namaInstruktur, namaMember, namaProduk, paketAktif, pesertaKelas, potongSesiNoShow,
  promosikanWaitlist, tandaiNoShow, tambahSesi, ubahSesi, useDb, waitlistKelas,
} from '../data/db'
import type { ClassSession } from '../types'
import { awalMinggu, labelTanggal, linkWa, namaHari, rupiah, tambahHari, todayWIB } from '../lib/format'
import { WA_TEMPLATES } from '../lib/config'
import { toast } from '../components/toast'

const hariShort = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Aha']

interface SesiForm {
  nama: string; tanggal: string; jam_mulai: string; jam_selesai: string
  instructor_id: string; kapasitas: string; lokasi: string; catatan: string
}

function SesiModal({ open, editing, onClose }: { open: boolean; editing?: ClassSession; onClose: () => void }) {
  const db = useDb()
  const [f, setF] = useState<SesiForm>(editing ? {
    nama: editing.nama, tanggal: editing.tanggal, jam_mulai: editing.jam_mulai, jam_selesai: editing.jam_selesai,
    instructor_id: editing.instructor_id, kapasitas: String(editing.kapasitas), lokasi: editing.lokasi ?? '', catatan: editing.catatan ?? '',
  } : {
    nama: 'Reformer Fundamental', tanggal: todayWIB(), jam_mulai: '07:00', jam_selesai: '08:00',
    instructor_id: db.instructors[0]?.id ?? '', kapasitas: '5', lokasi: 'Studio A', catatan: '',
  })
  const [err, setErr] = useState<Record<string, string>>({})
  const set = (k: keyof SesiForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value })

  function submit() {
    const e: Record<string, string> = {}
    if (!f.nama.trim()) e.nama = 'Nama kelas wajib diisi.'
    if (!f.tanggal) e.tanggal = 'Tanggal wajib diisi.'
    if (!f.jam_mulai) e.jam_mulai = 'Jam mulai wajib diisi.'
    if (!f.jam_selesai) e.jam_selesai = 'Jam selesai wajib diisi.'
    if (f.jam_mulai && f.jam_selesai && f.jam_selesai <= f.jam_mulai) e.jam_selesai = 'Jam selesai harus setelah jam mulai.'
    if (!f.instructor_id) e.instructor_id = 'Instruktur wajib dipilih.'
    const kap = Number(f.kapasitas)
    if (!Number.isInteger(kap) || kap < 1) e.kapasitas = 'Kapasitas harus bilangan bulat minimal 1.'
    setErr(e)
    if (Object.keys(e).length > 0) return
    const payload = { ...f, kapasitas: kap, lokasi: f.lokasi || undefined, catatan: f.catatan || undefined }
    const res = editing ? ubahSesi(editing.id, payload) : tambahSesi(payload)
    if (!res.ok) { setErr({ nama: res.error ?? 'Gagal menyimpan.' }); return }
    toast.ok(editing ? 'Kelas diperbarui.' : 'Kelas dibuat.')
    onClose()
  }

  return (
    <Modal title={editing ? 'Edit Kelas' : 'Buat Kelas'} open={open} onClose={onClose} onSubmit={submit}>
      <div className="grid gap-4">
        <Field label="Nama / jenis kelas" required error={err.nama}>
          <input className={inputCls} value={f.nama} onChange={set('nama')} />
        </Field>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Field label="Tanggal" required error={err.tanggal}>
            <input type="date" className={inputCls} value={f.tanggal} onChange={set('tanggal')} />
          </Field>
          <Field label="Jam mulai" required error={err.jam_mulai}>
            <input type="time" className={inputCls} value={f.jam_mulai} onChange={set('jam_mulai')} />
          </Field>
          <Field label="Jam selesai" required error={err.jam_selesai}>
            <input type="time" className={inputCls} value={f.jam_selesai} onChange={set('jam_selesai')} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Instruktur" required error={err.instructor_id}>
            <select className={inputCls} value={f.instructor_id} onChange={set('instructor_id')}>
              {db.instructors.filter((i) => i.aktif || i.id === f.instructor_id).map((i) => <option key={i.id} value={i.id}>{i.nama}</option>)}
            </select>
          </Field>
          <Field label="Kapasitas" required error={err.kapasitas}>
            <input inputMode="numeric" className={inputCls} value={f.kapasitas} onChange={set('kapasitas')} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Lokasi / ruang">
            <input className={inputCls} value={f.lokasi} onChange={set('lokasi')} />
          </Field>
          <Field label="Catatan">
            <input className={inputCls} value={f.catatan} onChange={set('catatan')} />
          </Field>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>Batal</Button>
        <Button onClick={submit}>Simpan</Button>
      </div>
    </Modal>
  )
}
function BookingModal({ session, onClose }: { session: ClassSession; onClose: () => void }) {
  const db = useDb()
  const [memberId, setMemberId] = useState('')
  const [pkgId, setPkgId] = useState('')
  const [dropin, setDropin] = useState(false)
  const [waitlist, setWaitlist] = useState(false)
  const [error, setError] = useState('')

  const member = db.members.find((m) => m.id === memberId)
  const aktifPaket = member ? paketAktif(member.id) : []
  const penuh = kelasPenuh(session)
  const dropinHarga = db.products.find((p) => p.nama.toLowerCase().includes('drop'))?.harga ?? 0

  function submit() {
    if (!memberId) { setError('Pilih member terlebih dahulu.'); return }
    if (!dropin && !pkgId) { setError('Pilih paket yang dipakai, atau centang booking drop-in.'); return }
    const res = createBooking(session.id, memberId, dropin ? null : pkgId, { allowWaitlist: waitlist })
    if (!res.ok) { setError(res.error ?? 'Gagal booking.'); return }
    toast.ok(res.waitlisted ? 'Masuk waitlist.' : 'Booking berhasil.')
    if (res.warning) toast.warn(res.warning)
    onClose()
  }

  return (
    <Modal title={`Booking — ${session.nama}`} open onClose={onClose} onSubmit={submit} wide>
      <p className="mb-4 text-sm text-muted">
        {namaHari(session.tanggal)}, {labelTanggal(session.tanggal)} · {session.jam_mulai}–{session.jam_selesai} · {namaInstruktur(session.instructor_id)}
        {session.lokasi ? ` · ${session.lokasi}` : ''} · terisi {jumlahTerisi(session.id)}/{session.kapasitas}
      </p>
      <div className="grid gap-4">
        <Field label="Member" required>
          <select className={inputCls} value={memberId} onChange={(e) => { setMemberId(e.target.value); setPkgId(''); setDropin(false); setError('') }}>
            <option value="">— Pilih member —</option>
            {db.members.filter((m) => m.aktif).map((m) => <option key={m.id} value={m.id}>{m.nama_lengkap}</option>)}
          </select>
        </Field>

        {member && (
          <>
            {aktifPaket.length > 0 && (
              <Field label={aktifPaket.length === 1 ? 'Paket dipakai (otomatis)' : 'Pilih paket yang dipakai'} required={!dropin}>
                <select className={inputCls} value={pkgId} onChange={(e) => { setPkgId(e.target.value); setError('') }} disabled={dropin}>
                  <option value="">— Pilih paket —</option>
                  {aktifPaket.map((p) => (
                    <option key={p.id} value={p.id}>
                      {namaProduk(p.package_product_id)} — sisa {p.sesi_tersisa} sesi, exp {labelTanggal(p.tanggal_kadaluarsa)}
                    </option>
                  ))}
                </select>
              </Field>
            )}
            {aktifPaket.length === 0 && !dropin && (
              <div className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">
                {member.nama_lengkap} tidak punya paket aktif. Gunakan booking drop-in, atau belikan paket terlebih dahulu di halaman Paket.
              </div>
            )}
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" checked={dropin} onChange={(e) => { setDropin(e.target.checked); setError('') }} />
              Booking drop-in ({rupiah(dropinHarga)} — transaksi lunas otomatis tercatat)
            </label>
            {penuh && (
              <label className="flex items-center gap-2 text-sm font-medium">
                <input type="checkbox" checked={waitlist} onChange={(e) => setWaitlist(e.target.checked)} />
                Kelas penuh — daftarkan ke waitlist bila kuota penuh
              </label>
            )}
            {(() => {
              const b = bookingBentrok(member.id, session)
              return b ? (
                <div className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">
                  Perhatian: member punya booking lain pada jam yang berbenturan ({labelTanggal(db.sessions.find((x) => x.id === b.class_session_id)!.tanggal)}).
                </div>
              ) : null
            })()}
          </>
        )}
        {error && <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>Batal</Button>
        <Button onClick={submit}>Booking</Button>
      </div>
    </Modal>
  )
}

function DetailKelasModal({ session, onClose }: { session: ClassSession; onClose: () => void }) {
  const db = useDb()
  const [booking, setBooking] = useState(false)
  const [aksi, setAksi] = useState<{ kind: 'batal' | 'noshow' | 'potong' | 'undo'; id: string; nama: string } | null>(null)
  const peserta = pesertaKelas(session.id)
  const waitlist = waitlistKelas(session.id)

  function runAksi() {
    if (!aksi) return
    const fn = { batal: batalkanBooking, noshow: tandaiNoShow, potong: potongSesiNoShow, undo: batalCheckin }[aksi.kind]
    const r = fn(aksi.id)
    r.ok ? toast.ok('Tersimpan.') : toast.err(r.error ?? 'Gagal.')
    setAksi(null)
  }

  const msgAksi: Record<string, string> = {
    batal: 'Booking akan dibatalkan. Sesi paket tidak terpotong karena belum check-in.',
    noshow: 'Tandai peserta sebagai no-show? Sesi belum terpotong.',
    potong: 'Potong 1 sesi dari paket peserta sebagai konsekuensi no-show?',
    undo: 'Pembatalan check-in akan mengembalikan 1 sesi ke paket peserta.',
  }

  return (
    <Modal title={session.nama} open onClose={onClose} wide>
      <p className="text-sm text-muted">
        {namaHari(session.tanggal)}, {labelTanggal(session.tanggal)} · {session.jam_mulai}–{session.jam_selesai} · {namaInstruktur(session.instructor_id)}
        {session.lokasi ? ` · ${session.lokasi}` : ''}{session.catatan ? ` · ${session.catatan}` : ''}
      </p>
      <p className="mt-1 text-sm font-semibold">Terisi {peserta.length}/{session.kapasitas}</p>

      <div className="mt-4">
        <h4 className="mb-2 text-sm font-semibold">Peserta</h4>
        {peserta.length === 0 ? <Empty>Belum ada peserta.</Empty> : (
          <div className="overflow-x-auto">
          <table className="rtable w-full min-w-[480px] text-sm">
            <tbody>
              {peserta.map((b) => (
                <tr key={b.id} className="border-t border-line">
                  <td className="py-2.5 pr-4 font-medium">{namaMember(b.member_id)}</td>
                  <td className="py-2.5 pr-4"><Badge label={b.status} /></td>
                  <td className="py-2.5 pr-4 text-xs text-muted">
                    {b.status === 'Hadir' && b.waktu_checkin ? `check-in ${jam2(b.waktu_checkin)}` : b.member_package_id ? 'paket' : 'drop-in'}
                  </td>
                  <td className="py-2.5 text-right">
                    <div className="flex justify-end gap-1.5">
                      {b.status === 'Terkonfirmasi' && (
                        <>
                          <Button variant="secondary" className="!px-2.5 !py-1.5 text-xs" onClick={() => { const r = checkinBooking(b.id); r.ok ? toast.ok(`${namaMember(b.member_id)} check-in.`) : toast.err(r.error ?? 'Gagal.') }}>Check-in</Button>
                          <Button variant="ghost" className="!px-2.5 !py-1.5 text-xs" onClick={() => setAksi({ kind: 'noshow', id: b.id, nama: namaMember(b.member_id) })}>No-show</Button>
                        </>
                      )}
                      {b.status === 'Hadir' && (
                        <Button variant="ghost" className="!px-2.5 !py-1.5 text-xs" onClick={() => setAksi({ kind: 'undo', id: b.id, nama: namaMember(b.member_id) })}>Batal check-in</Button>
                      )}
                      {b.status === 'No-show' && !b.no_show_dipotong && b.member_package_id && (
                        <Button variant="ghost" className="!px-2.5 !py-1.5 text-xs" onClick={() => setAksi({ kind: 'potong', id: b.id, nama: namaMember(b.member_id) })}>Potong sesi</Button>
                      )}
                      {(b.status === 'Terkonfirmasi' || b.status === 'Waitlist') && (
                        <Button variant="ghost" className="!px-2.5 !py-1.5 text-xs" onClick={() => setAksi({ kind: 'batal', id: b.id, nama: namaMember(b.member_id) })}>Batalkan</Button>
                      )}
                      <a href={linkWa(db.members.find((m) => m.id === b.member_id)?.nomor_whatsapp ?? '', WA_TEMPLATES.pengingatKelas(session.nama, labelTanggal(session.tanggal), session.jam_mulai))} target="_blank" rel="noreferrer">
                        <Button variant="ghost" className="!px-2.5 !py-1.5 text-xs">WA</Button>
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>

      {waitlist.length > 0 && (
        <div className="mt-5">
          <h4 className="mb-2 text-sm font-semibold">Waitlist ({waitlist.length})</h4>
          <div className="overflow-x-auto">
          <table className="rtable w-full min-w-[360px] text-sm">
            <tbody>
              {waitlist.map((b) => (
                <tr key={b.id} className="border-t border-line">
                  <td className="py-2.5 pr-4 font-medium">{namaMember(b.member_id)}</td>
                  <td className="py-2.5 pr-4"><Badge label="Waitlist" /></td>
                  <td className="py-2.5 text-right">
                    <div className="flex justify-end gap-1.5">
                      <Button variant="secondary" className="!px-2.5 !py-1.5 text-xs" onClick={() => { const r = promosikanWaitlist(b.id); r.ok ? toast.ok('Dipromosikan ke Terkonfirmasi.') : toast.err(r.error ?? 'Gagal.') }}>Promosikan</Button>
                      <Button variant="ghost" className="!px-2.5 !py-1.5 text-xs" onClick={() => setAksi({ kind: 'batal', id: b.id, nama: namaMember(b.member_id) })}>Batalkan</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-between">
        <Button variant="ghost" onClick={onClose}>Tutup</Button>
        <Button onClick={() => setBooking(true)}>+ Booking Peserta</Button>
      </div>

      {booking && <BookingModal session={session} onClose={() => setBooking(false)} />}
      <Confirm open={!!aksi} title={aksi?.nama ?? ''} message={aksi ? msgAksi[aksi.kind] : ''} danger={aksi?.kind === 'batal' || aksi?.kind === 'potong'} onCancel={() => setAksi(null)} onConfirm={runAksi} />
    </Modal>
  )
}

function jam2(iso: string): string {
  return new Intl.DateTimeFormat('id-ID', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit' }).format(new Date(iso)).replace('.', ':')
}

export default function Jadwal() {
  const db = useDb()
  const [minggu, setMinggu] = useState(() => awalMinggu(todayWIB()))
  const [hari, setHari] = useState(() => todayWIB())
  const [sesiModal, setSesiModal] = useState(false)
  const [detail, setDetail] = useState<ClassSession | null>(null)
  const [editSesi, setEditSesi] = useState<ClassSession | null>(null)
  const [hapus, setHapus] = useState<ClassSession | null>(null)

  const hariList = useMemo(() => Array.from({ length: 7 }, (_, i) => tambahHari(minggu, i)), [minggu])
  const sesiHari = db.sessions
    .filter((s) => s.tanggal === hari)
    .sort((a, b) => a.jam_mulai.localeCompare(b.jam_mulai))

  return (
    <div className="grid gap-6">
      <Card
        title="Kalender Mingguan"
        action={
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setMinggu(tambahHari(minggu, -7))}>←</Button>
            <Button variant="ghost" onClick={() => { const w = awalMinggu(todayWIB()); setMinggu(w); setHari(todayWIB()) }}>Minggu ini</Button>
            <Button variant="ghost" onClick={() => setMinggu(tambahHari(minggu, 7))}>→</Button>
            <Button variant="secondary" onClick={() => {
              const r = duplikatMingguan(minggu)
              if (!r.ok) toast.err(r.error ?? 'Gagal.')
              else toast.ok(`${r.dibuat} kelas disalin ke minggu depan${r.dilewati ? `, ${r.dilewati} dilewati (sudah ada)` : ''}.`)
            }}>Salin ke minggu depan</Button>
          </div>
        }
      >
        <div className="-mx-1 overflow-x-auto px-1 pb-1 max-[639px]:overflow-visible">
          <div className="grid grid-cols-2 gap-2 min-[640px]:min-w-[700px] min-[640px]:grid-cols-7">
          {hariList.map((d, i) => {
            const list = db.sessions.filter((s) => s.tanggal === d)
            const isToday = d === todayWIB()
            return (
              <button
                key={d}
                onClick={() => setHari(d)}
                className={`cursor-pointer rounded-xl border p-2.5 text-left transition-colors ${d === hari ? 'border-brand-700 bg-rose-100' : 'border-line bg-cream-50 hover:bg-cream-100'}`}
              >
                <div className={`text-xs font-semibold ${isToday ? 'text-brand-700' : 'text-muted'}`}>{hariShort[i]}{isToday ? ' · hari ini' : ''}</div>
                <div className="text-sm font-bold">{labelTanggal(d).split(', ')[1]}</div>
                <div className="mt-1 space-y-1">
                  {list.slice(0, 3).map((s) => (
                    <div key={s.id} className="truncate rounded bg-white px-1.5 py-0.5 text-[11px] text-muted">
                      {s.jam_mulai} {s.nama}
                    </div>
                  ))}
                  {list.length > 3 && <div className="text-[11px] text-muted">+{list.length - 3} lainnya</div>}
                </div>
              </button>
            )
          })}
          </div>
        </div>
      </Card>

      <Card
        title={`List Harian — ${namaHari(hari)}, ${labelTanggal(hari)}`}
        action={<Button onClick={() => setSesiModal(true)}>+ Buat Kelas</Button>}
      >
        {sesiHari.length === 0 ? (
          <Empty>Belum ada kelas pada hari ini.</Empty>
        ) : (
          <div className="grid gap-3">
            {sesiHari.map((s) => {
              const terisi = jumlahTerisi(s.id)
              return (
                <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-cream-50 px-4 py-3">
                  <div>
                    <div className="font-semibold">{s.jam_mulai}–{s.jam_selesai} · {s.nama}</div>
                    <div className="text-sm text-muted">
                      {namaInstruktur(s.instructor_id)}{s.lokasi ? ` · ${s.lokasi}` : ''} · {terisi}/{s.kapasitas} peserta
                      {kelasPenuh(s) ? ' · PENUH' : ''}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => setDetail(s)}>Detail</Button>
                    <Button variant="ghost" onClick={() => setEditSesi(s)}>Edit</Button>
                    <Button variant="ghost" onClick={() => setHapus(s)}>Hapus</Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      {sesiModal && <SesiModal open onClose={() => setSesiModal(false)} />}
      {editSesi && <SesiModal key={editSesi.id} open editing={editSesi} onClose={() => setEditSesi(null)} />}
      {detail && <DetailKelasModal key={detail.id} session={detail} onClose={() => setDetail(null)} />}
      <Confirm
        open={!!hapus}
        title="Hapus kelas?"
        message={hapus ? `Hapus ${hapus.nama} ${labelTanggal(hapus.tanggal)} ${hapus.jam_mulai}? Kelas yang masih punya peserta tidak bisa dihapus.` : ''}
        danger
        onCancel={() => setHapus(null)}
        onConfirm={() => { const r = hapusSesi(hapus!.id); r.ok ? toast.ok('Kelas dihapus.') : toast.err(r.error ?? 'Gagal.'); setHapus(null) }}
      />
    </div>
  )
}
