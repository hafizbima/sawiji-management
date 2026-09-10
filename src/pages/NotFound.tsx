import { Link } from 'react-router-dom'
import { Button } from '../components/ui'

export default function NotFound() {
  return (
    <div className="py-16 text-center">
      <div className="font-display text-6xl font-bold text-rose-100">404</div>
      <h2 className="mt-2 font-display text-2xl font-semibold">Halaman tidak ditemukan</h2>
      <p className="mt-2 text-sm text-muted">Alamat yang Anda buka tidak ada atau sudah dipindahkan.</p>
      <Link to="/" className="mt-6 inline-block"><Button>Kembali ke Dashboard</Button></Link>
    </div>
  )
}
