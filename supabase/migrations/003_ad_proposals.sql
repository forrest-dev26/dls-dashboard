-- Ad proposals: daily generated ad copy + image for Meta Ads Manager
create table ad_proposals (
  id uuid primary key default gen_random_uuid(),
  series text not null check (series in ('salem','titanic','asylum')),
  status text not null default 'proposed' check (status in ('proposed','approved','rejected','edited')),
  headline text not null,
  primary_copy text not null,
  cta text not null,
  placement text not null default 'fb_ig_feed',
  hook_label text,
  image_path text,            -- relative path under public/ad-images/
  image_prompt text,          -- the prompt used to generate the image
  copy_prompt_version text,   -- versioned prompt template id used (e.g. 'eleanor-v1')
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  decided_at timestamptz,
  decided_by text             -- 'christopher' once decided
);

create index idx_ad_proposals_status on ad_proposals(status);
create index idx_ad_proposals_created on ad_proposals(created_at desc);
