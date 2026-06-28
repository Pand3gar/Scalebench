-- ScaleBench Phase 1 schema. See implementation.md §7.12.
create extension if not exists pg_trgm;

create table if not exists models (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  -- real-world dimensions in mm (REQUIRED, enforced)
  width_mm  numeric not null check (width_mm  > 0),
  height_mm numeric not null check (height_mm > 0),
  depth_mm  numeric not null check (depth_mm  > 0),
  source text not null check (source in ('catalog','lathe','csg','primitive')),
  shape_def jsonb,                 -- lathe/csg definition for re-editing; null for pure catalog
  glb_url text,                    -- R2 url for catalog/baked meshes
  thumb_url text,
  content_hash text,
  tags text[] default '{}',
  author_id uuid references auth.users(id),
  visibility text not null default 'private' check (visibility in ('private','public')),
  search_tsv tsvector generated always as (to_tsvector('english', coalesce(name,''))) stored,
  created_at timestamptz default now()
);
create index if not exists models_search_idx on models using gin (search_tsv);
create index if not exists models_trgm_idx   on models using gin (name gin_trgm_ops);
create index if not exists models_tags_idx   on models using gin (tags);

create table if not exists scenes (
  id text primary key,             -- short id (nanoid)
  data jsonb not null,             -- SceneSchema JSON
  author_id uuid references auth.users(id),
  created_at timestamptz default now()
);

-- RLS
alter table models enable row level security;

drop policy if exists "read public or own" on models;
create policy "read public or own" on models for select
  using (visibility = 'public' or author_id = auth.uid());

drop policy if exists "insert own" on models;
create policy "insert own" on models for insert with check (author_id = auth.uid());

drop policy if exists "update own" on models;
create policy "update own" on models for update using (author_id = auth.uid());

-- search_models(query text): FTS websearch + trigram fallback, public only.
create or replace function search_models(query text)
returns setof models language sql stable as $$
  select * from models
  where visibility = 'public'
    and (
      query = ''
      or search_tsv @@ websearch_to_tsquery('english', query)
      or name % query                              -- pg_trgm similarity
    )
  order by greatest(
      ts_rank(search_tsv, websearch_to_tsquery('english', coalesce(nullif(query,''), 'x'))),
      similarity(name, query)
    ) desc
  limit 24;
$$;
