import { Badge, Button, Card, Confirm, Field, Modal, inputCls } from '../components/ui'
import { hapusInstruktur, useDb, resetDemo, tambahInstruktur, ubahInstruktur } from '../data/db'
import { isDemo } from '../lib/mode'
import { linkWa } from '../lib/format'
import { STUDIO, WA_TEMPLATES } from '../lib/config'
import { toast } from '../components/toast'

import { useState } from 'react'
import type { Instructor } from '../types'

function InstrukturModal({ open, editing, onClose }: { open: boolean; editing?: Instructor; onClose: () => void }) {
  const [f, setF] = useState({ nama: editing?.nama ?? '', nomor_whatsapp: editing?.nomor_whatsapp ?? '', aktif: editing?.aktif ?? true })
  const [err, setErr] = useState('')
  function submit() {
    if (!f.nama.trim()) { setErr('Nama instruktur wajib diisi.'); return }
    const wa = f.nomor_whatsapp.replace(/\D/g, '')
    if (wa.length < 9 || wa.length > 15) { setErr('Nomor WhatsApp tidak valid (9–15 digit).'); return }
    const input = { nama: f.nama, nomor_whatsapp: f.nomor_whatsapp, aktif: f.aktif }
    const res = editing ? ubahInstruktur(editing.id, input) : tambahInstruktur(input)
    if (!res.ok) { setErr(res.error ?? 'Gagal menyimpan.'); return }
    toast.ok(editing ? 'Instruktur diperbarui.' : 'Instruktur ditambahkan.')
    onClose()
  }
  return (
    <Modal title={editing ? 'Edit Instruktur' : 'Tambah Instruktur'} open={open} onClose={onClose} onSubmit={submit}>
      <div className="grid gap-4">
        <Field label="Nama" required error={err}><input className={inputCls} value={f.nama} onChange={(e) => setF({ ...f, nama: e.target.value })} /></Field>
        <Field label="Nomor WhatsApp" required><input className={inputCls} placeholder="08xxxxxxxxxx" value={f.nomor_whatsapp} onChange={(e) => setF({ ...f, nomor_whatsapp: e.target.value })} /></Field>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" checked={f.aktif} onChange={(e) => setF({ ...f, aktif: e.target.checked })} /> Aktif (bukti mengajar kelas baru)
        </label>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>Batal</Button>
        <Button onClick={submit}>Simpan</Button>
      </div>
    </Modal>
  )
}

export default function Pengaturan() {
  const db = useDb()
  const [reset, setReset] = useState(false)
  const [tambah, setTambah] = useState(false)
  const [edit, setEdit] = useState<Instructor | null>(null)
  const [hapus, setHapus] = useState<Instructor | null>(null)

  return (
    <div className="grid gap-6">
      <Card title="Informasi Studio">
        <dl className="grid gap-2 text-sm">
          <div className="flex gap-2"><dt className="w-40 text-muted">Nama studio</dt><dd className="font-semibold">{STUDIO.namaLengkap}</dd></div>
          <div className="flex gap-2"><dt className="w-40 text-muted">Zona waktu</dt><dd>Asia/Jakarta (WIB)</dd></div>
          <div className="flex gap-2"><dt className="w-40 text-muted">Mata uang</dt><dd>Rupiah (IDR)</dd></div>
          <div className="flex gap-2"><dt className="w-40 text-muted">Mode aplikasi</dt><dd className="font-semibold">{isDemo ? 'Demo (data contoh lokal)' : 'Supabase'}</dd></div>
        </dl>
      </Card>

      <Card title="Instruktur" action={<Button onClick={() => setTambah(true)}>+ Tambah Instruktur</Button>}>
        <div className="grid gap-3 sm:grid-cols-3">
          {db.instructors.map((i) => {
            const kelas = db.sessions.filter((s) => s.instructor_id === i.id && s.tanggal >= new Date().toISOString().slice(0, 10)).length
            return (
              <div key={i.id} className="rounded-xl border border-line bg-cream-50 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="font-display text-lg font-bold">{i.nama}</div>
                  <Badge label={i.aktif ? 'Aktif' : 'Nonaktif'} />
                </div>
                <div className="mt-1 text-sm text-muted">{i.nomor_whatsapp}</div>
                <div className="text-xs text-muted">{kelas} kelas mendatang</div>
                <div className="mt-3 flex gap-2">
                  <Button variant="ghost" className="text-xs" onClick={() => setEdit(i)}>Edit</Button>
                  <Button variant="ghost" className="text-xs text-red-700" onClick={() => setHapus(i)}>Hapus</Button>
                  <a href={linkWa(i.nomor_whatsapp, WA_TEMPLATES.sapaan(i.nama))} target="_blank" rel="noreferrer">
                    <Button variant="ghost" className="text-xs">Chat WA</Button>
                  </a>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      <Card title="Audit Log Terbaru">
        <p className="mb-3 text-xs text-muted">Catatan mutasi penting: check-in, pengembalian sesi, perubahan pembayaran.</p>
        {db.auditLogs.length === 0 ? <p className="text-sm text-muted">Belum ada aktivitas.</p> : (
          <ul className="grid gap-2 text-sm">
            {db.auditLogs.slice(0, 15).map((l) => (
              <li key={l.id} className="border-b border-line pb-2">
                <span className="font-mono text-xs text-brand-700">{l.aksi}</span> — {l.detail}
                <span className="block text-xs text-muted">{new Date(l.waktu).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} · {l.aktor}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {isDemo && (
        <Card title="Mode Demo">
          <p className="mb-3 text-sm text-muted">
            Perubahan Anda tersimpan selama sesi tab ini (pindah halaman, back/forward aman). Tekan <b>refresh</b> (F5) atau buka tab baru untuk kembali ke data contoh awal.
            Isi <code className="rounded bg-cream-100 px-1">.env</code> dengan kredensial Supabase untuk mengaktifkan penyimpanan permanen.
          </p>
          <Button variant="danger" onClick={() => setReset(true)}>Reset Data Demo</Button>
        </Card>
      )}

      <Confirm
        open={reset}
        title="Reset data demo?"
        message="Seluruh perubahan Anda (booking, check-in, pembayaran) akan dihapus dan data contoh dimuat ulang."
        danger
        onCancel={() => setReset(false)}
        onConfirm={() => { resetDemo(); toast.ok('Data demo dimuat ulang.'); setReset(false) }}
      />
      {tambah && <InstrukturModal open onClose={() => setTambah(false)} />}
      {edit && <InstrukturModal key={edit.id} open editing={edit} onClose={() => setEdit(null)} />}
      <Confirm
        open={!!hapus}
        title={`Hapus instruktur ${hapus?.nama ?? ''}?`}
        message="Hanya instruktur yang belum tercatat di jadwal kelas yang bisa dihapus. Bila sudah, nonaktifkan lewat Edit."
        danger
        onCancel={() => setHapus(null)}
        onConfirm={() => { const r = hapusInstruktur(hapus!.id); r.ok ? toast.ok('Instruktur dihapus.') : toast.err(r.error ?? 'Gagal.'); setHapus(null) }}
      />
    </div>
  )
}
