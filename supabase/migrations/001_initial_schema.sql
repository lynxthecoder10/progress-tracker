create extension if not exists pgcrypto;

do $$
begin
  create type public.app_role as enum ('admin', 'member');
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
  create type public.task_status as enum ('todo', 'in_progress', 'done');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.task_priority as enum ('low', 'medium', 'high');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.skill_level as enum ('beginner', 'intermediate', 'advanced', 'production_ready');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.resource_category as enum ('fundamentals', 'frontend', 'backend', 'database', 'design', 'hackathon', 'tooling');
exception
  when duplicate_object then null;
end $$;

create schema if not exists app_private;
revoke all on schema app_private from public;
grant usage on schema app_private to authenticated;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 80),
  email text not null,
  role public.app_role not null default 'member',
  learning_track text not null default 'Fundamentals',
  avatar_url text,
  github_url text,
  warning_count integer not null default 0 check (warning_count between 0 and 3),
  responsibility_level text not null default 'Member',
  joined_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.weekly_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  week_start date not null,
  learned text not null,
  shipped text not null,
  blockers text not null default '',
  next_week_goal text not null,
  hours_spent numeric(5, 1) not null default 0 check (hours_spent >= 0 and hours_spent <= 120),
  status public.report_status not null default 'submitted',
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.users(id) on delete set null,
  unique (user_id, week_start)
);

create table if not exists public.leaderboard_stats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  xp integer not null default 0 check (xp >= 0),
  level integer not null default 1 check (level >= 1),
  current_streak integer not null default 0 check (current_streak >= 0),
  longest_streak integer not null default 0 check (longest_streak >= 0),
  consistency_score integer not null default 0 check (consistency_score between 0 and 100),
  contribution_score integer not null default 0 check (contribution_score between 0 and 100),
  weekly_reports_count integer not null default 0 check (weekly_reports_count >= 0),
  tasks_completed integer not null default 0 check (tasks_completed >= 0),
  resources_shared integer not null default 0 check (resources_shared >= 0),
  growth_rate integer not null default 0 check (growth_rate between 0 and 100),
  activity_score integer not null default 0 check (activity_score between 0 and 100),
  badges text[] not null default '{}',
  updated_at timestamptz not null default now()
);

create table if not exists public.warnings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  issued_by uuid references public.users(id) on delete set null,
  level integer not null check (level between 1 and 3),
  reason text not null,
  resolved boolean not null default false,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  category public.resource_category not null default 'fundamentals',
  url text,
  storage_path text,
  tags text[] not null default '{}',
  uploaded_by uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  check (url is not null or storage_path is not null)
);

create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  level public.skill_level not null default 'beginner',
  focus_area text not null default '',
  updated_at timestamptz not null default now(),
  unique (user_id, name)
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  assigned_to uuid references public.users(id) on delete set null,
  created_by uuid references public.users(id) on delete set null,
  status public.task_status not null default 'todo',
  priority public.task_priority not null default 'medium',
  due_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists users_role_idx on public.users(role);
create index if not exists weekly_reports_user_id_idx on public.weekly_reports(user_id);
create index if not exists weekly_reports_submitted_at_idx on public.weekly_reports(submitted_at desc);
create index if not exists leaderboard_stats_xp_idx on public.leaderboard_stats(xp desc);
create index if not exists warnings_user_id_idx on public.warnings(user_id);
create index if not exists resources_uploaded_by_idx on public.resources(uploaded_by);
create index if not exists skills_user_id_idx on public.skills(user_id);
create index if not exists tasks_assigned_to_idx on public.tasks(assigned_to);

create or replace function app_private.current_app_role()
returns public.app_role
language sql
stable
security definer
set search_path = public, auth, pg_temp
as $$
  select coalesce(
    (select role from public.users where id = (select auth.uid())),
    'member'::public.app_role
  );
$$;

revoke all on function app_private.current_app_role() from public;
grant execute on function app_private.current_app_role() to authenticated;

