import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { tanggalPanjang } from '../lib/format'
import { isDemo } from '../lib/mode'
import { STUDIO } from '../lib/config'

const nav = [
  { to: '/', label: 'Dashboard' },
  { to: '/member', label: 'Member' },
  { to: '/jadwal', label: 'Jadwal & Booking' },
  { to: '/checkin', label: 'Check-in' },
  { to: '/paket', label: 'Paket' },
  { to: '/pembayaran', label: 'Pembayaran' },
  { to: '/laporan', label: 'Laporan' },
  { to: '/pengaturan', label: 'Pengaturan' },
]

const titles: Record<string, string> = Object.fromEntries(nav.map((n) => [n.to, n.label]))

export default function Layout() {
  const { pathname } = useLocation()
  const title = titles[pathname] ?? STUDIO.namaAplikasi
  return (
    <div className="flex min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col bg-brand-950 px-4 py-6 text-cream-50 md:flex">
        <div className="px-2">
          <div className="font-display text-2xl font-bold">Sawiji</div>
          <div className="text-xs tracking-widest text-rose-100/80 uppercase">Studio Pilates</div>
        </div>
        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                `rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? 'bg-brand-800 text-white' : 'text-rose-100/80 hover:bg-brand-900 hover:text-white'}`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-3 text-xs text-rose-100/50">© {STUDIO.tahun} {STUDIO.namaLengkap}</div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col md:ml-60">
        <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-line bg-cream-50/90 px-4 py-3 backdrop-blur sm:px-5 md:px-8">
          <div className="min-w-0">
            <h1 className="truncate font-display text-xl font-semibold">{title}</h1>
            <div className="text-xs text-muted capitalize">{tanggalPanjang(new Date().toISOString())} · WIB</div>
          </div>
          <div className="flex items-center gap-3">
            {isDemo && <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">Mode Demo</span>}
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-100 text-sm font-bold text-brand-950">AS</div>
              <div className="hidden text-sm sm:block">
                <div className="font-semibold">Admin Sawiji</div>
                <div className="text-xs text-muted">owner</div>
              </div>
            </div>
          </div>
        </header>
        <nav className="flex gap-1 overflow-x-auto border-b border-line bg-brand-950 px-3 py-2 md:hidden">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                `rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap ${isActive ? 'bg-brand-800 text-white' : 'text-rose-100/80'}`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>
        <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-6 md:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
