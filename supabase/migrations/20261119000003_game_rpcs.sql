-- M1: Game RPCs (SECURITY DEFINER, search_path = '', GRANT EXECUTE only to service_role)

-- 1. create_session
create or replace function public.create_session(
  p_created_by uuid,
  p_allow_late_join boolean default false,
  p_join_pin text default null
)
returns public.game_sessions
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_now timestamptz := clock_timestamp();
  v_order uuid[];
  v_session public.game_sessions%rowtype;
begin
  -- Auto-cancel forgotten active sessions older than 12 hours
  update public.game_sessions
     set status = 'cancelled',
         finished_at = v_now,
         state_version = state_version + 1
   where status in ('lobby', 'running')
     and created_at < v_now - interval '12 hours';

  -- Reject if a recent active session already exists
  if exists (
    select 1
      from public.game_sessions
     where status in ('lobby', 'running')
  ) then
    raise exception 'ACTIVE_SESSION_EXISTS';
  end if;

  if p_join_pin is not null and p_join_pin !~ '^[0-9]{4}$' then
    raise exception 'INVALID_PIN';
  end if;

  select array_agg(id order by position asc, created_at asc, id asc)
    into v_order
    from public.questions
   where archived_at is null;

  if v_order is null or cardinality(v_order) = 0 then
    raise exception 'NO_QUESTIONS';
  end if;

  insert into public.game_sessions (
    status,
    question_order,
    total_questions,
    current_index,
    allow_late_join,
    join_pin,
    state_version,
    created_by
  )
  values (
    'lobby',
    v_order,
    cardinality(v_order),
    -1,
    coalesce(p_allow_late_join, false),
    p_join_pin,
    0,
    p_created_by
  )
  returning * into v_session;

  return v_session;
exception
  when unique_violation then
    raise exception 'ACTIVE_SESSION_EXISTS';
end;
$$;

