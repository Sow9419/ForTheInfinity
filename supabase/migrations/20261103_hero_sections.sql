-- Table pour le Hero de la page d'accueil (agréments image / titre / description)
create table if not exists public.hero_sections (
  id uuid primary key default gen_random_uuid(),
  image text,
  title text,
  description text,
  created_at timestamptz not null default now()
);

-- Même convention que le reste du projet (accès full CRUD, cf. 20240513_full_access_policies.sql)
alter table public.hero_sections enable row level security;

drop policy if exists "Allow full access to hero_sections" on public.hero_sections;
create policy "Allow full access to hero_sections" on public.hero_sections
  for all using (true) with check (true);
