create extension if not exists pgcrypto;

do $$
begin
  create type public.app_role as enum ('admin', 'lead', 'member');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.report_status as enum ('submitted', 'approved', 'needs_work');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.task_status as enum ('todo', 'in_progress', 'blocked', 'done');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.task_type as enum ('learning', 'build', 'team', 'hackathon');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.submission_status as enum ('idea', 'building', 'submitted', 'shipped');
exception
  when duplicate_object then null;
end $$;

create schema if not exists app_private;
revoke all on schema app_private from public;
grant usage on schema app_private to authenticated;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  role public.app_role not null default 'member',
  skills text[] not null default '{}',
  warning_count integer not null default 0 check (warning_count >= 0),
  streak integer not null default 0 check (streak >= 0),
  contribution_score integer not null default 0 check (contribution_score >= 0),
  learning_track text not null default 'Foundations',
  github_url text,
  portfolio_url text,
  hours_learned numeric(8, 1) not null default 0 check (hours_learned >= 0),
  tasks_completed integer not null default 0 check (tasks_completed >= 0),
  projects_shipped integer not null default 0 check (projects_shipped >= 0),
  bugs_solved integer not null default 0 check (bugs_solved >= 0),
  apis_integrated integer not null default 0 check (apis_integrated >= 0),
  github_commits integer not null default 0 check (github_commits >= 0),
  attendance_rate numeric(5, 2) not null default 100 check (attendance_rate >= 0 and attendance_rate <= 100),
  team_help_score integer not null default 0 check (team_help_score >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.weekly_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  learned text not null,
  built text not null,
  blockers text not null default '',
  next_goal text not null,
  status public.report_status not null default 'submitted',
  submitted_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  assigned_to uuid references public.profiles(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  status public.task_status not null default 'todo',
  task_type public.task_type not null default 'learning',
  deadline timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  uploaded_by uuid not null references public.profiles(id) on delete cascade,
  link text not null,
  tags text[] not null default '{}',
  upvotes integer not null default 0 check (upvotes >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.hackathons (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  starts_at timestamptz not null,
  deadline timestamptz not null,
  team_members uuid[] not null default '{}',
  roles_needed text[] not null default '{}',
  idea text not null default '',
  project_status text not null default 'Planning',
  submission_status public.submission_status not null default 'idea',
  created_at timestamptz not null default now()
);

create table if not exists public.warnings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  issued_by uuid references public.profiles(id) on delete set null,
  reason text not null,
  level integer not null check (level between 1 and 3),
  resolved boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles(role);
create index if not exists weekly_reports_user_id_idx on public.weekly_reports(user_id);
create index if not exists weekly_reports_submitted_at_idx on public.weekly_reports(submitted_at desc);
create index if not exists tasks_assigned_to_idx on public.tasks(assigned_to);
create index if not exists resources_uploaded_by_idx on public.resources(uploaded_by);
create index if not exists warnings_user_id_idx on public.warnings(user_id);

create or replace function app_private.current_user_role()
returns public.app_role
language sql
stable
security definer
set search_path = public, auth, pg_temp
as $$
  select coalesce(
    (select role from public.profiles where id = (select auth.uid())),
    'member'::public.app_role
  );
$$;

revoke all on function app_private.current_user_role() from public;
grant execute on function app_private.current_user_role() to authenticated;

create or replace function app_private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
begin
  insert into public.profiles (id, name, email)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'name', ''), split_part(new.email, '@', 1)),
    new.email
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function app_private.handle_new_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.weekly_reports enable row level security;
alter table public.tasks enable row level security;
alter table public.resources enable row level security;
alter table public.hackathons enable row level security;
alter table public.warnings enable row level security;

drop policy if exists "Members can read profiles" on public.profiles;
create policy "Members can read profiles"
on public.profiles for select
to authenticated
using (true);

drop policy if exists "Members can insert own profile" on public.profiles;
create policy "Members can insert own profile"
on public.profiles for insert
to authenticated
with check (id = (select auth.uid()) and role = 'member');

drop policy if exists "Members can update own public profile fields" on public.profiles;
create policy "Members can update own public profile fields"
on public.profiles for update
to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

drop policy if exists "Leads can review reports" on public.weekly_reports;
create policy "Leads can review reports"
on public.weekly_reports for select
to authenticated
using (
  user_id = (select auth.uid())
  or (select app_private.current_user_role()) in ('admin', 'lead')
);

drop policy if exists "Members can submit own reports" on public.weekly_reports;
create policy "Members can submit own reports"
on public.weekly_reports for insert
to authenticated
with check (user_id = (select auth.uid()));

drop policy if exists "Leads can update report status" on public.weekly_reports;
create policy "Leads can update report status"
on public.weekly_reports for update
to authenticated
using ((select app_private.current_user_role()) in ('admin', 'lead'))
with check ((select app_private.current_user_role()) in ('admin', 'lead'));

drop policy if exists "Members can read visible tasks" on public.tasks;
create policy "Members can read visible tasks"
on public.tasks for select
to authenticated
using (
  assigned_to is null
  or assigned_to = (select auth.uid())
  or created_by = (select auth.uid())
  or (select app_private.current_user_role()) in ('admin', 'lead')
);

drop policy if exists "Leads can create tasks" on public.tasks;
create policy "Leads can create tasks"
on public.tasks for insert
to authenticated
with check (
  created_by = (select auth.uid())
  and (select app_private.current_user_role()) in ('admin', 'lead')
);

drop policy if exists "Leads can manage tasks" on public.tasks;
create policy "Leads can manage tasks"
on public.tasks for update
to authenticated
using ((select app_private.current_user_role()) in ('admin', 'lead'))
with check ((select app_private.current_user_role()) in ('admin', 'lead'));

drop policy if exists "Members can read resources" on public.resources;
create policy "Members can read resources"
on public.resources for select
to authenticated
using (true);

drop policy if exists "Members can add resources" on public.resources;
create policy "Members can add resources"
on public.resources for insert
to authenticated
with check (uploaded_by = (select auth.uid()));

drop policy if exists "Owners and leads can update resources" on public.resources;
create policy "Owners and leads can update resources"
on public.resources for update
to authenticated
using (
  uploaded_by = (select auth.uid())
  or (select app_private.current_user_role()) in ('admin', 'lead')
)
with check (
  uploaded_by = (select auth.uid())
  or (select app_private.current_user_role()) in ('admin', 'lead')
);

drop policy if exists "Owners and leads can delete resources" on public.resources;
create policy "Owners and leads can delete resources"
on public.resources for delete
to authenticated
using (
  uploaded_by = (select auth.uid())
  or (select app_private.current_user_role()) in ('admin', 'lead')
);

drop policy if exists "Members can read hackathons" on public.hackathons;
create policy "Members can read hackathons"
on public.hackathons for select
to authenticated
using (true);

drop policy if exists "Leads can create hackathons" on public.hackathons;
create policy "Leads can create hackathons"
on public.hackathons for insert
to authenticated
with check ((select app_private.current_user_role()) in ('admin', 'lead'));

drop policy if exists "Leads can manage hackathons" on public.hackathons;
create policy "Leads can manage hackathons"
on public.hackathons for update
to authenticated
using ((select app_private.current_user_role()) in ('admin', 'lead'))
with check ((select app_private.current_user_role()) in ('admin', 'lead'));

drop policy if exists "Members can read own warnings" on public.warnings;
create policy "Members can read own warnings"
on public.warnings for select
to authenticated
using (
  user_id = (select auth.uid())
  or issued_by = (select auth.uid())
  or (select app_private.current_user_role()) in ('admin', 'lead')
);

drop policy if exists "Leads can issue warnings" on public.warnings;
create policy "Leads can issue warnings"
on public.warnings for insert
to authenticated
with check (
  issued_by = (select auth.uid())
  and (select app_private.current_user_role()) in ('admin', 'lead')
);

drop policy if exists "Leads can resolve warnings" on public.warnings;
create policy "Leads can resolve warnings"
on public.warnings for update
to authenticated
using ((select app_private.current_user_role()) in ('admin', 'lead'))
with check ((select app_private.current_user_role()) in ('admin', 'lead'));

revoke all on public.profiles from anon, authenticated;
revoke all on public.weekly_reports from anon, authenticated;
revoke all on public.tasks from anon, authenticated;
revoke all on public.resources from anon, authenticated;
revoke all on public.hackathons from anon, authenticated;
revoke all on public.warnings from anon, authenticated;

grant select on public.profiles to authenticated;
grant insert (id, name, email, skills, learning_track, github_url, portfolio_url) on public.profiles to authenticated;
grant update (name, skills, learning_track, github_url, portfolio_url, updated_at) on public.profiles to authenticated;

grant select, insert, update on public.weekly_reports to authenticated;
grant select, insert, update on public.tasks to authenticated;
grant select, insert, update, delete on public.resources to authenticated;
grant select, insert, update on public.hackathons to authenticated;
grant select, insert, update on public.warnings to authenticated;

insert into storage.buckets (id, name, public)
values ('member-resources', 'member-resources', false)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Authenticated members can read resource files" on storage.objects;
create policy "Authenticated members can read resource files"
on storage.objects for select
to authenticated
using (bucket_id = 'member-resources');

drop policy if exists "Members can upload to own resource folder" on storage.objects;
create policy "Members can upload to own resource folder"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'member-resources'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "Members can update own resource files" on storage.objects;
create policy "Members can update own resource files"
on storage.objects for update
to authenticated
using (
  bucket_id = 'member-resources'
  and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
  bucket_id = 'member-resources'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "Members can delete own resource files" on storage.objects;
create policy "Members can delete own resource files"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'member-resources'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