-- 2. join_session
create or replace function public.join_session(
  p_name text,
  p_token_hash text,
  p_pin text default null
)
returns table (
  player_id uuid,
  player_name text,
  session_id uuid,
  session_status public.session_status,
  state_version int
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  s public.game_sessions%rowtype;
  v_clean_name text := btrim(regexp_replace(coalesce(p_name, ''), '\s+', ' ', 'g'));
  v_player_count int;
  v_player_id uuid;
begin
  if char_length(v_clean_name) < 2 or char_length(v_clean_name) > 24 then
    raise exception 'NAME_INVALID';
  end if;

  select *
    into s
    from public.game_sessions
   where status in ('lobby', 'running')
   order by created_at desc
   limit 1
   for update;

  if not found then
    raise exception 'NO_ACTIVE_SESSION';
  end if;

  if s.status = 'running' and not s.allow_late_join then
    raise exception 'SESSION_LOCKED';
  end if;

  if s.join_pin is not null and coalesce(p_pin, '') <> s.join_pin then
    raise exception 'INVALID_PIN';
  end if;

  select count(*)
    into v_player_count
    from public.players
   where public.players.session_id = s.id;

  if v_player_count >= 150 then
    raise exception 'SESSION_FULL';
  end if;

  insert into public.players (session_id, name, token_hash)
  values (s.id, v_clean_name, p_token_hash)
  returning id into v_player_id;

  return query
  select v_player_id, v_clean_name, s.id, s.status, s.state_version;
exception
  when unique_violation then
    raise exception 'NAME_TAKEN';
end;
$$;

-- 3. advance_session
create or replace function public.advance_session(
  p_session_id uuid,
  p_expected_version int,
  p_action text,
  p_lead_in_ms int default 3000
)
returns public.game_sessions
language plpgsql
security definer
set search_path = ''
as $$
declare
  s public.game_sessions%rowtype;
  q public.questions%rowtype;
  v_now timestamptz := clock_timestamp();
  v_phase text;
  v_player_count int;
  v_next_index int;
  v_lead_ms int := greatest(0, coalesce(p_lead_in_ms, 3000));
  v_start timestamptz;
  v_end timestamptz;
begin
  select *
    into s
    from public.game_sessions
   where id = p_session_id
   for update;

  if not found then
    raise exception 'NO_ACTIVE_SESSION';
  end if;

  if s.state_version <> p_expected_version then
    raise exception 'CONFLICT';
  end if;

  -- Derive current phase (mirrors src/utils/game-phase.ts)
  if s.status = 'lobby' then
    v_phase := 'lobby';
  elsif s.status = 'finished' then
    v_phase := 'finished';
  elsif s.status = 'cancelled' then
    v_phase := 'cancelled';
  elsif s.question_started_at is not null and v_now < s.question_started_at then
    v_phase := 'countdown';
  elsif s.question_closed_at is not null or (s.question_ends_at is not null and v_now > s.question_ends_at) then
    v_phase := 'reveal';
  else
    v_phase := 'question';
  end if;

  if p_action = 'start' then
    if s.status <> 'lobby' then
      raise exception 'CONFLICT';
    end if;

    select count(*) into v_player_count from public.players where session_id = p_session_id;
    if v_player_count < 1 then
      raise exception 'CONFLICT';
    end if;

    select * into q from public.questions where id = s.question_order[1];
    if not found then
      raise exception 'NO_QUESTIONS';
    end if;

    v_start := v_now + make_interval(secs => v_lead_ms::double precision / 1000.0);
    v_end   := v_start + make_interval(secs => q.time_limit_seconds);

    update public.game_sessions
       set status = 'running',
           current_index = 0,
           started_at = v_now,
           question_started_at = v_start,
           question_ends_at = v_end,
           question_closed_at = null,
           state_version = s.state_version + 1
     where id = p_session_id
     returning * into s;

    return s;

  elsif p_action = 'close_question' then
    if v_phase not in ('countdown', 'question') then
      raise exception 'CONFLICT';
    end if;

    update public.game_sessions
       set question_closed_at = v_now,
           state_version = s.state_version + 1
     where id = p_session_id
     returning * into s;

    return s;

  elsif p_action = 'next' then
    if v_phase <> 'reveal' or s.current_index + 1 >= s.total_questions then
      raise exception 'CONFLICT';
    end if;

    v_next_index := s.current_index + 1;
    select * into q from public.questions where id = s.question_order[v_next_index + 1];
    if not found then
      raise exception 'NO_QUESTIONS';
    end if;

    v_start := v_now + make_interval(secs => v_lead_ms::double precision / 1000.0);
    v_end   := v_start + make_interval(secs => q.time_limit_seconds);

    update public.game_sessions
       set current_index = v_next_index,
           question_started_at = v_start,
           question_ends_at = v_end,
           question_closed_at = null,
           state_version = s.state_version + 1
     where id = p_session_id
     returning * into s;

    return s;

  elsif p_action = 'finish' then
    if v_phase <> 'reveal' or s.current_index <> s.total_questions - 1 then
      raise exception 'CONFLICT';
    end if;

    update public.game_sessions
       set status = 'finished',
           finished_at = v_now,
           state_version = s.state_version + 1
     where id = p_session_id
     returning * into s;

    return s;

  elsif p_action = 'cancel' then
    if s.status not in ('lobby', 'running') then
      raise exception 'CONFLICT';
    end if;

    update public.game_sessions
       set status = 'cancelled',
           finished_at = v_now,
           state_version = s.state_version + 1
     where id = p_session_id
     returning * into s;

    return s;

  else
    raise exception 'INVALID_REQUEST';
  end if;
end;
$$;

-- 4. submit_answer (PRD §10.3 reference specification)
create or replace function public.submit_answer(
  p_session_id uuid,
  p_player_id uuid,
  p_question_index int,
  p_option_id text
)
returns table (
  already_answered boolean,
  answered_count int,
  total_players int,
  closed_early boolean
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  s public.game_sessions%rowtype;
  q public.questions%rowtype;
  v_now timestamptz := clock_timestamp();
  v_ms int;
  v_ok boolean;
  v_pts int;
  v_ins int;
  v_answered int;
  v_total int;
  v_closed boolean := false;
begin
  select * into s from public.game_sessions where id = p_session_id for update;
  if not found or s.status <> 'running' then
    raise exception 'ANSWER_CLOSED';
  end if;

  if not exists (
    select 1 from public.players where id = p_player_id and session_id = p_session_id
  ) then
    raise exception 'NOT_JOINED';
  end if;

  if s.current_index <> p_question_index then
    raise exception 'STALE_QUESTION';
  end if;

  if s.question_closed_at is not null
     or v_now > s.question_ends_at + interval '500 milliseconds' then
    raise exception 'ANSWER_CLOSED';
  end if;

  if v_now < s.question_started_at then
    raise exception 'ANSWER_TOO_EARLY';
  end if;

  select * into q from public.questions where id = s.question_order[s.current_index + 1];
  if not found then
    raise exception 'ANSWER_CLOSED';
  end if;

  if not exists (
    select 1 from jsonb_array_elements(q.options) o where o ->> 'id' = p_option_id
  ) then
    raise exception 'INVALID_OPTION';
  end if;

  v_ms := greatest(
    0,
    least(
      floor(extract(epoch from (v_now - s.question_started_at)) * 1000),
      q.time_limit_seconds * 1000
    )::int
  );
  v_ok := (p_option_id = q.correct_option_id);
  v_pts := case
             when v_ok then
               round(
                 q.base_points * (1 - 0.5 * least(1.0, v_ms::numeric / (q.time_limit_seconds * 1000)))
               )::int
             else 0
           end;

  insert into public.answers (
    session_id,
    player_id,
    question_id,
    question_index,
    selected_option_id,
    is_correct,
    response_ms,
    points
  )
  values (
    p_session_id,
    p_player_id,
    q.id,
    p_question_index,
    p_option_id,
    v_ok,
    v_ms,
    v_pts
  )
  on conflict (session_id, player_id, question_index) do nothing;

  get diagnostics v_ins = row_count;

  if v_ins = 1 then
    update public.players
       set total_score = total_score + v_pts,
           correct_count = correct_count + (v_ok)::int,
           total_correct_ms = total_correct_ms + case when v_ok then v_ms else 0 end
     where id = p_player_id;
  end if;

  select count(*)
    into v_answered
    from public.answers
   where session_id = p_session_id
     and question_index = p_question_index;

  select count(*)
    into v_total
    from public.players
   where session_id = p_session_id;

  if v_total > 0 and v_answered >= v_total then
    update public.game_sessions
       set question_closed_at = v_now,
           state_version = state_version + 1
     where id = p_session_id;
    v_closed := true;
  end if;

  return query select (v_ins = 0), v_answered, v_total, v_closed;
end;
$$;

-- 5. get_leaderboard (PRD §5.3 deterministic ordering)
create or replace function public.get_leaderboard(
  p_session_id uuid,
  p_limit int default null
)
returns table (
  rank int,
  player_id uuid,
  name text,
  total_score int,
  correct_count int,
  total_correct_ms bigint,
  joined_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  with ranked as (
    select
      row_number() over (
        order by p.total_score desc, p.total_correct_ms asc, p.joined_at asc, p.id asc
      )::int as rank,
      p.id as player_id,
      p.name,
      p.total_score,
      p.correct_count,
      p.total_correct_ms,
      p.joined_at
    from public.players p
    where p.session_id = p_session_id
  )
  select r.rank, r.player_id, r.name, r.total_score, r.correct_count, r.total_correct_ms, r.joined_at
  from ranked r
  where p_limit is null or r.rank <= p_limit
  order by r.rank asc;
$$;

-- 6. kick_player (P1)
create or replace function public.kick_player(
  p_session_id uuid,
  p_player_id uuid
)
returns table (
  deleted boolean,
  state_version int,
  closed_early boolean
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  s public.game_sessions%rowtype;
  v_now timestamptz := clock_timestamp();
  v_del int;
  v_answered int;
  v_total int;
  v_closed boolean := false;
begin
  select *
    into s
    from public.game_sessions
   where id = p_session_id
   for update;

  if not found then
    raise exception 'NO_ACTIVE_SESSION';
  end if;

  delete from public.players
   where id = p_player_id
     and session_id = p_session_id;

  get diagnostics v_del = row_count;

  if v_del = 0 then
    return query select false, s.state_version, false;
    return;
  end if;

  -- If running and currently in active question phase, check if all remaining players have answered
  if s.status = 'running'
     and s.question_closed_at is null
     and s.question_started_at is not null
     and v_now >= s.question_started_at
     and v_now <= s.question_ends_at then
    select count(*) into v_answered
      from public.answers
     where session_id = p_session_id
       and question_index = s.current_index;
    select count(*) into v_total
      from public.players
     where session_id = p_session_id;

    if v_total > 0 and v_answered >= v_total then
      update public.game_sessions
         set question_closed_at = v_now,
             state_version = s.state_version + 1
       where id = p_session_id
       returning * into s;
      v_closed := true;
    else
      update public.game_sessions
         set state_version = s.state_version + 1
       where id = p_session_id
       returning * into s;
    end if;
  else
    update public.game_sessions
       set state_version = s.state_version + 1
     where id = p_session_id
     returning * into s;
  end if;

  return query select true, s.state_version, v_closed;
end;
$$;

-- 7. get_db_now (PRD §5.4 single source of truth clock)
create or replace function public.get_db_now()
returns timestamptz
language sql
volatile
security definer
set search_path = ''
as $$
  select clock_timestamp();
$$;

-- Restrict EXECUTE permissions strictly to service_role (ADR-2)
revoke all on function public.create_session(uuid, boolean, text) from public, anon, authenticated;
revoke all on function public.join_session(text, text, text) from public, anon, authenticated;
revoke all on function public.advance_session(uuid, int, text, int) from public, anon, authenticated;
revoke all on function public.submit_answer(uuid, uuid, int, text) from public, anon, authenticated;
revoke all on function public.get_leaderboard(uuid, int) from public, anon, authenticated;
revoke all on function public.kick_player(uuid, uuid) from public, anon, authenticated;
revoke all on function public.get_db_now() from public, anon, authenticated;

grant execute on function public.create_session(uuid, boolean, text) to service_role;
grant execute on function public.join_session(text, text, text) to service_role;
grant execute on function public.advance_session(uuid, int, text, int) to service_role;
grant execute on function public.submit_answer(uuid, uuid, int, text) to service_role;
grant execute on function public.get_leaderboard(uuid, int) to service_role;
grant execute on function public.kick_player(uuid, uuid) to service_role;
grant execute on function public.get_db_now() to service_role;
