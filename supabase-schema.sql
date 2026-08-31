-- Bloom cloud-sync schema — mirrors the local Dexie tables, one row per
-- user per record, scoped by Row Level Security to auth.uid().

create table if not exists public.cycles (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  start_date date not null,
  end_date date,
  flow_intensity jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.daily_logs (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  symptoms text[] not null default '{}',
  mood text,
  notes text not null default '',
  temperature numeric,
  cervical_mucus text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pregnancies (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null,
  lmp_date date,
  conception_date date,
  due_date date,
  ended_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists cycles_user_id_idx on public.cycles(user_id);
create index if not exists daily_logs_user_id_idx on public.daily_logs(user_id);
create index if not exists pregnancies_user_id_idx on public.pregnancies(user_id);

alter table public.cycles enable row level security;
alter table public.daily_logs enable row level security;
alter table public.pregnancies enable row level security;

create policy "Users manage their own cycles" on public.cycles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage their own daily_logs" on public.daily_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage their own pregnancies" on public.pregnancies
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
