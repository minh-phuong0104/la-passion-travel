-- La Passion Travel: post-form itinerary downloads
-- Run this once in Supabase SQL Editor.

begin;

create schema if not exists private;

create table if not exists public.itineraries (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  region text,
  duration text,
  pdf_url text not null,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.itinerary_downloads (
  id uuid primary key default gen_random_uuid(),
  itinerary_id uuid not null
    references public.itineraries (id)
    on delete cascade,
  lead_id uuid
    references public.leads (id)
    on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists itineraries_active_order_idx
  on public.itineraries (is_active, sort_order, created_at);

create index if not exists itinerary_downloads_itinerary_idx
  on public.itinerary_downloads (itinerary_id, created_at desc);

create index if not exists itinerary_downloads_lead_idx
  on public.itinerary_downloads (lead_id, created_at desc);

create or replace function private.set_itinerary_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_itinerary_updated_at
  on public.itineraries;

create trigger set_itinerary_updated_at
  before update on public.itineraries
  for each row
  execute function private.set_itinerary_updated_at();

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
  );
$$;

revoke all on function private.is_admin()
  from public, anon;

grant execute on function private.is_admin()
  to authenticated;

revoke all on function private.set_itinerary_updated_at()
  from public, anon, authenticated;

grant execute on function private.set_itinerary_updated_at()
  to authenticated, service_role;

alter table public.itineraries
  enable row level security;

alter table public.itinerary_downloads
  enable row level security;

revoke all on table
  public.itineraries,
  public.itinerary_downloads
from public, anon, authenticated;

grant all on table
  public.itineraries,
  public.itinerary_downloads
to service_role;

grant select on table
  public.itineraries,
  public.itinerary_downloads
to authenticated;

grant insert, update, delete
  on public.itineraries
to authenticated;

drop policy if exists "Staff can read itineraries"
  on public.itineraries;

drop policy if exists "Admins can create itineraries"
  on public.itineraries;

drop policy if exists "Admins can update itineraries"
  on public.itineraries;

drop policy if exists "Admins can delete itineraries"
  on public.itineraries;

drop policy if exists "Staff can read itinerary downloads"
  on public.itinerary_downloads;

create policy "Staff can read itineraries"
  on public.itineraries
  for select
  to authenticated
  using ((select private.is_staff()));

create policy "Admins can create itineraries"
  on public.itineraries
  for insert
  to authenticated
  with check ((select private.is_admin()));

create policy "Admins can update itineraries"
  on public.itineraries
  for update
  to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

create policy "Admins can delete itineraries"
  on public.itineraries
  for delete
  to authenticated
  using ((select private.is_admin()));

create policy "Staff can read itinerary downloads"
  on public.itinerary_downloads
  for select
  to authenticated
  using ((select private.is_staff()));

commit;
