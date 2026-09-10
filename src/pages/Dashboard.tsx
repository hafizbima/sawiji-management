import { Link, useNavigate } from 'react-router-dom'
import { Badge, Button, Card, Empty, Stat } from '../components/ui'
import {
  kelasPenuh, namaInstruktur, namaMember, namaProduk, paketAktif,
  pesertaKelas, setStatusPembayaran, useDb, waitlistKelas,
} from '../data/db'
import { daysUntil, labelTanggal, linkWa, nowHM, rupiah, tambahHari, todayWIB } from '../lib/format'
import { WA_TEMPLATES } from '../lib/config'
import { toast } from '../components/toast'


export default function Dashboard() {
  const db = useDb()
  const navigate = useNavigate()
  const t = todayWIB()
  const now = nowHM()

  const kelasHariIni = db.sessions.filter((s) => s.tanggal === t).sort((a, b) => a.jam_mulai.localeCompare(b.jam_mulai))
  const idKelas = new Set(kelasHariIni.map((s) => s.id))
  const bookingHariIni = db.bookings.filter((b) => idKelas.has(b.class_session_id))
  const sudahHadir = bookingHariIni.filter((b) => b.status === 'Hadir').length
  const berjalan = kelasHariIni.find((s) => s.jam_mulai <= now && now < s.jam_selesai)
  const berikutnya = kelasHariIni.find((s) => s.jam_mulai > now)

  const bulanIni = t.slice(0, 8) + '01'
  const pendapatanBulan = db.payments
    .filter((p) => p.status === 'Lunas' && p.tanggal >= bulanIni && p.tanggal <= t)
    .reduce((s, p) => s + p.nominal, 0)

  const hampirHabis = db.memberPackages
    .filter((mp) => mp.sesi_tersisa > 0 && mp.tanggal_kadaluarsa >= t && daysUntil(t, mp.tanggal_kadaluarsa) <= 7)
    .sort((a, b) => a.tanggal_kadaluarsa.localeCompare(b.tanggal_kadaluarsa))

  const belumLunas = db.payments.filter((p) => p.status === 'Menunggu pembayaran')
  const waitlistHariIni = bookingHariIni.filter((b) => b.status === 'Waitlist')
  const ulangTahun = db.members
    .filter((m) => m.aktif && m.tanggal_lahir)
    .flatMap((m) => {
      for (let off = 0; off <= 7; off++) {
        if (tambahHari(t, off).slice(5) === m.tanggal_lahir!.slice(5)) return [{ m, off }]
      }
      return []
    })
    .sort((a, b) => a.off - b.off)

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Booking hari ini" value={String(bookingHariIni.filter((b) => b.status !== 'Batal' && b.status !== 'Waitlist').length)} sub={`${kelasHariIni.length} kelas terjadwal`} />
        <Stat label="Sudah check-in" value={String(sudahHadir)} sub={`dari ${bookingHariIni.filter((b) => b.status !== 'Batal' && b.status !== 'Waitlist').length} peserta`} />
        <Stat
          label="Kelas berjalan / berikutnya"
          value={berjalan ? berjalan.nama : berikutnya ? berikutnya.nama : '—'}
          sub={berjalan ? `Berjalan, sampai ${berjalan.jam_selesai}` : berikutnya ? `Berikutnya ${berikutnya.jam_mulai} · ${namaInstruktur(berikutnya.instructor_id)}` : 'Tidak ada kelas lagi hari ini'}
        />
        <Stat label="Pendapatan bulan ini" value={rupiah(pendapatanBulan)} sub="transaksi lunas" />
      </div>

      <Card title="Kelas Hari Ini">
        {kelasHariIni.length === 0 ? <Empty>Tidak ada kelas hari ini.</Empty> : (
          <div className="grid gap-3">
            {kelasHariIni.map((s) => {
              const penuh = kelasPenuh(s)
              return (
                <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-cream-50 px-4 py-3">
                  <div>
                    <div className="font-semibold">{s.jam_mulai}–{s.jam_selesai} · {s.nama}</div>
                    <div className="text-sm text-muted">
                      {namaInstruktur(s.instructor_id)} · {pesertaKelas(s.id).length}/{s.kapasitas} peserta{penuh ? ' · PENUH' : ''}
                      {waitlistKelas(s.id).length > 0 ? ` · ${waitlistKelas(s.id).length} waitlist` : ''}
                    </div>
                  </div>
                  <Button variant="secondary" onClick={() => navigate(`/checkin?session=${s.id}`)}>Detail Kelas</Button>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      <Card title="Perlu Ditindaklanjuti">
        {hampirHabis.length === 0 && belumLunas.length === 0 && waitlistHariIni.length === 0 && ulangTahun.length === 0 ? (
          <Empty>Semua beres 🌸</Empty>
        ) : (
          <div className="grid gap-3">
            {ulangTahun.map(({ m, off }) => (
              <div key={m.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-rose-100/60 px-4 py-3">
                <div>
                  <div className="font-semibold">🎂 Ulang tahun {m.nama_lengkap} {off === 0 ? 'HARI INI' : off === 1 ? 'besok' : `dalam ${off} hari`}</div>
                  <div className="text-sm text-muted">{labelTanggal(tambahHari(t, off))}</div>
                </div>
                <a href={linkWa(m.nomor_whatsapp, WA_TEMPLATES.ulangTahun(m.nama_lengkap))} target="_blank" rel="noreferrer">
                  <Button variant="secondary" className="text-xs">Kirim Ucapan WA</Button>
                </a>
              </div>
            ))}
            {hampirHabis.map((mp) => {
              const m = db.members.find((x) => x.id === mp.member_id)
              const sisa = paketAktif(mp.member_id).length
              return (
                <div key={mp.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-cream-50 px-4 py-3">
                  <div>
                    <div className="font-semibold">{namaMember(mp.member_id)} — {namaProduk(mp.package_product_id)}</div>
                    <div className="text-sm text-muted">Sisa {mp.sesi_tersisa} sesi · kadaluarsa {labelTanggal(mp.tanggal_kadaluarsa)}{sisa === 0 ? ' · paket aktif habis' : ''}</div>
                  </div>
                  <a href={linkWa(m?.nomor_whatsapp ?? '', WA_TEMPLATES.paketMauHabis(namaMember(mp.member_id), namaProduk(mp.package_product_id), labelTanggal(mp.tanggal_kadaluarsa)))} target="_blank" rel="noreferrer">
                    <Button variant="secondary" className="text-xs">Chat WhatsApp</Button>
                  </a>
                </div>
              )
            })}
            {belumLunas.map((p) => (
              <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-cream-50 px-4 py-3">
                <div>
                  <div className="font-semibold">{namaMember(p.member_id)} — {p.keterangan}</div>
                  <div className="text-sm text-muted">{rupiah(p.nominal)} · {labelTanggal(p.tanggal)}</div>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" className="text-xs" onClick={() => { const r = setStatusPembayaran(p.id, 'Lunas'); r.ok ? toast.ok('Ditandai Lunas.') : toast.err(r.error ?? 'Gagal.') }}>Tandai Lunas</Button>
                  <a href={linkWa(db.members.find((x) => x.id === p.member_id)?.nomor_whatsapp ?? '', WA_TEMPLATES.pengingatBayar(namaMember(p.member_id), p.keterangan, rupiah(p.nominal)))} target="_blank" rel="noreferrer">
                    <Button variant="ghost" className="text-xs">Pengingat WA</Button>
                  </a>
                </div>
              </div>
            ))}
            {waitlistHariIni.map((b) => (
              <div key={b.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-cream-50 px-4 py-3">
                <div>
                  <div className="font-semibold">{namaMember(b.member_id)} <Badge label="Waitlist" /></div>
                  <div className="text-sm text-muted">
                    Menunggu di {db.sessions.find((s) => s.id === b.class_session_id)?.nama} {db.sessions.find((s) => s.id === b.class_session_id)?.jam_mulai}
                  </div>
                </div>
                <Link to={`/jadwal`}><Button variant="ghost" className="text-xs">Buka Jadwal</Button></Link>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
