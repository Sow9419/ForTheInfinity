-- Statuts commerciaux par produit : édition limitée et badge "Nouveau".
-- Idempotent.

alter table public.products add column if not exists is_limited boolean not null default false;
alter table public.products add column if not exists is_new boolean not null default false;
