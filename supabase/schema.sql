-- BSHM Connect cloud schema
-- Run this in Supabase SQL Editor. Never put the service-role key in Vite or browser code.

create table if not exists public.announcements (
  id text primary key,
  title text not null check (char_length(title) between 1 and 100),
  text text not null check (char_length(text) between 1 and 5000),
  date text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.events (
  id text primary key,
  title text not null,
  date text not null,
  description text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.concerns (
  id text primary key,
  name text not null,
  category text not null,
  subject text not null check (char_length(subject) between 1 and 200),
  message text not null check (char_length(message) between 1 and 10000),
  status text not null default 'Received' check (status in ('Received', 'Under Review', 'Resolved')),
  date text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.officers (
  id text primary key,
  name text not null check (char_length(name) between 1 and 120),
  position text not null check (char_length(position) between 1 and 120),
  tier_level text,
  tier_name text,
  role_tag text,
  icon text,
  is_governor boolean not null default false,
  photo text,
  created_at timestamptz not null default now()
);

create table if not exists public.milestones (
  id text primary key,
  title text not null check (char_length(title) between 1 and 200),
  category text not null,
  date text not null,
  year text not null,
  badge_icon text,
  description text not null check (char_length(description) between 1 and 10000),
  participants text,
  images text[] not null default '{}',
  author_role text,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.announcements enable row level security;
alter table public.events enable row level security;
alter table public.concerns enable row level security;
alter table public.officers enable row level security;
alter table public.milestones enable row level security;

-- Public users can read published content and submit concerns.
drop policy if exists "public can read announcements" on public.announcements;
create policy "public can read announcements" on public.announcements for select using (true);
drop policy if exists "public can read events" on public.events;
create policy "public can read events" on public.events for select using (true);
drop policy if exists "public can read officers" on public.officers;
create policy "public can read officers" on public.officers for select using (true);
drop policy if exists "public can read milestones" on public.milestones;
create policy "public can read milestones" on public.milestones for select using (true);
drop policy if exists "public can submit concerns" on public.concerns;
create policy "public can submit concerns" on public.concerns for insert with check (true);

create table if not exists public.staff_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('Operator', 'BSHM Officer', 'Department Adviser')),
  created_at timestamptz not null default now()
);

alter table public.staff_profiles drop constraint if exists staff_profiles_role_check;
alter table public.staff_profiles add constraint staff_profiles_role_check
  check (role in ('Operator', 'BSHM Officer', 'Department Adviser'));

alter table public.staff_profiles enable row level security;

create or replace function public.is_staff_member()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.staff_profiles where user_id = auth.uid()
  );
$$;

revoke all on function public.is_staff_member() from public;
grant execute on function public.is_staff_member() to authenticated;

drop policy if exists "staff can read concerns" on public.concerns;
create policy "staff can read concerns" on public.concerns
for select to authenticated using (public.is_staff_member());

drop policy if exists "staff can read own profile" on public.staff_profiles;
create policy "staff can read own profile" on public.staff_profiles
for select to authenticated using (auth.uid() = user_id);

drop policy if exists "staff can create announcements" on public.announcements;
create policy "staff can create announcements" on public.announcements
for insert to authenticated with check (public.is_staff_member());

drop policy if exists "staff can update announcements" on public.announcements;
create policy "staff can update announcements" on public.announcements
for update to authenticated using (public.is_staff_member())
with check (public.is_staff_member());

drop policy if exists "staff can delete announcements" on public.announcements;
create policy "staff can delete announcements" on public.announcements
for delete to authenticated using (public.is_staff_member());

drop policy if exists "staff can create events" on public.events;
create policy "staff can create events" on public.events
for insert to authenticated with check (public.is_staff_member());

drop policy if exists "staff can update events" on public.events;
create policy "staff can update events" on public.events
for update to authenticated using (public.is_staff_member())
with check (public.is_staff_member());

drop policy if exists "staff can delete events" on public.events;
create policy "staff can delete events" on public.events
for delete to authenticated using (public.is_staff_member());

drop policy if exists "staff can create milestones" on public.milestones;
create policy "staff can create milestones" on public.milestones
for insert to authenticated with check (public.is_staff_member());

drop policy if exists "staff can update milestones" on public.milestones;
create policy "staff can update milestones" on public.milestones
for update to authenticated using (public.is_staff_member())
with check (public.is_staff_member());

drop policy if exists "staff can delete milestones" on public.milestones;
create policy "staff can delete milestones" on public.milestones
for delete to authenticated using (public.is_staff_member());

drop policy if exists "staff can create officers" on public.officers;
create policy "staff can create officers" on public.officers
for insert to authenticated with check (public.is_staff_member());

drop policy if exists "staff can update officers" on public.officers;
create policy "staff can update officers" on public.officers
for update to authenticated using (public.is_staff_member())
with check (public.is_staff_member());

drop policy if exists "staff can delete officers" on public.officers;
create policy "staff can delete officers" on public.officers
for delete to authenticated using (public.is_staff_member());

drop policy if exists "staff can update concerns" on public.concerns;
create policy "staff can update concerns" on public.concerns
for update to authenticated using (public.is_staff_member())
with check (public.is_staff_member());
