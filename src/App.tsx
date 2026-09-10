import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Toaster } from './components/toast'
import CustomerBooking from './pages/CustomerBooking'
import Dashboard from './pages/Dashboard'
import Member from './pages/Member'
import MemberDetail from './pages/MemberDetail'
import Jadwal from './pages/Jadwal'
import Checkin from './pages/Checkin'
import Paket from './pages/Paket'
import Pembayaran from './pages/Pembayaran'
import Laporan from './pages/Laporan'
import Pengaturan from './pages/Pengaturan'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/booking" element={<CustomerBooking />} />
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/member" element={<Member />} />
          <Route path="/member/:id" element={<MemberDetail />} />
          <Route path="/jadwal" element={<Jadwal />} />
          <Route path="/checkin" element={<Checkin />} />
          <Route path="/paket" element={<Paket />} />
          <Route path="/pembayaran" element={<Pembayaran />} />
          <Route path="/laporan" element={<Laporan />} />
          <Route path="/pengaturan" element={<Pengaturan />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      <Toaster />
    </ErrorBoundary>
  )
}
