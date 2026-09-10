import { useEffect, useId, useRef, useState, type ReactNode, type ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

const styles: Record<Variant, string> = {
  primary: 'bg-brand-900 text-cream-50 hover:bg-brand-800 disabled:opacity-50',
  secondary: 'bg-rose-100 text-brand-950 hover:bg-rose-200 disabled:opacity-50',
  ghost: 'bg-transparent text-ink border border-line hover:bg-cream-100 disabled:opacity-50',
  danger: 'bg-red-600 text-white hover:bg-red-700 disabled:opacity-50',
}

export function Button({
  variant = 'primary',
  className = '',
  type = 'button',
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors cursor-pointer ${styles[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}

const chipColor: Record<string, string> = {
  Terkonfirmasi: 'bg-rose-100 text-brand-950',
  Hadir: 'bg-green-100 text-green-800',
  Batal: 'bg-gray-200 text-gray-600',
  Waitlist: 'bg-amber-100 text-amber-800',
  'No-show': 'bg-red-100 text-red-700',
  Lunas: 'bg-green-100 text-green-800',
  'Menunggu pembayaran': 'bg-amber-100 text-amber-800',
  Dibatalkan: 'bg-gray-200 text-gray-600',
  Refund: 'bg-red-100 text-red-700',
}

export function Badge({ label }: { label: string }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${chipColor[label] ?? 'bg-cream-100 text-ink'}`}>
      {label}
    </span>
  )
}

export function Card({ title, action, children, className = '' }: { title?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-line bg-white shadow-sm ${className}`}>
      {(title || action) && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-3.5">
          {title && <h2 className="font-display text-lg font-semibold">{title}</h2>}
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  )
}

/** Modal berbasis <dialog> native: Esc menutup, focus trap, aria-modal, scroll latar terkunci — gratis dari browser.
 *  Beri `onSubmit` agar Enter di input mana pun mengirim form (tombol submit tersembunyi memicu implicit submission). */
export function Modal({ title, open, onClose, onSubmit, children, wide }: { title: string; open: boolean; onClose: () => void; onSubmit?: () => void; children: ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  useEffect(() => {
    const d = ref.current
    if (open && d && !d.open) d.showModal()
  }, [open])
  if (!open) return null
  const isi = onSubmit ? (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit() }}>
      {children}
      <button type="submit" hidden aria-hidden="true" tabIndex={-1} />
    </form>
  ) : children
  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(e) => { e.preventDefault(); onClose() }}
      onClick={(e) => { if (e.target === ref.current) onClose() }}
      className={`m-auto max-h-[90vh] w-[calc(100%-2rem)] ${wide ? 'max-w-2xl' : 'max-w-lg'} overflow-y-auto rounded-2xl border-0 bg-white p-0 text-ink shadow-xl backdrop:bg-brand-950/40`}
    >
      <div className="p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 id={titleId} className="font-display text-xl font-semibold">{title}</h3>
          <button type="button" onClick={onClose} className="cursor-pointer rounded-lg px-2 py-1 text-muted hover:bg-cream-100" aria-label="Tutup">✕</button>
        </div>
        {isi}
      </div>
    </dialog>
  )
}

/** Pagination sisi klien sederhana — reset ke halaman 1 saat resetKey berubah */
export interface PagerState { page: number; total: number; count: number; size: number; setPage: (n: number) => void }
export function usePagination<T>(rows: T[], size = 20, resetKey = ''): PagerState & { slice: T[] } {
  const [page, setPage] = useState(1)
  useEffect(() => { setPage(1) }, [resetKey])
  const total = Math.max(1, Math.ceil(rows.length / size))
  const cur = Math.min(page, total)
  return { slice: rows.slice((cur - 1) * size, cur * size), page: cur, total, count: rows.length, size, setPage }
}

export function Pager({ p }: { p: PagerState }) {
  if (p.count <= p.size) return null
  const awal = (p.page - 1) * p.size + 1
  const akhir = Math.min(p.page * p.size, p.count)
  return (
    <div className="mt-4 flex items-center justify-between gap-3 text-sm text-muted">
      <span>{awal}–{akhir} dari {p.count}</span>
      <div className="flex items-center gap-2">
        <Button variant="ghost" className="!px-2.5 !py-1.5" disabled={p.page <= 1} onClick={() => p.setPage(p.page - 1)} aria-label="Halaman sebelumnya">‹</Button>
        <span className="tabular-nums">{p.page} / {p.total}</span>
        <Button variant="ghost" className="!px-2.5 !py-1.5" disabled={p.page >= p.total} onClick={() => p.setPage(p.page + 1)} aria-label="Halaman berikutnya">›</Button>
      </div>
    </div>
  )
}

export function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">
        {label} {required && <span className="text-brand-700">*</span>}
      </span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  )
}

export const inputCls =
  'w-full rounded-xl border border-line bg-cream-50 px-3 py-2 text-sm outline-none focus:border-brand-700'

export function Empty({ children }: { children: ReactNode }) {
  return <div className="py-10 text-center text-sm text-muted">{children}</div>
}

export function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
      <div className="text-sm text-muted">{label}</div>
      <div className="mt-1 font-display text-2xl font-bold">{value}</div>
      {sub && <div className="mt-1 text-xs text-muted">{sub}</div>}
    </div>
  )
}

export function Confirm({ open, title, message, onConfirm, onCancel, danger }: { open: boolean; title: string; message: string; onConfirm: () => void; onCancel: () => void; danger?: boolean }) {
  return (
    <Modal title={title} open={open} onClose={onCancel}>
      <p className="text-sm text-muted">{message}</p>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>Batal</Button>
        <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>Ya, lanjutkan</Button>
      </div>
    </Modal>
  )
}
