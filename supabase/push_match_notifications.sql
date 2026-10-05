-- StoneFinder automatic match push notifications — stage 3
-- Run once in Supabase SQL Editor after push_notifications.sql from stage 2.

create table if not exists public.push_match_notifications (
  source_listing_id uuid not null references public.listings(id) on delete cascade,
  recipient_user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (source_listing_id, recipient_user_id)
);

create index if not exists push_match_notifications_recipient_idx
  on public.push_match_notifications(recipient_user_id);

alter table public.push_match_notifications enable row level security;

-- No client policies on purpose.
-- This table is an internal delivery log and is accessed only by the
-- server-side Supabase service role. The service-role key must never be
-- exposed to browser code or use a NEXT_PUBLIC_ prefix.
