# Dokumentasi Database — Kuis Keberagaman & Antiintoleransi

## Migrasi & Seeder

1. Jalankan Supabase lokal atau hubungkan proyek remote:
   ```bash
   supabase start
   supabase db reset
   ```
   Untuk proyek remote:
   ```bash
   supabase db push
   ```
2. Regenerasi tipe TypeScript setelah perubahan skema:
   ```bash
   supabase gen types typescript --local > src/types/database.ts
   ```
3. Jalankan tes pgTAP:
   ```bash
   supabase test db
   ```

## Membuat Admin Pertama

1. Buat akun email + password di **Supabase Dashboard → Authentication → Users** (atau lewat Supabase CLI).
2. Salin `id` (UUID) user tersebut, lalu jalankan di SQL Editor:
   ```sql
   insert into public.admin_users (user_id)
   values ('<UUID-USER-ADMIN>');
   ```

## Daftar RPC (`SECURITY DEFINER`, `service_role` only)

- `public.create_session(p_created_by, p_allow_late_join, p_join_pin)`
- `public.join_session(p_name, p_token_hash, p_pin)`
- `public.advance_session(p_session_id, p_expected_version, p_action, p_lead_in_ms)`
- `public.submit_answer(p_session_id, p_player_id, p_question_index, p_option_id)`
- `public.get_leaderboard(p_session_id, p_limit)`
- `public.kick_player(p_session_id, p_player_id)`
