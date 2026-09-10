import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge, Button, Card, Confirm, Empty, Field, Modal, inputCls } from '../components/ui'
import {
  batalkanBooking, bookingBentrok, bookingMendatang, cekMemberByWa, createBooking, jumlahTerisi,
  kelasPublik, namaInstruktur, namaProduk, paketAktif, useDb,
} from '../data/db'
import type { ClassSession, Member } from '../types'
import { labelTanggal, linkWa, namaHari } from '../lib/format'
import { STUDIO, WA_TEMPLATES } from '../lib/config'
import { toast } from '../components/toast'


type Tab = 'kelas' | 'jadwal' | 'paket'

function BookModal({ member, session, onClose }: { member: Member; session: ClassSession; onClose: () => void }) {
  const db = useDb()
  const aktif = paketAktif(member.id)
  const [pkgId, setPkgId] = useState(aktif.length === 1 ? aktif[0].id : '')
  const [waitlist, setWaitlist] = useState(false)
  const [error, setError] = useState('')
  const penuh = jumlahTerisi(session.id) >= session.kapasitas
  const bentrok = bookingBentrok(member.id, session)
  const sesiBentrok = bentrok ? db.sessions.find((x) => x.id === bentrok.class_session_id) : null

  function submit() {
    if (aktif.length > 0 && !pkgId) { setError('Pilih paket yang ingin dipakai.'); return }
    if (aktif.length === 0) { setError('Kamu belum punya paket aktif. Hubungi admin untuk beli paket atau daftar drop-in.'); return }
    const res = createBooking(session.id, member.id, pkgId, { allowWaitlist: waitlist || penuh })
    if (!res.ok) { setError(res.error ?? 'Booking gagal.'); return }
    toast.ok(res.waitlisted
      ? 'Kamu masuk daftar tunggu. Admin akan menghubungi bila ada kursi kosong.'
      : `Berhasil! Kamu terdaftar di ${session.nama}, ${labelTanggal(session.tanggal)} pukul ${session.jam_mulai}.`)
    onClose()
  }

  return (
    <Modal title={session.nama} open onClose={onClose} onSubmit={submit}>
      <p className="text-sm text-muted">
        {namaHari(session.tanggal)}, {labelTanggal(session.tanggal)} · {session.jam_mulai}–{session.jam_selesai} · {namaInstruktur(session.instructor_id)}
        {session.lokasi ? ` · ${session.lokasi}` : ''} · {penuh ? 'KELAS PENUH' : `sisa ${session.kapasitas - jumlahTerisi(session.id)} kursi`}
      </p>

      <div className="mt-4 grid gap-4">
        {penuh && (
          <div className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Kelas sudah penuh. Kamu bisa masuk <b>daftar tunggu (waitlist)</b> — bila ada yang membatalkan, admin akan mempromosikanmu.
          </div>
        )}

        {aktif.length === 0 ? (
          <div className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Kamu belum punya paket aktif (Lunas, belum kadaluarsa, sisa sesi &gt; 0). Booking mandiri memerlukan paket aktif.{' '}
            <a className="font-semibold underline" href={linkWa(STUDIO.waAdmin, WA_TEMPLATES.beliPaket(member.nama_lengkap))} target="_blank" rel="noreferrer">
              Hubungi admin via WhatsApp
            </a>{' '}
            untuk beli paket atau daftar drop-in (Rp150.000/kelas).
          </div>
        ) : (
          <Field label={aktif.length === 1 ? 'Paket yang dipakai (otomatis)' : 'Pilih paket yang dipakai'} required>
            <select className={inputCls} value={pkgId} onChange={(e) => { setPkgId(e.target.value); setError('') }}>
              <option value="">— Pilih paket —</option>
              {aktif.map((p) => (
                <option key={p.id} value={p.id}>
                  {namaProduk(p.package_product_id)} — sisa {p.sesi_tersisa} sesi, kadaluarsa {labelTanggal(p.tanggal_kadaluarsa)}
                </option>
              ))}
            </select>
          </Field>
        )}

        {penuh && (
          <label className="flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" checked={waitlist} onChange={(e) => setWaitlist(e.target.checked)} />
            Daftarkan saya ke daftar tunggu
          </label>
        )}

        {sesiBentrok && (
          <div className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Perhatian: kamu juga punya booking lain di jam yang berbenturan ({sesiBentrok.nama}).
          </div>
        )}
        {error && <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>Tutup</Button>
        <Button
          onClick={submit}
          disabled={aktif.length === 0 || (aktif.length > 0 && !pkgId) || (penuh && !waitlist)}
        >
          {penuh ? (waitlist ? 'Masuk Waitlist' : 'Kelas Penuh') : 'Booking Sekarang'}
        </Button>
      </div>
    </Modal>
  )
}

export default function CustomerBooking() {
  const db = useDb()
  const [wa, setWa] = useState('')
  const [member, setMember] = useState<Member | null>(null)
  const [gagal, setGagal] = useState('')
  const [tab, setTab] = useState<Tab>('kelas')
  const [bookId, setBookId] = useState<string | null>(null)
  const [cancelId, setCancelId] = useState<string | null>(null)

  function masuk() {
    const m = cekMemberByWa(wa)
    if (!m) {
      setGagal('Nomor tidak ditemukan atau member tidak aktif. Pastikan memakai nomor WhatsApp yang terdaftar, atau hubungi admin untuk mendaftar.')
      return
    }
    setGagal('')
    setMember(m)
    setTab('kelas')
  }

  const kelas = member ? kelasPublik() : []
  const kelasByTanggal = kelas.reduce<Record<string, typeof kelas>>((acc, s) => {
    ;(acc[s.tanggal] ??= []).push(s)
    return acc
  }, {})
  const jadwalSaya = member ? bookingMendatang(member.id) : []
  const paketSaya = member
    ? db.memberPackages.filter((p) => p.member_id === member.id).sort((a, b) => b.tanggal_beli.localeCompare(a.tanggal_beli))
    : []
  const today = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Jakarta' }).format(new Date())
  const sessionDibook = bookId ? db.sessions.find((s) => s.id === bookId) : null

  return (
    <div className="min-h-screen bg-cream-50">
      <header className="bg-brand-950 px-5 py-5 text-cream-50">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div>
            <div className="font-display text-2xl font-bold">Sawiji</div>
            <div className="text-[10px] tracking-widest text-rose-100/80 uppercase">Studio Pilates</div>
          </div>
          {member ? (
            <Button variant="ghost" className="!border-brand-800 !bg-brand-800 !text-cream-50 text-xs" onClick={() => { setMember(null); setWa('') }}>
              Ganti nomor
            </Button>
          ) : (
            <Link to="/" className="text-xs text-rose-100/70 hover:text-white">Untuk Admin</Link>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        {!member ? (
          <Card title="Masuk untuk Booking">
            <p className="mb-4 text-sm text-muted">
              Booking mandiri khusus member terdaftar {STUDIO.namaLengkap}. Cukup masukkan nomor WhatsApp yang terdaftar — tanpa kata sandi.
            </p>
            <div className="grid gap-3">
              <Field label="Nomor WhatsApp terdaftar" required>
                <input
                  className={inputCls}
                  placeholder="08xxxxxxxxxx"
                  inputMode="numeric"
                  value={wa}
                  onChange={(e) => setWa(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && masuk()}
                />
              </Field>
              {gagal && <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{gagal}</div>}
              <Button onClick={masuk}>Masuk</Button>
              <p className="text-xs text-muted">
                Belum jadi member?{' '}
                <a className="font-semibold text-brand-700 underline" href={linkWa(STUDIO.waAdmin, WA_TEMPLATES.daftarMember())} target="_blank" rel="noreferrer">
                  Hubungi kami via WhatsApp
                </a>
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid gap-5">
            <div className="grid grid-cols-3 gap-2 rounded-2xl border border-line bg-white p-1.5 shadow-sm">
              {([['kelas', 'Kelas Tersedia'], ['jadwal', 'Jadwal Saya'], ['paket', 'Paket Saya']] as Array<[Tab, string]>).map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`cursor-pointer rounded-xl px-2 py-2 text-xs font-semibold transition-colors sm:text-sm ${tab === id ? 'bg-brand-900 text-cream-50' : 'text-muted hover:bg-cream-100'}`}
                >
                  {label}
                </button>
              ))}
            </div>

            <p className="-mt-2 text-xs text-muted">Masuk sebagai <span className="font-semibold text-ink">{member.nama_lengkap}</span></p>

            {tab === 'kelas' && (
              kelas.length === 0 ? <Empty>Belum ada jadwal kelas mendatang.</Empty> : (
                <div className="grid gap-5">
                  {Object.entries(kelasByTanggal).map(([tgl, list]) => (
                    <Card key={tgl} title={`${namaHari(tgl)}, ${labelTanggal(tgl)}`}>
                      <div className="grid gap-3">
                        {list.map((s) => {
                          const sudah = jadwalSaya.some((b) => b.class_session_id === s.id)
                          return (
                            <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-cream-50 px-4 py-3">
                              <div className="min-w-0">
                                <div className="font-semibold">{s.jam_mulai}–{s.jam_selesai} · {s.nama}</div>
                                <div className="text-sm text-muted">
                                  {namaInstruktur(s.instructor_id)}{s.lokasi ? ` · ${s.lokasi}` : ''} · {s.penuh ? 'PENUH — bisa masuk waitlist' : `sisa ${s.sisa} kursi`}
                                </div>
                              </div>
                              {sudah ? (
                                <Badge label="Sudah dibooking" />
                              ) : (
                                <Button variant="secondary" className="text-xs" onClick={() => setBookId(s.id)}>
                                  {s.penuh ? 'Waitlist' : 'Book'}
                                </Button>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </Card>
                  ))}
                </div>
              )
            )}

            {tab === 'jadwal' && (
              <Card title="Booking Mendatang">
                {jadwalSaya.length === 0 ? <Empty>Belum ada booking mendatang. Yuk book kelas!</Empty> : (
                  <div className="grid gap-3">
                    {jadwalSaya.map((b) => (
                      <div key={b.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-cream-50 px-4 py-3">
                        <div className="min-w-0">
                          <div className="font-semibold">{b.sesi.nama} · {b.sesi.jam_mulai}–{b.sesi.jam_selesai}</div>
                          <div className="text-sm text-muted">{namaHari(b.sesi.tanggal)}, {labelTanggal(b.sesi.tanggal)} · {namaInstruktur(b.sesi.instructor_id)}</div>
                          {b.status === 'Waitlist' && <div className="text-xs text-amber-700">Kamu di daftar tunggu — admin akan menghubungi bila ada kursi.</div>}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge label={b.status} />
                          <Button variant="ghost" className="text-xs" onClick={() => setCancelId(b.id)}>Batal</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}

            {tab === 'paket' && (
              <Card title="Paket Saya">
                {paketSaya.length === 0 ? <Empty>Belum punya paket. Hubungi admin untuk beli.</Empty> : (
                  <div className="grid gap-3">
                    {paketSaya.map((p) => {
                      const expired = p.tanggal_kadaluarsa < today
                      return (
                        <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-cream-50 px-4 py-3">
                          <div>
                            <div className="font-semibold">{namaProduk(p.package_product_id)}</div>
                            <div className="text-sm text-muted">
                              {expired
                                ? <span className="text-red-600">kadaluarsa {labelTanggal(p.tanggal_kadaluarsa)}</span>
                                : `kadaluarsa ${labelTanggal(p.tanggal_kadaluarsa)}`}
                              {p.status_pembayaran !== 'Lunas' && <span className="ml-1 text-amber-700">· menunggu pembayaran</span>}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-display text-lg font-bold text-brand-900">{p.sesi_tersisa}<span className="text-sm text-muted">/{p.sesi_awal}</span></div>
                            <div className="text-xs text-muted">sesi tersisa</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
                <p className="mt-3 text-xs text-muted">Sesi berkurang otomatis saat kamu check-in di studio.</p>
              </Card>
            )}
          </div>
        )}
      </main>

      {member && sessionDibook && (
        <BookModal key={sessionDibook.id} member={member} session={sessionDibook} onClose={() => setBookId(null)} />
      )}
      <Confirm
        open={!!cancelId}
        title="Batalkan booking ini?"
        message="Booking akan dibatalkan dan kursi di kelas dikosongkan. Sesi paketmu tidak terpotong."
        danger
        onCancel={() => setCancelId(null)}
        onConfirm={() => {
          const b = jadwalSaya.find((x) => x.id === cancelId)
          const r = batalkanBooking(cancelId!)
          r.ok ? toast.ok(`Booking ${b?.sesi.nama ?? ''} dibatalkan. Sesi paketmu tetap utuh.`) : toast.err(r.error ?? 'Gagal membatalkan.')
          setCancelId(null)
        }}
      />
    </div>
  )
}
