-- UniStack application schema. Run this file in the Supabase SQL Editor.
create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  university text,
  programme text,
  semester text,
  timezone text not null default 'Pacific/Fiji',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  code text not null,
  color text not null,
  lecturer text,
  tutor text,
  location text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, code)
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid references public.courses(id) on delete set null,
  title text not null,
  event_type text not null,
  term_type text not null check (term_type in ('LT', 'ST')),
  event_date date not null,
  start_time time not null,
  end_time time not null,
  location text,
  notes text,
  color text,
  recurrence_type text not null default 'none' check (recurrence_type in ('none', 'weekly')),
  recurrence_end_date date,
  recurrence_group_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_time > start_time)
);

create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid references public.courses(id) on delete set null,
  title text not null,
  due_date date not null,
  priority text not null check (priority in ('Low', 'Medium', 'High')),
  estimated_hours numeric,
  progress integer not null default 0 check (progress between 0 and 100),
  status text not null default 'Not Started' check (status in ('Not Started', 'In Progress', 'Ready to Submit', 'Submitted', 'Completed')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists courses_user_id_idx on public.courses(user_id);
create index if not exists courses_user_code_idx on public.courses(user_id, code);
create index if not exists events_user_id_idx on public.events(user_id);
create index if not exists events_user_date_idx on public.events(user_id, event_date);
create index if not exists assignments_user_id_idx on public.assignments(user_id);
create index if not exists assignments_user_due_date_idx on public.assignments(user_id, due_date);
create index if not exists events_user_course_id_idx on public.events(user_id, course_id);
create index if not exists assignments_user_course_id_idx on public.assignments(user_id, course_id);

create or replace function public.set_updated_at()
returns trigger language plpgsql security invoker set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name) values (new.id, new.raw_user_meta_data ->> 'full_name') on conflict (id) do nothing;
  return new;
end;
$$;

create or replace trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create or replace trigger courses_updated_at before update on public.courses for each row execute function public.set_updated_at();
create or replace trigger events_updated_at before update on public.events for each row execute function public.set_updated_at();
create or replace trigger assignments_updated_at before update on public.assignments for each row execute function public.set_updated_at();
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- RLS keeps all planner data private to the authenticated owner.
alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.events enable row level security;
alter table public.assignments enable row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles for select to authenticated using (id = auth.uid());
drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles for insert to authenticated with check (id = auth.uid());
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
drop policy if exists profiles_delete_own on public.profiles;
create policy profiles_delete_own on public.profiles for delete to authenticated using (id = auth.uid());

-- Every planner table requires user_id to match the active Supabase user.
drop policy if exists courses_select_own on public.courses;
create policy courses_select_own on public.courses for select to authenticated using (user_id = auth.uid());
drop policy if exists courses_insert_own on public.courses;
create policy courses_insert_own on public.courses for insert to authenticated with check (user_id = auth.uid());
drop policy if exists courses_update_own on public.courses;
create policy courses_update_own on public.courses for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists courses_delete_own on public.courses;
create policy courses_delete_own on public.courses for delete to authenticated using (user_id = auth.uid());
drop policy if exists events_select_own on public.events;
create policy events_select_own on public.events for select to authenticated using (user_id = auth.uid());
drop policy if exists events_insert_own on public.events;
create policy events_insert_own on public.events for insert to authenticated with check (user_id = auth.uid());
drop policy if exists events_update_own on public.events;
create policy events_update_own on public.events for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists events_delete_own on public.events;
create policy events_delete_own on public.events for delete to authenticated using (user_id = auth.uid());
drop policy if exists assignments_select_own on public.assignments;
create policy assignments_select_own on public.assignments for select to authenticated using (user_id = auth.uid());
drop policy if exists assignments_insert_own on public.assignments;
create policy assignments_insert_own on public.assignments for insert to authenticated with check (user_id = auth.uid());
drop policy if exists assignments_update_own on public.assignments;
create policy assignments_update_own on public.assignments for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists assignments_delete_own on public.assignments;
create policy assignments_delete_own on public.assignments for delete to authenticated using (user_id = auth.uid());

comment on table public.profiles is 'Private profile row for the owning auth user.';
comment on table public.courses is 'Private courses owned by user_id.';
comment on table public.events is 'Private schedule events owned by user_id.';
comment on table public.assignments is 'Private assignments owned by user_id.';