create or replace function app_private.ensure_leaderboard_stat(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.leaderboard_stats (user_id)
  values (target_user_id)
  on conflict (user_id) do nothing;
end;
$$;

revoke all on function app_private.ensure_leaderboard_stat(uuid) from public;

create or replace function app_private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  profile_name text;
begin
  profile_name := coalesce(nullif(new.raw_user_meta_data ->> 'name', ''), split_part(new.email, '@', 1));

  insert into public.users (id, display_name, email)
  values (new.id, profile_name, new.email)
  on conflict (id) do nothing;

  perform app_private.ensure_leaderboard_stat(new.id);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function app_private.handle_new_user();

create or replace function app_private.set_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists users_set_updated_at on public.users;
create trigger users_set_updated_at
  before update on public.users
  for each row execute function app_private.set_updated_at();

drop trigger if exists tasks_set_updated_at on public.tasks;
create trigger tasks_set_updated_at
  before update on public.tasks
  for each row execute function app_private.set_updated_at();

create or replace function app_private.apply_weekly_report_xp()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  perform app_private.ensure_leaderboard_stat(new.user_id);

  update public.leaderboard_stats
  set
    xp = xp + 100,
    level = greatest(1, floor((xp + 100) / 500)::integer + 1),
    current_streak = current_streak + 1,
    longest_streak = greatest(longest_streak, current_streak + 1),
    weekly_reports_count = weekly_reports_count + 1,
    consistency_score = least(100, consistency_score + 8),
    activity_score = least(100, activity_score + 6),
    growth_rate = least(100, growth_rate + 4),
    updated_at = now()
  where user_id = new.user_id;

  return new;
end;
$$;

drop trigger if exists weekly_reports_apply_xp on public.weekly_reports;
create trigger weekly_reports_apply_xp
  after insert on public.weekly_reports
  for each row execute function app_private.apply_weekly_report_xp();

create or replace function app_private.apply_resource_xp()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  perform app_private.ensure_leaderboard_stat(new.uploaded_by);

  update public.leaderboard_stats
  set
    xp = xp + 25,
    level = greatest(1, floor((xp + 25) / 500)::integer + 1),
    resources_shared = resources_shared + 1,
    contribution_score = least(100, contribution_score + 4),
    activity_score = least(100, activity_score + 3),
    updated_at = now()
  where user_id = new.uploaded_by;

  return new;
end;
$$;

drop trigger if exists resources_apply_xp on public.resources;
create trigger resources_apply_xp
  after insert on public.resources
  for each row execute function app_private.apply_resource_xp();

create or replace function app_private.apply_task_completion_xp()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.status = 'done' and old.status <> 'done' and new.assigned_to is not null then
    perform app_private.ensure_leaderboard_stat(new.assigned_to);

    update public.leaderboard_stats
    set
      xp = xp + 50,
      level = greatest(1, floor((xp + 50) / 500)::integer + 1),
      tasks_completed = tasks_completed + 1,
      contribution_score = least(100, contribution_score + 5),
      activity_score = least(100, activity_score + 4),
      updated_at = now()
    where user_id = new.assigned_to;
  end if;

  return new;
end;
$$;

drop trigger if exists tasks_apply_completion_xp on public.tasks;
create trigger tasks_apply_completion_xp
  after update of status on public.tasks
  for each row execute function app_private.apply_task_completion_xp();

create or replace function app_private.sync_warning_count()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  target_user uuid;
  active_level integer;
begin
  target_user := coalesce(new.user_id, old.user_id);

  select coalesce(max(level), 0)
  into active_level
  from public.warnings
  where user_id = target_user and resolved = false;

  update public.users
  set
    warning_count = active_level,
    responsibility_level = case
      when active_level >= 3 then 'Removal candidate'
      when active_level = 2 then 'Restricted responsibility'
      when active_level = 1 then 'Needs consistency'
      else 'Member'
    end,
    updated_at = now()
  where id = target_user;

  if TG_OP = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

drop trigger if exists warnings_sync_user_count on public.warnings;
create trigger warnings_sync_user_count
  after insert or update or delete on public.warnings
  for each row execute function app_private.sync_warning_count();

alter table public.users enable row level security;
alter table public.weekly_reports enable row level security;
alter table public.leaderboard_stats enable row level security;
alter table public.warnings enable row level security;
alter table public.resources enable row level security;
alter table public.skills enable row level security;
alter table public.tasks enable row level security;

drop policy if exists "Members can read users" on public.users;
create policy "Members can read users"
on public.users for select
to authenticated
using (true);

drop policy if exists "Members can update own profile" on public.users;
create policy "Members can update own profile"
on public.users for update
to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

drop policy if exists "Members can read scoped reports" on public.weekly_reports;
create policy "Members can read scoped reports"
on public.weekly_reports for select
to authenticated
using (
  user_id = (select auth.uid())
  or (select app_private.current_app_role()) = 'admin'
);

drop policy if exists "Members can submit own weekly reports" on public.weekly_reports;
create policy "Members can submit own weekly reports"
on public.weekly_reports for insert
to authenticated
with check (user_id = (select auth.uid()));

drop policy if exists "Admins can review weekly reports" on public.weekly_reports;
create policy "Admins can review weekly reports"
on public.weekly_reports for update
to authenticated
using ((select app_private.current_app_role()) = 'admin')
with check ((select app_private.current_app_role()) = 'admin');

drop policy if exists "Members can read leaderboard" on public.leaderboard_stats;
create policy "Members can read leaderboard"
on public.leaderboard_stats for select
to authenticated
using (true);

drop policy if exists "Admins can maintain leaderboard stats" on public.leaderboard_stats;
create policy "Admins can maintain leaderboard stats"
on public.leaderboard_stats for update
to authenticated
using ((select app_private.current_app_role()) = 'admin')
with check ((select app_private.current_app_role()) = 'admin');

drop policy if exists "Members can read scoped warnings" on public.warnings;
create policy "Members can read scoped warnings"
on public.warnings for select
to authenticated
using (
  user_id = (select auth.uid())
  or issued_by = (select auth.uid())
  or (select app_private.current_app_role()) = 'admin'
);

drop policy if exists "Admins can issue warnings" on public.warnings;
create policy "Admins can issue warnings"
on public.warnings for insert
to authenticated
with check (
  issued_by = (select auth.uid())
  and (select app_private.current_app_role()) = 'admin'
);

drop policy if exists "Admins can resolve warnings" on public.warnings;
create policy "Admins can resolve warnings"
on public.warnings for update
to authenticated
using ((select app_private.current_app_role()) = 'admin')
with check ((select app_private.current_app_role()) = 'admin');

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

drop policy if exists "Owners and admins can update resources" on public.resources;
create policy "Owners and admins can update resources"
on public.resources for update
to authenticated
using (uploaded_by = (select auth.uid()) or (select app_private.current_app_role()) = 'admin')
with check (uploaded_by = (select auth.uid()) or (select app_private.current_app_role()) = 'admin');

drop policy if exists "Owners and admins can delete resources" on public.resources;
create policy "Owners and admins can delete resources"
on public.resources for delete
to authenticated
using (uploaded_by = (select auth.uid()) or (select app_private.current_app_role()) = 'admin');

drop policy if exists "Members can read skills" on public.skills;
create policy "Members can read skills"
on public.skills for select
to authenticated
using (true);

drop policy if exists "Members can add own skills" on public.skills;
create policy "Members can add own skills"
on public.skills for insert
to authenticated
with check (user_id = (select auth.uid()) or (select app_private.current_app_role()) = 'admin');

drop policy if exists "Members can update own skills" on public.skills;
create policy "Members can update own skills"
on public.skills for update
to authenticated
using (user_id = (select auth.uid()) or (select app_private.current_app_role()) = 'admin')
with check (user_id = (select auth.uid()) or (select app_private.current_app_role()) = 'admin');

drop policy if exists "Members can read visible tasks" on public.tasks;
create policy "Members can read visible tasks"
on public.tasks for select
to authenticated
using (
  assigned_to is null
  or assigned_to = (select auth.uid())
  or created_by = (select auth.uid())
  or (select app_private.current_app_role()) = 'admin'
);

drop policy if exists "Admins can create tasks" on public.tasks;
create policy "Admins can create tasks"
on public.tasks for insert
to authenticated
with check (
  created_by = (select auth.uid())
  and (select app_private.current_app_role()) = 'admin'
);

drop policy if exists "Members can complete assigned tasks" on public.tasks;
create policy "Members can complete assigned tasks"
on public.tasks for update
to authenticated
using (assigned_to = (select auth.uid()) or (select app_private.current_app_role()) = 'admin')
with check (assigned_to = (select auth.uid()) or (select app_private.current_app_role()) = 'admin');

revoke all on public.users from anon, authenticated;
revoke all on public.weekly_reports from anon, authenticated;
revoke all on public.leaderboard_stats from anon, authenticated;
revoke all on public.warnings from anon, authenticated;
revoke all on public.resources from anon, authenticated;
revoke all on public.skills from anon, authenticated;
revoke all on public.tasks from anon, authenticated;

grant select on public.users to authenticated;
grant update (display_name, learning_track, avatar_url, github_url, updated_at) on public.users to authenticated;

grant select on public.weekly_reports to authenticated;
grant insert (user_id, week_start, learned, shipped, blockers, next_week_goal, hours_spent) on public.weekly_reports to authenticated;
grant update (status, reviewed_at, reviewed_by) on public.weekly_reports to authenticated;

grant select, update on public.leaderboard_stats to authenticated;

grant select on public.warnings to authenticated;
grant insert (user_id, issued_by, level, reason) on public.warnings to authenticated;
grant update (resolved, resolved_at) on public.warnings to authenticated;

grant select, insert, update, delete on public.resources to authenticated;
grant select, insert, update, delete on public.skills to authenticated;

grant select on public.tasks to authenticated;
grant insert (title, description, assigned_to, created_by, priority, due_at) on public.tasks to authenticated;
grant update (status, completed_at, updated_at) on public.tasks to authenticated;

insert into storage.buckets (id, name, public)
values ('resource-files', 'resource-files', false)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Authenticated members can read resource files" on storage.objects;
create policy "Authenticated members can read resource files"
on storage.objects for select
to authenticated
using (bucket_id = 'resource-files');

drop policy if exists "Members can upload to own resource folder" on storage.objects;
create policy "Members can upload to own resource folder"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'resource-files'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "Members can update own resource files" on storage.objects;
create policy "Members can update own resource files"
on storage.objects for update
to authenticated
using (
  bucket_id = 'resource-files'
  and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
  bucket_id = 'resource-files'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "Members can delete own resource files" on storage.objects;
create policy "Members can delete own resource files"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'resource-files'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
