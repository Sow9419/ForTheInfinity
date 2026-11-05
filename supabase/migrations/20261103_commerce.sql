-- ===========================================================
-- Commerce : tailles dynamiques, stock, prix promo, codes promo
-- ===========================================================

-- 1) Tailles globales gérées depuis l'admin
create table if not exists public.sizes (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  position int not null default 0,
  created_at timestamptz not null default now()
);

-- 2) Liaison produit <-> taille avec état de stock par taille
create table if not exists public.product_sizes (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  size_id uuid not null references public.sizes(id) on delete cascade,
  in_stock boolean not null default true,
  created_at timestamptz not null default now()
);
create unique index if not exists product_sizes_unique on public.product_sizes(product_id, size_id);

-- 3) Produits : rupture globale + prix promotionnel
alter table public.products add column if not exists in_stock boolean not null default true;
alter table public.products add column if not exists promo_price numeric;

-- 4) Codes promo (pourcentage), expiration / limite d'usages optionnelles
create table if not exists public.promo_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_percent numeric not null default 0 check (discount_percent > 0 and discount_percent <= 100),
  active boolean not null default true,
  expires_at timestamptz,
  max_uses int,
  used_count int not null default 0,
  created_at timestamptz not null default now()
);

-- 4b) Restriction optionnelle du code à certains produits
--     NULL ou vide = valable sur tout le panier ; sinon % appliqué sur les produits ciblés
alter table public.promo_codes add column if not exists product_ids uuid[];

-- 5) Commandes : traçabilité des remises
alter table public.orders add column if not exists promo_code text;
alter table public.orders add column if not exists discount numeric not null default 0;

-- 5a) Order items : prix unitaire "figé" au moment de la commande (prix promo inclus)
alter table public.order_items add column if not exists price numeric;

-- 5b) Incrémentation atomique du compteur d'usage d'un code promo
create or replace function public.increment_promo_usage(p_code text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.promo_codes
  set used_count = used_count + 1
  where upper(code) = upper(p_code);
$$;

-- 6) RLS — même convention que le reste du projet (accès complet)
alter table public.sizes enable row level security;
alter table public.product_sizes enable row level security;
alter table public.promo_codes enable row level security;

drop policy if exists "Allow full access to sizes" on public.sizes;
create policy "Allow full access to sizes" on public.sizes for all using (true) with check (true);

drop policy if exists "Allow full access to product_sizes" on public.product_sizes;
create policy "Allow full access to product_sizes" on public.product_sizes for all using (true) with check (true);

drop policy if exists "Allow full access to promo_codes" on public.promo_codes;
create policy "Allow full access to promo_codes" on public.promo_codes for all using (true) with check (true);

-- 7) Tailles par défaut
insert into public.sizes (name, position) values
  ('S', 1), ('M', 2), ('L', 3), ('XL', 4), ('XXL', 5)
on conflict (name) do nothing;

-- 8) Migration des variants existants (JSONB) -> product_sizes
insert into public.product_sizes (product_id, size_id, in_stock)
select p.id, s.id, true
from public.products p
join public.sizes s on p.variants ? s.name
on conflict do nothing;
