-- 003_klaviyo_guard.sql — Klaviyo activation attempt logging
-- Every refused activation is logged here for audit visibility.

create table public.klaviyo_activation_attempts (
  id uuid primary key default gen_random_uuid(),
  attempted_at timestamptz default now(),
  endpoint text not null,
  payload jsonb,
  refused_reason text,
  user_agent text,
  metadata jsonb default '{}'::jsonb
);
create index idx_klaviyo_attempts_date on public.klaviyo_activation_attempts(attempted_at desc);
