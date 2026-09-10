/**
 * Mode demo vs Supabase.
 * Jika VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY terisi, integrasi Supabase aktif
 * (lihat lib/supabase.ts). MVP: data service di bawah berjalan lokal (in-memory demo).
 */
export const supabaseConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY,
)
export const isDemo = !supabaseConfigured
