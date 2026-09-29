-- Run this file in the Supabase SQL Editor as the project owner. It is safe to
-- re-run when upgrading a project that already has the original leads table.
-- Staff accounts are created in Supabase Auth, then explicitly provisioned in
-- public.profiles. A new Auth user has no lead access until that step.

begin;

create schema if not exists private;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text not null,
  role text not null check (role in ('admin', 'sales')),
  created_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  submission_id text not null unique,
  full_name text not null,
  email text,
  phone text not null,
  country_code text not null default '+84',
  destinations jsonb,
  duration text,
  travel_date text,
  custom_duration text,
  companion_type text,
  traveler_count integer,
  experiences jsonb,
  travel_pace text,
  budget text,
  special_requests text,
  traffic_type text not null,
  traffic_channel text not null,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  fbclid text,
  gclid text,
  wbraid text,
  gbraid text,
  ttclid text,
  first_touch jsonb,
  last_touch jsonb,
  first_touch_source text,
  first_touch_medium text,
  first_touch_campaign text,
  first_touch_content text,
  first_touch_term text,
  first_touch_landing_page text,
  first_touch_referrer text,
  first_touch_timestamp text,
  last_touch_source text,
  last_touch_medium text,
  last_touch_campaign text,
  last_touch_content text,
  last_touch_term text,
  last_touch_referrer text,
  last_touch_timestamp text,
  landing_page text,
  referrer text,
  user_agent text,
  status text not null default 'new',
  assigned_to uuid references public.profiles (id) on delete set null,
  sales_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint leads_status_check check (status in ('new', 'contacted', 'qualified', 'won', 'lost'))
);

-- Upgrade the original leads table without changing or discarding existing leads.
alter table public.leads
  add column if not exists assigned_to uuid,
  add column if not exists sales_note text,
  add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.leads'::regclass and conname = 'leads_assigned_to_fkey'
  ) then
    alter table public.leads
      add constraint leads_assigned_to_fkey
      foreign key (assigned_to) references public.profiles (id) on delete set null;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.leads'::regclass and conname = 'leads_status_check'
  ) then
    -- Legacy rows are left intact; new/updated rows must use a supported status.
    alter table public.leads
      add constraint leads_status_check
      check (status in ('new', 'contacted', 'qualified', 'won', 'lost')) not valid;
  end if;
end;
$$;

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_traffic_type_created_at_idx on public.leads (traffic_type, created_at desc);
create index if not exists leads_status_created_at_idx on public.leads (status, created_at desc);
create index if not exists leads_assigned_to_idx on public.leads (assigned_to);

create or replace function private.set_lead_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_lead_updated_at on public.leads;
create trigger set_lead_updated_at
  before update on public.leads
  for each row execute function private.set_lead_updated_at();

-- This function is outside exposed API schemas. It reads the current user's
-- profile with the function owner's rights, avoiding recursive profiles RLS.
create or replace function private.is_staff()
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
      and role in ('admin', 'sales')
  );
$$;

revoke all on schema private from public, anon;
grant usage on schema private to authenticated, service_role;
revoke all on function private.is_staff() from public, anon;
grant execute on function private.is_staff() to authenticated;
revoke all on function private.set_lead_updated_at() from public, anon, authenticated;
grant execute on function private.set_lead_updated_at() to authenticated, service_role;

alter table public.profiles enable row level security;
alter table public.leads enable row level security;

-- Public form submissions go through /api/leads with the server-only service
-- role key. Anonymous requests have no table privileges; signed-in staff can
-- edit only the three workflow columns granted here.
revoke all on table public.profiles, public.leads from public, anon, authenticated;
grant all on table public.profiles, public.leads to service_role;
grant select on table public.profiles, public.leads to authenticated;
grant update (status, assigned_to, sales_note) on public.leads to authenticated;

-- PostgreSQL ORs permissive policies. Remove any older policies so an earlier
-- broad grant cannot silently bypass the staff checks below.
do $$
declare
  old_policy record;
begin
  for old_policy in
    select tablename, policyname
    from pg_policies
    where schemaname = 'public' and tablename in ('profiles', 'leads')
  loop
    execute format('drop policy %I on public.%I', old_policy.policyname, old_policy.tablename);
  end loop;
end;
$$;

create policy "Staff can read profiles"
  on public.profiles for select to authenticated
  using ((select private.is_staff()));

create policy "Staff can read leads"
  on public.leads for select to authenticated
  using ((select private.is_staff()));

create policy "Staff can update lead workflow"
  on public.leads for update to authenticated
  using ((select private.is_staff()))
  with check ((select private.is_staff()));

commit;
