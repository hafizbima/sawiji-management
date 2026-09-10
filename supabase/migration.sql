-- ============================================================
-- Sawiji Studio Admin — Skema Supabase (MVP, satu studio)
-- Jalankan di Supabase SQL Editor. Zona waktu aplikasi: Asia/Jakarta
-- (tanggal jadwal & transaksi disimpan sebagai date/timestamptz UTC).
-- ============================================================

create extension if not exists "pgcrypto";

-- updated_at otomatis
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ============ profiles ============
create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  nama text not null,
  role text not null default 'admin' check (role in ('owner','admin','instructor')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_profiles_updated before update on profiles for each row execute function set_updated_at();

-- profil dibuat otomatis saat user baru mendaftar (default admin; ubah manual ke owner)
create or replace function handle_new_user() returns trigger as $$
begin
  insert into public.profiles (id, nama, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'nama', split_part(new.email,'@',1)), 'admin');
  return new;
end;
$$ language plpgsql security definer;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();

-- ============ members ============
create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  nama_lengkap text not null,
  nomor_whatsapp text not null,
  instagram text,
  tanggal_lahir date,
  kondisi_khusus text,
  catatan_admin text,
  aktif boolean not null default true,
  studio_id uuid not null default '00000000-0000-0000-0000-000000000000', -- siap multi-studio
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_members_updated before update on members for each row execute function set_updated_at();

-- ============ instructors ============
create table if not exists instructors (
  id uuid primary key default gen_random_uuid(),
  nama text not null,
  nomor_whatsapp text not null,
  aktif boolean not null default true,
  studio_id uuid not null default '00000000-0000-0000-0000-000000000000',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_instructors_updated before update on instructors for each row execute function set_updated_at();

-- ============ package_products ============
create table if not exists package_products (
  id uuid primary key default gen_random_uuid(),
  nama text not null,
  jumlah_sesi int not null check (jumlah_sesi >= 1),
  harga numeric not null check (harga >= 0),
  masa_aktif_hari int not null check (masa_aktif_hari >= 1),
  aktif boolean not null default true,
  studio_id uuid not null default '00000000-0000-0000-0000-000000000000',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_products_updated before update on package_products for each row execute function set_updated_at();

-- ============ payments ============
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  nomor text not null unique,                 -- SWJ-20260908-001
  tanggal date not null,
  member_id uuid not null references members(id),
  keterangan text not null,
  nominal numeric not null check (nominal >= 0),
  metode text not null check (metode in ('Transfer','QRIS','Cash','Lainnya')),
  status text not null default 'Menunggu pembayaran'
    check (status in ('Lunas','Menunggu pembayaran','Dibatalkan','Refund')),
  catatan text,
  studio_id uuid not null default '00000000-0000-0000-0000-000000000000',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_payments_updated before update on payments for each row execute function set_updated_at();
create index idx_payments_tanggal on payments(tanggal);

-- ============ member_packages ============
create table if not exists member_packages (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members(id),
  package_product_id uuid not null references package_products(id),
  tanggal_beli date not null,
  tanggal_mulai date not null,
  tanggal_kadaluarsa date not null,
  sesi_awal int not null check (sesi_awal >= 1),
  sesi_tersisa int not null check (sesi_tersisa >= 0),
  harga_aktual numeric not null check (harga_aktual >= 0),
  status_pembayaran text not null default 'Menunggu pembayaran'
    check (status_pembayaran in ('Lunas','Menunggu pembayaran','Dibatalkan','Refund')),
  payment_id uuid references payments(id),
  catatan text,
  studio_id uuid not null default '00000000-0000-0000-0000-000000000000',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_member_packages_updated before update on member_packages for each row execute function set_updated_at();
create index idx_member_packages_member on member_packages(member_id);

-- ============ class_sessions ============
create table if not exists class_sessions (
  id uuid primary key default gen_random_uuid(),
  nama text not null,
  tanggal date not null,
  jam_mulai time not null,
  jam_selesai time not null check (jam_selesai > jam_mulai),
  instructor_id uuid not null references instructors(id),
  kapasitas int not null check (kapasitas >= 1),
  lokasi text,
  catatan text,
  studio_id uuid not null default '00000000-0000-0000-0000-000000000000',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_sessions_updated before update on class_sessions for each row execute function set_updated_at();
create index idx_sessions_tanggal on class_sessions(tanggal);

-- ============ bookings ============
create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  class_session_id uuid not null references class_sessions(id),
  member_id uuid not null references members(id),
  member_package_id uuid references member_packages(id), -- null = drop-in
  status text not null default 'Terkonfirmasi'
    check (status in ('Terkonfirmasi','Hadir','Batal','Waitlist','No-show')),
  waktu_checkin timestamptz,
  no_show_dipotong boolean not null default false,
  catatan text,
  studio_id uuid not null default '00000000-0000-0000-0000-000000000000',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (class_session_id, member_id) -- cegah booking duplikat di level DB (status Batal diperbolehkan lewat penghapusan/re-book)
);
create trigger trg_bookings_updated before update on bookings for each row execute function set_updated_at();
create index idx_bookings_session on bookings(class_session_id);
create index idx_bookings_member on bookings(member_id);

-- ============ audit_logs ============
create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  aksi text not null,
  entitas text not null,
  entitas_id uuid,
  detail text not null,
  waktu timestamptz not null default now(),
  aktor text not null default coalesce((select nama from profiles where id = auth.uid()), auth.uid()::text)
);

-- ============ RLS ============
alter table profiles enable row level security;
alter table members enable row level security;
alter table instructors enable row level security;
alter table package_products enable row level security;
alter table payments enable row level security;
alter table member_packages enable row level security;
alter table class_sessions enable row level security;
alter table bookings enable row level security;
alter table audit_logs enable row level security;

-- MVP satu studio: user login boleh akses penuh data studio.
-- (Multi-studio nanti: tambah kolom akses studio pada profiles & filter via JWT.)
do $$
declare t text;
begin
  foreach t in array array['profiles','members','instructors','package_products','payments','member_packages','class_sessions','bookings','audit_logs']
  loop
    execute format('create policy %I on %I for all to authenticated using (true) with check (true);', 'p_' || t, t);
  end loop;
end $$;

-- ============ seed master paket awal ============
insert into package_products (nama, jumlah_sesi, harga, masa_aktif_hari) values
  ('Drop-in', 1, 150000, 7),
  ('Paket 10 Sesi', 10, 1350000, 35),
  ('Paket 15 Sesi', 15, 1950000, 49)
on conflict do nothing;
