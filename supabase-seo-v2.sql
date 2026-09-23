-- TGOnly SEO v2
-- Additive migration: does not remove or rename existing columns.
-- Run in Supabase SQL Editor after reviewing current production data.

alter table groups add column if not exists slug text;
alter table groups add column if not exists aliases text[] default '{}';
alter table groups add column if not exists entity_type text default 'community';
alter table groups add column if not exists link_status text default 'unknown';
alter table groups add column if not exists last_checked_at timestamptz;
alter table groups add column if not exists source text;
alter table groups add column if not exists search_intent text;
alter table groups add column if not exists seo_title text;
alter table groups add column if not exists seo_description text;

create index if not exists groups_slug_idx on groups(slug);
create index if not exists groups_aliases_idx on groups using gin(aliases);
create index if not exists groups_link_status_idx on groups(link_status);
create index if not exists groups_entity_type_idx on groups(entity_type);

create table if not exists seo_queries (
  id bigserial primary key,
  query text not null,
  page text,
  clicks integer default 0,
  impressions integer default 0,
  ctr numeric,
  position numeric,
  start_date date,
  end_date date,
  imported_at timestamptz default now()
);

create index if not exists seo_queries_query_idx on seo_queries(query);
create index if not exists seo_queries_page_idx on seo_queries(page);
create index if not exists seo_queries_impressions_idx on seo_queries(impressions desc);

create table if not exists entity_aliases (
  id bigserial primary key,
  group_id uuid references groups(id) on delete cascade,
  alias text not null,
  alias_normalized text not null,
  source text,
  confidence numeric,
  reviewed boolean default false,
  created_at timestamptz default now()
);

create index if not exists entity_aliases_normalized_idx on entity_aliases(alias_normalized);
create index if not exists entity_aliases_group_idx on entity_aliases(group_id);
