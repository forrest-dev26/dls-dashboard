-- 001_init.sql — Personal OS core tables (translated from supabase/migrations/001_personal_os.sql)
-- Stripped: Supabase RLS policies, supabase_* schema references
-- Added: pgcrypto extension for gen_random_uuid()

create extension if not exists pgcrypto;

-- Proposals: things Sarah suggests Christopher should action
create table public.proposals (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  project text,
  category text,
  title text not null,
  body text,
  context_url text,
  status text default 'pending',
  decided_at timestamptz,
  decision_note text,
  snooze_until timestamptz,
  metadata jsonb default '{}'::jsonb
);
create index idx_proposals_status on public.proposals(status, project);
create index idx_proposals_created on public.proposals(created_at desc);

-- Decisions: append-only log of every action Christopher takes
create table public.decisions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  proposal_id uuid references public.proposals(id),
  decision text not null,
  note text,
  decided_via text default 'dashboard'
);
create index idx_decisions_created on public.decisions(created_at desc);

-- Blockers: per-project items Sarah literally can't move forward without
create table public.blockers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  project text not null,
  title text not null,
  body text,
  resolved_at timestamptz,
  resolution_note text
);
create index idx_blockers_unresolved on public.blockers(project) where resolved_at is null;

-- Running tasks: background subagents and processes
create table public.running_tasks (
  id uuid primary key default gen_random_uuid(),
  started_at timestamptz default now(),
  ended_at timestamptz,
  task_type text not null,
  label text not null,
  status text default 'running',
  session_key text,
  metadata jsonb default '{}'::jsonb
);
create index idx_running_tasks_status on public.running_tasks(status, started_at desc);

-- Briefings: daily/weekly summaries
create table public.briefings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  type text not null,
  title text not null,
  body text not null,
  metadata jsonb default '{}'::jsonb
);
create index idx_briefings_created on public.briefings(created_at desc, type);

-- Helpful view: today's focus (top 3 pending approved-action proposals)
create or replace view public.today_focus as
select * from public.proposals
where category = 'today-focus' and status = 'pending'
order by created_at desc limit 3;
