-- M1: Initial schema for Kuis Keberagaman & Antiintoleransi
create extension if not exists pgcrypto;

create type public.question_type as enum ('multiple_choice', 'true_false');
create type public.session_status as enum ('lobby', 'running', 'finished', 'cancelled');

-- Admin allowlist
create table public.admin_users (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = (select auth.uid())
  )
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- Question bank
create table public.questions (
  id                 uuid primary key default gen_random_uuid(),
  type               public.question_type not null,
  prompt             text not null check (char_length(prompt) between 5 and 500),
  options            jsonb not null check (
                       jsonb_typeof(options) = 'array'
                       and jsonb_array_length(options) between 2 and 4
                     ),
  correct_option_id  text not null,
  explanation        text check (explanation is null or char_length(explanation) <= 500),
  time_limit_seconds int  not null default 20 check (time_limit_seconds between 5 and 120),
  base_points        int  not null default 1000 check (base_points between 100 and 2000),
  position           int  not null,
  archived_at        timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index questions_active_position_idx
  on public.questions (position)
  where archived_at is null;

create trigger questions_set_updated_at
  before update on public.questions
  for each row
  execute function public.set_updated_at();

-- Game sessions
create table public.game_sessions (
  id                   uuid primary key default gen_random_uuid(),
  status               public.session_status not null default 'lobby',
  question_order       uuid[] not null,
  total_questions      int    not null check (total_questions > 0),
  current_index        int    not null default -1,
  question_started_at  timestamptz,
  question_ends_at     timestamptz,
  question_closed_at   timestamptz,
  allow_late_join      boolean not null default false,
  join_pin             text check (join_pin is null or join_pin ~ '^[0-9]{4}$'),
  state_version        int    not null default 0,
  created_by           uuid   references auth.users (id) on delete set null,
  created_at           timestamptz not null default now(),
  started_at           timestamptz,
  finished_at          timestamptz
);

-- Only one active session (lobby or running) at a time
create unique index one_active_session
  on public.game_sessions ((true))
  where status in ('lobby', 'running');

-- Players
create table public.players (
  id               uuid primary key default gen_random_uuid(),
  session_id       uuid not null references public.game_sessions (id) on delete cascade,
  name             text not null check (char_length(name) between 2 and 24),
  name_key         text generated always as (lower(btrim(name))) stored,
  token_hash       text not null,
  total_score      int  not null default 0,
  correct_count    int  not null default 0,
  total_correct_ms bigint not null default 0,
  joined_at        timestamptz not null default now(),
  unique (session_id, name_key)
);

create index players_leaderboard_idx
  on public.players (session_id, total_score desc, total_correct_ms asc, joined_at asc);

-- Answers
create table public.answers (
  id                 uuid primary key default gen_random_uuid(),
  session_id         uuid not null references public.game_sessions (id) on delete cascade,
  player_id          uuid not null references public.players (id) on delete cascade,
  question_id        uuid not null references public.questions (id),
  question_index     int  not null,
  selected_option_id text not null,
  is_correct         boolean not null,
  response_ms        int  not null check (response_ms >= 0),
  points             int  not null check (points >= 0),
  answered_at        timestamptz not null default clock_timestamp(),
  unique (session_id, player_id, question_index)
);

create index answers_session_question_idx
  on public.answers (session_id, question_index);
