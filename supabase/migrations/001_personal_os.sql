-- Proposals: things Sarah suggests Christopher should action
create table public.proposals (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  project text,                         -- 'home', 'dls', 'wellness-platform', etc.
  category text,                        -- 'recommendation', 'today-focus', 'waiting-on-you', 'social-engine'
  title text not null,
  body text,                            -- markdown OK
  context_url text,                     -- optional deep link to source
  status text default 'pending',        -- 'pending', 'approved', 'rejected', 'snoozed', 'revising'
  decided_at timestamptz,
  decision_note text,                   -- Christopher's reason if revise/reject
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
  decision text not null,               -- 'approved', 'rejected', 'snoozed', 'revising'
  note text,
  decided_via text default 'dashboard'  -- 'dashboard', 'telegram', 'voice'
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
  task_type text not null,              -- 'subagent', 'cron', 'build', 'audit'
  label text not null,
  status text default 'running',        -- 'running', 'completed', 'failed', 'killed'
  session_key text,                     -- OpenClaw session reference
  metadata jsonb default '{}'::jsonb
);
create index idx_running_tasks_status on public.running_tasks(status, started_at desc);

-- Briefings: daily/weekly summaries
create table public.briefings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  type text not null,                   -- 'morning', 'evening', 'weekly-review', 'longevity', 'ufo-watch', 'body-man'
  title text not null,
  body text not null,                   -- markdown
  metadata jsonb default '{}'::jsonb
);
create index idx_briefings_created on public.briefings(created_at desc, type);

-- Helpful view: today's focus (top 3 pending approved-action proposals)
create or replace view public.today_focus as
select * from public.proposals
where category = 'today-focus' and status = 'pending'
order by created_at desc limit 3;
