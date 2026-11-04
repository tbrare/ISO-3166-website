-- =========================================================
-- iso3166.nl — databaseschema
-- Uitvoeren in Supabase → SQL Editor → New query → Run
-- =========================================================

create extension if not exists pgcrypto;

-- ---------- Domeinen (de draden van het spinnenweb) ----------
create table if not exists public.domeinen (
  id           uuid primary key default gen_random_uuid(),
  naam         text not null unique,
  omschrijving text,
  volgorde     integer not null default 0,
  created_at   timestamptz not null default now()
);

-- ---------- Normen en codelijsten ----------
create table if not exists public.normen (
  id                 uuid primary key default gen_random_uuid(),
  code               text not null unique,
  titel              text not null,
  specificatie       text,
  afkorting          text,
  jaar               integer check (jaar between 1900 and 2100),
  niveau             text not null check (niveau in ('internationaal', 'europees', 'nationaal')),
  type               text not null check (type in ('ISO', 'ISO/IEC', 'EN', 'NEN', 'NEN-EN-ISO', 'Codelijst', 'Overig')),
  formeel            boolean generated always as (type in ('ISO', 'ISO/IEC', 'EN', 'NEN', 'NEN-EN-ISO')) stored,
  hoofddomein_id     uuid references public.domeinen(id) on delete restrict,
  organisaties       text[] not null default '{}',
  toepassing         text not null,
  beleidsrelevantie  text,
  iso3166_delen      text[] not null default '{}',
  element            text,
  afwijkingen        text,
  iso3166_editie     text,
  bron               text,
  status             text not null default 'concept' check (status in ('concept', 'te_verifieren', 'bevestigd')),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- Aanvullende domeinen (een norm kan ook in andere domeinen vallen)
create table if not exists public.norm_domeinen (
  norm_id   uuid not null references public.normen(id) on delete cascade,
  domein_id uuid not null references public.domeinen(id) on delete restrict,
  primary key (norm_id, domein_id)
);

-- Directe relaties tussen normen
create table if not exists public.relaties (
  id            uuid primary key default gen_random_uuid(),
  van_norm_id   uuid not null references public.normen(id) on delete cascade,
  naar_norm_id  uuid not null references public.normen(id) on delete cascade,
  type          text not null check (type in ('verwijst_naar', 'neemt_over', 'gebaseerd_op', 'vervangt')),
  status        text not null default 'te_verifieren' check (status in ('concept', 'te_verifieren', 'bevestigd')),
  created_at    timestamptz not null default now(),
  check (van_norm_id <> naar_norm_id),
  unique (van_norm_id, naar_norm_id, type)
);

-- Verwijzingen naar ISO 3166 in de normtekst (per paragraaf)
create table if not exists public.iso3166_verwijzingen (
  id                uuid primary key default gen_random_uuid(),
  norm_id           uuid not null references public.normen(id) on delete cascade,
  paragraaf_nummer  text not null,
  paragraaf_titel   text,
  toelichting       text,
  volgorde          integer not null default 0,
  created_at        timestamptz not null default now()
);

-- Wie mag beheren
create table if not exists public.beheerders (
  user_id uuid primary key references auth.users(id) on delete cascade
);

-- ---------- updated_at automatisch bijwerken ----------
create or replace function public.zet_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists normen_updated_at on public.normen;
create trigger normen_updated_at before update on public.normen
for each row execute function public.zet_updated_at();

-- ---------- Hulpfunctie: is de ingelogde gebruiker beheerder? ----------
create or replace function public.is_beheerder()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.beheerders where user_id = auth.uid());
$$;

grant execute on function public.is_beheerder() to anon, authenticated;

-- ---------- Row Level Security ----------
alter table public.domeinen      enable row level security;
alter table public.normen        enable row level security;
alter table public.norm_domeinen enable row level security;
alter table public.relaties      enable row level security;
alter table public.beheerders    enable row level security;
alter table public.iso3166_verwijzingen enable row level security;

-- Verwijzingen zijn zichtbaar als de bijbehorende norm zichtbaar is
drop policy if exists "verwijzingen lezen" on public.iso3166_verwijzingen;
create policy "verwijzingen lezen" on public.iso3166_verwijzingen for select
  using (exists (select 1 from public.normen n where n.id = norm_id));

drop policy if exists "verwijzingen beheren" on public.iso3166_verwijzingen;
create policy "verwijzingen beheren" on public.iso3166_verwijzingen for all to authenticated
  using (public.is_beheerder()) with check (public.is_beheerder());

-- Lezen: iedereen ziet alleen bevestigde normen; beheerders zien alles.
drop policy if exists "domeinen lezen" on public.domeinen;
create policy "domeinen lezen" on public.domeinen for select using (true);

drop policy if exists "normen lezen" on public.normen;
create policy "normen lezen" on public.normen for select
  using (status = 'bevestigd' or public.is_beheerder());

drop policy if exists "norm_domeinen lezen" on public.norm_domeinen;
create policy "norm_domeinen lezen" on public.norm_domeinen for select using (true);

drop policy if exists "relaties lezen" on public.relaties;
create policy "relaties lezen" on public.relaties for select
  using (status = 'bevestigd' or public.is_beheerder());

drop policy if exists "beheerders eigen rij" on public.beheerders;
create policy "beheerders eigen rij" on public.beheerders for select
  using (user_id = auth.uid());

-- Schrijven: alleen beheerders
drop policy if exists "domeinen beheren" on public.domeinen;
create policy "domeinen beheren" on public.domeinen for all to authenticated
  using (public.is_beheerder()) with check (public.is_beheerder());

drop policy if exists "normen beheren" on public.normen;
create policy "normen beheren" on public.normen for all to authenticated
  using (public.is_beheerder()) with check (public.is_beheerder());

drop policy if exists "norm_domeinen beheren" on public.norm_domeinen;
create policy "norm_domeinen beheren" on public.norm_domeinen for all to authenticated
  using (public.is_beheerder()) with check (public.is_beheerder());

drop policy if exists "relaties beheren" on public.relaties;
create policy "relaties beheren" on public.relaties for all to authenticated
  using (public.is_beheerder()) with check (public.is_beheerder());
