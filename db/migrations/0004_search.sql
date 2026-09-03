-- =====================================================================
-- KismatKart :: 0004_search.sql
-- Full-text search on products. Runs on top of 0001 (which already has
-- pg_trgm + a name-trigram GIN). This adds a tsvector column + GIN so
-- multi-word matches are quick and language-aware.
-- =====================================================================

-- to_tsvector(regconfig, text) and array_to_string(anyarray, text) are only
-- STABLE in Postgres's catalog (not IMMUTABLE), even with fixed inputs, so
-- neither can be used directly in a generated column. Pin both behind
-- trivial IMMUTABLE SQL wrappers (safe here: 'simple' config and text[]
-- output never depend on session/locale state for our purposes).
create or replace function public.immutable_simple_tsvector(text)
returns tsvector language sql immutable parallel safe as $$
  select to_tsvector('simple', coalesce($1, ''))
$$;

create or replace function public.immutable_array_to_string(text[], text)
returns text language sql immutable parallel safe as $$
  select array_to_string($1, $2)
$$;

alter table public.products
  add column if not exists search_tsv tsvector
  generated always as (
    setweight(public.immutable_simple_tsvector(name),        'A') ||
    setweight(public.immutable_simple_tsvector(brand),       'B') ||
    setweight(public.immutable_simple_tsvector(sku_prefix),  'B') ||
    setweight(public.immutable_simple_tsvector(public.immutable_array_to_string(tags, ' ')), 'C') ||
    setweight(public.immutable_simple_tsvector(short_description), 'C') ||
    setweight(public.immutable_simple_tsvector(description), 'D')
  ) stored;

create index if not exists idx_products_search_tsv on public.products using gin(search_tsv);

-- Simple RPC: rank + return v_products_public rows
create or replace function public.search_products(p_q text, p_limit int default 24, p_offset int default 0)
returns setof public.v_products_public
language sql stable as $$
  select p.*
  from public.v_products_public p
  join public.products pr on pr.id = p.id
  where pr.search_tsv @@ plainto_tsquery('simple', p_q)
     or p.name ilike '%' || p_q || '%'
  order by ts_rank(pr.search_tsv, plainto_tsquery('simple', p_q)) desc,
           p.is_featured desc, p.created_at desc
  limit p_limit offset p_offset;
$$;
