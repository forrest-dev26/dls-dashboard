-- 002_expansion.sql — Phase 1 v1 expansion (translated from supabase/migrations/002_personal_os_expansion.sql)
-- Stripped: Supabase RLS policies, supabase_* schema references
-- Kept: IMMUTABLE-fix idx_daily_tasks_pending form

-- subagent_tasks
create table if not exists public.subagent_tasks (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  project text not null,
  agent_name text,
  label text not null,
  description text,
  status text default 'queued',
  source text default 'sarah-suggested',
  estimated_minutes int,
  started_at timestamptz,
  ended_at timestamptz,
  session_key text,
  rationale text,
  log_url text,
  metadata jsonb default '{}'::jsonb
);
create index if not exists idx_subagent_tasks_project_status
  on public.subagent_tasks(project, status, created_at desc);
create index if not exists idx_subagent_tasks_running
  on public.subagent_tasks(status)
  where status in ('running', 'queued', 'suggested');

-- content_items
create table if not exists public.content_items (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  project text not null,
  series text,
  asset_type text not null,
  platform text,
  status text default 'idea',
  title text not null,
  body text,
  image_url text,
  asset_urls jsonb default '[]'::jsonb,
  scheduled_for timestamptz,
  published_at timestamptz,
  proposal_id uuid references public.proposals(id),
  ab_variant_group text,
  performance jsonb default '{}'::jsonb,
  metadata jsonb default '{}'::jsonb
);
create index if not exists idx_content_status
  on public.content_items(project, status, created_at desc);
create index if not exists idx_content_scheduled
  on public.content_items(scheduled_for)
  where status = 'scheduled';
create index if not exists idx_content_ab
  on public.content_items(ab_variant_group)
  where ab_variant_group is not null;

-- relationship_roster
create table if not exists public.relationship_roster (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  name text not null,
  relationship_type text not null,
  cadence text,
  last_contact_at timestamptz,
  next_nudge_at timestamptz,
  birthday date,
  anniversary date,
  notes text,
  active boolean default true,
  metadata jsonb default '{}'::jsonb
);
create index if not exists idx_roster_nudge
  on public.relationship_roster(next_nudge_at)
  where active = true;
create index if not exists idx_roster_active
  on public.relationship_roster(relationship_type, active);

-- health_log
create table if not exists public.health_log (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  log_date date not null default current_date,
  category text not null,
  subcategory text,
  value jsonb not null,
  notes text,
  metadata jsonb default '{}'::jsonb
);
create index if not exists idx_health_date
  on public.health_log(log_date desc, category);
create index if not exists idx_health_category
  on public.health_log(category, subcategory, log_date desc);

-- idea_park
create table if not exists public.idea_park (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  project text,
  title text not null,
  body text,
  source text default 'dashboard',
  status text default 'parked',
  rotted_flag boolean default false,
  committed_to_project text,
  killed_reason text,
  metadata jsonb default '{}'::jsonb
);
create index if not exists idx_idea_park_status
  on public.idea_park(status, created_at desc);
create index if not exists idx_idea_park_rotting
  on public.idea_park(rotted_flag, created_at)
  where status = 'parked';

-- cost_telemetry
create table if not exists public.cost_telemetry (
  id uuid primary key default gen_random_uuid(),
  log_date date not null default current_date,
  vendor text not null,
  service text,
  project text,
  cost_usd numeric(10,4) not null,
  units int,
  unit_type text,
  metadata jsonb default '{}'::jsonb
);
create index if not exists idx_cost_date
  on public.cost_telemetry(log_date desc, vendor);
create index if not exists idx_cost_project
  on public.cost_telemetry(project, log_date desc);

-- daily_tasks
create table if not exists public.daily_tasks (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  task_date date not null default current_date,
  project text not null,
  title text not null,
  description text,
  source text default 'sarah-suggested',
  status text default 'pending',
  priority int default 2,
  estimated_minutes int,
  started_at timestamptz,
  completed_at timestamptz,
  rationale text,
  metadata jsonb default '{}'::jsonb
);
create index if not exists idx_daily_tasks_date_project
  on public.daily_tasks(task_date desc, project, status);
create index if not exists idx_daily_tasks_pending
  on public.daily_tasks(task_date, project)
  where status in ('pending', 'approved', 'started');

-- pillar_state
create table if not exists public.pillar_state (
  id uuid primary key default gen_random_uuid(),
  pillar text not null unique,
  updated_at timestamptz default now(),
  status text not null default 'green',
  summary text,
  last_touched_at timestamptz,
  notes text,
  metadata jsonb default '{}'::jsonb
);

-- Seed the six pillars
insert into public.pillar_state (pillar, status, summary)
values
  ('work',          'green',  'Active across DLS, Wellness, Personal OS Dashboard.'),
  ('physical',      'yellow', 'Workout protocol locked; pullup-stand + rower not yet assembled. Tuesday injection appointments active.'),
  ('cognitive',     'green',  'Daily reading + agentic-AI curriculum + learning pipeline.'),
  ('relationships', 'green',  'Daily marriage anchors active (morning coffee + evening together). Friend roster pending.'),
  ('hobbies',       'green',  'Reading, weekly hike, French press coffee, light gaming, essays.'),
  ('recovery',      'green',  '11 PM lights-out / 7 AM wake target. Bipolar mood-stability priority.')
on conflict (pillar) do nothing;

-- VIEWS

create or replace view public.today_daily_tasks as
select * from public.daily_tasks
where task_date = current_date
  and status in ('pending', 'approved', 'started')
order by priority asc, project, created_at;

create or replace view public.pulse as
select
  (select count(*) from public.proposals where status = 'pending')::int                              as pending_proposals,
  (select count(*) from public.daily_tasks
     where task_date = current_date and status in ('pending','approved'))::int                       as today_tasks_open,
  (select count(*) from public.subagent_tasks where status = 'running')::int                         as agents_running,
  (select count(*) from public.blockers where resolved_at is null)::int                              as blockers_open,
  (select count(*) from public.idea_park where rotted_flag = true and status = 'parked')::int        as ideas_rotting,
  (select count(*) from public.relationship_roster
     where active = true and next_nudge_at is not null and next_nudge_at <= now() + interval '2 days')::int
                                                                                                     as relationship_nudges_due;

create or replace view public.active_subagents as
select * from public.subagent_tasks
where status in ('running', 'queued', 'suggested')
order by
  case status
    when 'running'   then 1
    when 'queued'    then 2
    when 'suggested' then 3
  end,
  created_at desc;
