import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from './ui'

interface State { error: Error | null }

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[Sawiji] render error', error, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream-50 p-6">
        <div className="w-full max-w-md rounded-2xl border border-line bg-white p-6 text-center shadow-sm">
          <div className="font-display text-2xl font-bold text-brand-900">Terjadi kesalahan</div>
          <p className="mt-2 text-sm text-muted">
            Halaman tidak bisa ditampilkan. Data Anda tidak hilang — coba muat ulang. Bila berulang, hubungi pengelola aplikasi.
          </p>
          <pre className="mt-3 max-h-24 overflow-auto rounded-lg bg-cream-100 p-2 text-left text-[11px] text-muted">{this.state.error.message}</pre>
          <div className="mt-4 flex justify-center gap-2">
            <Button variant="ghost" onClick={() => this.setState({ error: null })}>Coba lagi</Button>
            <Button onClick={() => window.location.reload()}>Muat ulang</Button>
          </div>
        </div>
      </div>
    )
  }
}
