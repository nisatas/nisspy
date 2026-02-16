-- Supabase SQL Editor'da çalıştırın (Dashboard > SQL Editor > New query)
-- Bu tablo kullanıcıların haftalık plan verilerini saklar.

create table if not exists public.user_schedules (
  user_id uuid primary key references auth.users(id) on delete cascade,
  schedule jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

-- Sadece kendi satırına erişebilsin
alter table public.user_schedules enable row level security;

create policy "Users can read own schedule"
  on public.user_schedules for select
  using (auth.uid() = user_id);

create policy "Users can insert own schedule"
  on public.user_schedules for insert
  with check (auth.uid() = user_id);

create policy "Users can update own schedule"
  on public.user_schedules for update
  using (auth.uid() = user_id);

create policy "Users can delete own schedule"
  on public.user_schedules for delete
  using (auth.uid() = user_id);

-- Profil (avatar, görünen ad, motivasyon modu)
-- Not: "policy already exists" hatası alırsan sadece en alttaki ALTER satırını çalıştır.
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  avatar_url text,
  display_name text,
  motivation_mode text default 'normal' check (motivation_mode in ('normal', 'low')),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select using (auth.uid() = user_id);
create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = user_id);
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = user_id);
create policy "Users can delete own profile"
  on public.profiles for delete using (auth.uid() = user_id);

-- Mevcut profiles tablosu varsa motivation_mode sütununu ekle
alter table public.profiles add column if not exists motivation_mode text default 'normal';

-- Odak blokları: [{ duration: number, label: string }, ...]
alter table public.profiles add column if not exists focus_blocks jsonb default '[]'::jsonb;

-- Kullanıcı hedefleri (kategori listesi): ["React", "Java", "ML", ...]
alter table public.profiles add column if not exists goals jsonb default '["React","Java","ML","AI","ALES","Strategy"]'::jsonb;

-- Yol haritaları: { "React": [{ title, details, status }, ...], ... }
alter table public.profiles add column if not exists roadmaps jsonb default '{}'::jsonb;

-- Sprint planı: [{ week, focus, tasks: [] }, ...]
alter table public.profiles add column if not exists sprints jsonb default '[]'::jsonb;
