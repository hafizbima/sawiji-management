import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge, Button, Card, Empty, Field, Modal, Pager, inputCls, usePagination } from '../components/ui'
import { paketAktif, tambahMember, ubahMember, useDb } from '../data/db'
import type { Member } from '../types'
import { linkWa } from '../lib/format'
import { WA_TEMPLATES } from '../lib/config'
import { toast } from '../components/toast'


export interface FormState {
  nama_lengkap: string
  nomor_whatsapp: string
  instagram: string
  tanggal_lahir: string
  kondisi_khusus: string
  catatan_admin: string
  aktif: boolean
}

export const emptyMember: FormState = {
  nama_lengkap: '', nomor_whatsapp: '', instagram: '', tanggal_lahir: '', kondisi_khusus: '', catatan_admin: '', aktif: true,
}

export function toForm(m: Member): FormState {
  return {
    nama_lengkap: m.nama_lengkap, nomor_whatsapp: m.nomor_whatsapp, instagram: m.instagram ?? '',
    tanggal_lahir: m.tanggal_lahir ?? '', kondisi_khusus: m.kondisi_khusus ?? '', catatan_admin: m.catatan_admin ?? '', aktif: m.aktif,
  }
}

export function validate(f: FormState): Partial<Record<keyof FormState, string>> {
  const e: Partial<Record<keyof FormState, string>> = {}
  if (!f.nama_lengkap.trim()) e.nama_lengkap = 'Nama lengkap wajib diisi.'
  const wa = f.nomor_whatsapp.replace(/\D/g, '')
  if (!wa) e.nomor_whatsapp = 'Nomor WhatsApp wajib diisi.'
  else if (wa.length < 9 || wa.length > 15) e.nomor_whatsapp = 'Nomor WhatsApp tidak valid (9–15 digit).'
  return e
}

export function MemberFormModal({ open, editing, onClose }: { open: boolean; editing?: Member; onClose: () => void }) {
  const [f, setF] = useState<FormState>(editing ? toForm(editing) : emptyMember)
  const [err, setErr] = useState<Partial<Record<keyof FormState, string>>>({})
  const set = (k: keyof FormState) => (e: { target: { value: string; type?: string; checked?: boolean } }) =>
    setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })

  function submit() {
    const v = validate(f)
    setErr(v)
    if (Object.keys(v).length > 0) return
    const res = editing ? ubahMember(editing.id, f) : tambahMember(f)
    if (!res.ok) { setErr({ nama_lengkap: res.error }); return }
    toast.ok(editing ? 'Data member diperbarui.' : 'Member ditambahkan.')
    onClose()
  }

  return (
    <Modal title={editing ? 'Edit Member' : 'Tambah Member'} open={open} onClose={onClose} onSubmit={submit}>
      <div className="grid gap-4">
        <Field label="Nama lengkap" required error={err.nama_lengkap}>
          <input className={inputCls} value={f.nama_lengkap} onChange={set('nama_lengkap')} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Nomor WhatsApp" required error={err.nomor_whatsapp}>
            <input className={inputCls} placeholder="08xxxxxxxxxx" value={f.nomor_whatsapp} onChange={set('nomor_whatsapp')} />
          </Field>
          <Field label="Nama Instagram">
            <input className={inputCls} placeholder="@username" value={f.instagram} onChange={set('instagram')} />
          </Field>
        </div>
        <Field label="Tanggal lahir">
          <input type="date" className={inputCls} value={f.tanggal_lahir} onChange={set('tanggal_lahir')} />
        </Field>
        <Field label="Kondisi khusus / cedera">
          <textarea className={inputCls} rows={2} value={f.kondisi_khusus} onChange={set('kondisi_khusus')} />
        </Field>
        <Field label="Catatan admin">
          <textarea className={inputCls} rows={2} value={f.catatan_admin} onChange={set('catatan_admin')} />
        </Field>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" checked={f.aktif} onChange={set('aktif')} /> Member aktif
        </label>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>Batal</Button>
        <Button onClick={submit}>{editing ? 'Simpan Perubahan' : 'Tambah Member'}</Button>
      </div>
    </Modal>
  )
}

export default function Member() {
  const db = useDb()
  const [q, setQ] = useState('')
  const [tambah, setTambah] = useState(false)

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase()
    return db.members
      .filter((m) => !s || m.nama_lengkap.toLowerCase().includes(s) || m.nomor_whatsapp.includes(s))
      .sort((a, b) => a.nama_lengkap.localeCompare(b.nama_lengkap))
  }, [db, q])
  const pg = usePagination(rows, 20, q)

  return (
    <>
      <Card
        title={`Member (${rows.length})`}
        action={<Button onClick={() => setTambah(true)}>+ Tambah Member</Button>}
      >
        <input className={`${inputCls} mb-4 max-w-sm`} placeholder="Cari nama atau nomor WhatsApp…" value={q} onChange={(e) => setQ(e.target.value)} />
        {rows.length === 0 ? (
          <Empty>Tidak ada member yang cocok.</Empty>
        ) : (
          <div className="overflow-x-auto">
            <table className="rtable w-full min-w-[640px] text-sm">
              <thead>
                <tr className="text-left text-xs tracking-wide text-muted uppercase">
                  <th className="py-2 pr-4">Nama</th>
                  <th className="py-2 pr-4">WhatsApp</th>
                  <th className="py-2 pr-4">Paket aktif</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {pg.slice.map((m) => {
                  const aktifPaket = paketAktif(m.id)
                  return (
                    <tr key={m.id} className="border-t border-line">
                      <td className="py-3 pr-4 font-semibold">
                        <Link to={`/member/${m.id}`} className="hover:text-brand-700 hover:underline">{m.nama_lengkap}</Link>
                      </td>
                      <td className="py-3 pr-4 text-muted">{m.nomor_whatsapp}</td>
                      <td className="py-3 pr-4">
                        {aktifPaket.length === 0 ? (
                          <span className="text-muted">—</span>
                        ) : (
                          aktifPaket.map((p) => (
                            <span key={p.id} className="mr-1 inline-block rounded-full bg-cream-100 px-2 py-0.5 text-xs">
                              {p.sesi_tersisa} sesi
                            </span>
                          ))
                        )}
                      </td>
                      <td className="py-3 pr-4"><Badge label={m.aktif ? 'Aktif' : 'Nonaktif'} /></td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          <Link to={`/member/${m.id}`}><Button variant="secondary" className="!px-2.5 !py-1.5 text-xs">Detail</Button></Link>
                          <a href={linkWa(m.nomor_whatsapp, WA_TEMPLATES.sapaan(m.nama_lengkap))} target="_blank" rel="noreferrer">
                            <Button variant="ghost" className="!px-2.5 !py-1.5 text-xs">Chat WA</Button>
                          </a>
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
      {tambah && <MemberFormModal open onClose={() => setTambah(false)} />}
    </>
  )
}
