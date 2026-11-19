-- Fix: Grant least-privilege SELECT access on game tables to service_role
-- Required for BFF reads via createServiceRoleClient() (ADR-2) when using sb_secret keys.
-- All writes continue to execute exclusively through SECURITY DEFINER RPCs.
grant usage on schema public to service_role;

grant select on table public.game_sessions to service_role;
grant select on table public.players to service_role;
grant select on table public.questions to service_role;
grant select on table public.answers to service_role;
grant select on table public.admin_users to service_role;
