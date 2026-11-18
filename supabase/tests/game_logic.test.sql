-- pgTAP tests for Kuis Keberagaman & Antiintoleransi (PRD §19)
begin;
select plan(19);

delete from public.answers;
delete from public.players;
delete from public.game_sessions;

do $$
declare
  v_session public.game_sessions%rowtype;
  v_p1 uuid;
  v_p2 uuid;
  v_p3 uuid;
  v_p4 uuid;
  v_p5 uuid;
  v_q1 uuid;
begin
  if (select count(*) from public.questions where archived_at is null) < 2 then
    insert into public.questions (type, prompt, options, correct_option_id, time_limit_seconds, base_points, position)
    values
      ('true_false', 'Soal uji pgTAP nomor 1 tentang keberagaman.', '[{"id":"true","text":"Benar"},{"id":"false","text":"Salah"}]'::jsonb, 'false', 20, 1000, 1),
      ('true_false', 'Soal uji pgTAP nomor 2 tentang toleransi.', '[{"id":"true","text":"Benar"},{"id":"false","text":"Salah"}]'::jsonb, 'true', 20, 1000, 2);
  end if;

  select * into v_session from public.create_session(null, false, null);
  perform set_config('app.test_session_id', v_session.id::text, true);

  select player_id into v_p1 from public.join_session('Budi', 'hash1', null);
  select player_id into v_p2 from public.join_session('Sinta', 'hash2', null);
  select player_id into v_p3 from public.join_session('Raka', 'hash3', null);
  select player_id into v_p4 from public.join_session('Dina', 'hash4', null);
  select player_id into v_p5 from public.join_session('Tono', 'hash5', null);

  perform set_config('app.test_p1', v_p1::text, true);
  perform set_config('app.test_p2', v_p2::text, true);
  perform set_config('app.test_p3', v_p3::text, true);
  perform set_config('app.test_p4', v_p4::text, true);
  perform set_config('app.test_p5', v_p5::text, true);

  select * into v_session from public.advance_session(v_session.id, 0, 'start', 3000);
  v_q1 := v_session.question_order[1];
  update public.questions
     set time_limit_seconds = 20,
         base_points = 1000,
         correct_option_id = 'false'
   where id = v_q1;
end $$;

-- 1. One active session constraint
select throws_ok(
  $$ select * from public.create_session(null, false, null) $$,
  'ACTIVE_SESSION_EXISTS',
  'Cannot create second active session while one is running'
);

-- 2. Unique player name case-insensitive
select throws_ok(
  $$
    update public.game_sessions set allow_late_join = true where id = current_setting('app.test_session_id')::uuid;
    select * from public.join_session('  budi  ', 'hash_dup', null);
  $$,
  'NAME_TAKEN',
  'Duplicate player name (case-insensitive) is rejected'
);

-- 3. ANSWER_TOO_EARLY during countdown
select throws_ok(
  $$ select * from public.submit_answer(current_setting('app.test_session_id')::uuid, current_setting('app.test_p1')::uuid, 0, 'false') $$,
  'ANSWER_TOO_EARLY',
  'Submitting answer before question_started_at raises ANSWER_TOO_EARLY'
);

-- 4. STALE_QUESTION on wrong question_index
select throws_ok(
  $$ select * from public.submit_answer(current_setting('app.test_session_id')::uuid, current_setting('app.test_p1')::uuid, 1, 'false') $$,
  'STALE_QUESTION',
  'Submitting answer for wrong question index raises STALE_QUESTION'
);

-- 5 & 6. Scoring at 0% elapsed (~1000 pts)
select lives_ok(
  $$
    update public.game_sessions
       set question_started_at = clock_timestamp(),
           question_ends_at = clock_timestamp() + interval '20 seconds'
     where id = current_setting('app.test_session_id')::uuid;
    perform * from public.submit_answer(current_setting('app.test_session_id')::uuid, current_setting('app.test_p1')::uuid, 0, 'false');
  $$,
  'Player 1 answers immediately (0%)'
);

select ok(
  (select points between 990 and 1000 from public.answers where player_id = current_setting('app.test_p1')::uuid and question_index = 0),
  'Immediate correct answer awards ~1000 points'
);

-- 7. Idempotent duplicate answer does not double-score
select is(
  (select already_answered from public.submit_answer(current_setting('app.test_session_id')::uuid, current_setting('app.test_p1')::uuid, 0, 'true')),
  true,
  'Second submission returns already_answered = true'
);

