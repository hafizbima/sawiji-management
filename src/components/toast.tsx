import { useSyncExternalStore } from 'react'

type Jenis = 'ok' | 'err' | 'warn'
interface Toast { id: number; jenis: Jenis; teks: string }

let daftar: Toast[] = []
let seq = 0
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

function push(jenis: Jenis, teks: string) {
  const id = ++seq
  daftar = [...daftar.slice(-2), { id, jenis, teks }] // maks 3 tumpukan
  emit()
  setTimeout(() => tutup(id), jenis === 'err' ? 6000 : 3500)
}

function tutup(id: number) {
  daftar = daftar.filter((t) => t.id !== id)
  emit()
}

/** API notifikasi global — panggil dari mana saja, termasuk di luar komponen */
export const toast = {
  ok: (teks: string) => push('ok', teks),
  err: (teks: string) => push('err', teks),
  warn: (teks: string) => push('warn', teks),
}

const warna: Record<Jenis, string> = {
  ok: 'bg-green-700 text-white',
  err: 'bg-red-700 text-white',
  warn: 'bg-amber-500 text-ink',
}

export function Toaster() {
  const items = useSyncExternalStore(
    (l) => { listeners.add(l); return () => void listeners.delete(l) },
    () => daftar,
  )
  if (items.length === 0) return null
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:top-4 sm:right-4 sm:bottom-auto sm:items-end">
      {items.map((t) => (
        <div
          key={t.id}
          role="status"
          className={`pointer-events-auto flex max-w-md items-start gap-3 rounded-xl px-4 py-3 text-sm shadow-lg ${warna[t.jenis]}`}
        >
          <span className="flex-1">{t.teks}</span>
          <button onClick={() => tutup(t.id)} aria-label="Tutup" className="cursor-pointer opacity-80 hover:opacity-100">✕</button>
        </div>
      ))}
    </div>
  )
}
