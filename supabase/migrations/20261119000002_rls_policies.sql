-- M1: Row Level Security policies (PRD §11.1)
alter table public.admin_users enable row level security;
alter table public.questions enable row level security;
alter table public.game_sessions enable row level security;
alter table public.players enable row level security;
alter table public.answers enable row level security;

-- Lock down default grants for anon; authenticated access is strictly gated by RLS
revoke all on table public.admin_users from anon;
revoke all on table public.questions from anon;
revoke all on table public.game_sessions from anon;
revoke all on table public.players from anon;
revoke all on table public.answers from anon;

revoke all on table public.admin_users from authenticated;
revoke all on table public.questions from authenticated;
revoke all on table public.game_sessions from authenticated;
revoke all on table public.players from authenticated;
revoke all on table public.answers from authenticated;

grant select on table public.admin_users to authenticated;
grant select, insert, update on table public.questions to authenticated;
grant select on table public.game_sessions to authenticated;
grant select on table public.players to authenticated;
grant select on table public.answers to authenticated;

-- admin_users: admin can read only their own row
create policy admin_users_select_self
  on public.admin_users
  for select
  to authenticated
  using (user_id = (select auth.uid()) and (select public.is_admin()));

-- questions: admin SELECT / INSERT / UPDATE (no DELETE; soft archive via archived_at)
create policy questions_admin_select
  on public.questions
  for select
  to authenticated
  using ((select public.is_admin()));

create policy questions_admin_insert
  on public.questions
  for insert
  to authenticated
  with check ((select public.is_admin()));

create policy questions_admin_update
  on public.questions
  for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- game_sessions, players, answers: admin SELECT for reporting; writes go via service_role RPCs (ADR-2)
create policy game_sessions_admin_select
  on public.game_sessions
  for select
  to authenticated
  using ((select public.is_admin()));

create policy players_admin_select
  on public.players
  for select
  to authenticated
  using ((select public.is_admin()));

create policy answers_admin_select
  on public.answers
  for select
  to authenticated
  using ((select public.is_admin()));