-- 8 & 9. Scoring at 15% elapsed (3s / 20s => ~925 pts)
select lives_ok(
  $$
    update public.game_sessions
       set question_started_at = clock_timestamp() - interval '3 seconds',
           question_ends_at = clock_timestamp() + interval '17 seconds'
     where id = current_setting('app.test_session_id')::uuid;
    perform * from public.submit_answer(current_setting('app.test_session_id')::uuid, current_setting('app.test_p2')::uuid, 0, 'false');
  $$,
  'Player 2 answers at 3s (15%)'
);

select ok(
  (select points between 920 and 930 from public.answers where player_id = current_setting('app.test_p2')::uuid and question_index = 0),
  'Correct answer at 3s/20s awards ~925 points'
);

-- 10 & 11. Scoring at 50% elapsed (10s / 20s => ~750 pts)
select lives_ok(
  $$
    update public.game_sessions
       set question_started_at = clock_timestamp() - interval '10 seconds',
           question_ends_at = clock_timestamp() + interval '10 seconds'
     where id = current_setting('app.test_session_id')::uuid;
    perform * from public.submit_answer(current_setting('app.test_session_id')::uuid, current_setting('app.test_p3')::uuid, 0, 'false');
  $$,
  'Player 3 answers at 10s (50%)'
);

select ok(
  (select points between 745 and 755 from public.answers where player_id = current_setting('app.test_p3')::uuid and question_index = 0),
  'Correct answer at 10s/20s awards ~750 points'
);

-- 12. Wrong answer awards 0 points
select lives_ok(
  $$
    perform * from public.submit_answer(current_setting('app.test_session_id')::uuid, current_setting('app.test_p4')::uuid, 0, 'true');
  $$,
  'Player 4 submits wrong answer'
);

select is(
  (select points from public.answers where player_id = current_setting('app.test_p4')::uuid and question_index = 0),
  0,
  'Wrong answer awards 0 points'
);

-- 14. ANSWER_CLOSED past 500ms grace period
select throws_ok(
  $$
    update public.game_sessions
       set question_started_at = clock_timestamp() - interval '21 seconds',
           question_ends_at = clock_timestamp() - interval '1 second'
     where id = current_setting('app.test_session_id')::uuid;
    select * from public.submit_answer(current_setting('app.test_session_id')::uuid, current_setting('app.test_p5')::uuid, 0, 'false');
  $$,
  'ANSWER_CLOSED',
  'Submitting answer past 500ms grace period raises ANSWER_CLOSED'
);

-- 15 & 16. Scoring at 100% within 500ms grace => 500 pts & auto-close when last player answers
update public.game_sessions
   set question_started_at = clock_timestamp() - interval '20 seconds' - interval '200 milliseconds',
       question_ends_at = clock_timestamp() - interval '200 milliseconds'
 where id = current_setting('app.test_session_id')::uuid;

select is(
  (
    select closed_early
    from public.submit_answer(
      current_setting('app.test_session_id')::uuid,
      current_setting('app.test_p5')::uuid,
      0,
      'false'
    )
  ),
  true,
  'Last player answering auto-closes the question'
);

select is(
  (select points from public.answers where player_id = current_setting('app.test_p5')::uuid and question_index = 0),
  500,
  'Correct answer at 100% elapsed (within grace) awards exactly 500 points'
);

-- 17. Optimistic concurrency CONFLICT on stale version
select throws_ok(
  $$ select * from public.advance_session(current_setting('app.test_session_id')::uuid, 0, 'next', 3000) $$,
  'CONFLICT',
  'advance_session with stale expected_version raises CONFLICT'
);

-- 18. RLS blocks anon from reading questions
set local role anon;
select throws_ok(
  $$ select count(*) from public.questions $$,
  '42501',
  'Role anon cannot SELECT from questions'
);
reset role;

-- 19. RLS blocks non-admin authenticated user from inserting into questions
set local role authenticated;
select set_config('request.jwt.claim.sub', '99999999-9999-4999-8999-999999999999', true);
select throws_ok(
  $$
    insert into public.questions (type, prompt, options, correct_option_id, time_limit_seconds, base_points, position)
    values ('true_false', 'Unauthorized insert test.', '[{"id":"true","text":"Benar"},{"id":"false","text":"Salah"}]'::jsonb, 'true', 20, 1000, 99)
  $$,
  '42501',
  'Non-admin authenticated user cannot INSERT into questions'
);
reset role;

select * from finish();
rollback;
