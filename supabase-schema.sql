-- Ejecuta esto en el SQL Editor de Supabase
-- https://app.supabase.com → Tu proyecto → SQL Editor

create table if not exists groups (
  id          uuid primary key default gen_random_uuid(),
  name        text unique not null,
  emoji       text,
  color       text default 'teal',
  members     integer default 0,
  verified    boolean default false,
  desc        text,
  tags        text[],
  trending    boolean default false,
  category    text,
  link        text,
  score       integer default 0,
  created_at  timestamp with time zone default now()
);

-- Índices para búsqueda rápida
create index if not exists groups_category_idx on groups(category);
create index if not exists groups_trending_idx on groups(trending);
create index if not exists groups_score_idx on groups(score desc);

-- Búsqueda full-text en español
create index if not exists groups_fts_idx on groups
  using gin(to_tsvector('spanish', name || ' ' || coalesce(desc, '')));

-- Permitir lectura pública
alter table groups enable row level security;
create policy "Lectura pública" on groups for select using (true);
