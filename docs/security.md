# Dokumentasi Keamanan — Kuis Keberagaman & Antiintoleransi

## Model Akses & RLS

- Seluruh tabel (`admin_users`, `questions`, `game_sessions`, `players`, `answers`) mengaktifkan **Row Level Security (RLS)**.
- Role `anon` dan `authenticated` non-admin tidak memiliki izin baca maupun tulis ke tabel mana pun.
- Admin (`public.is_admin()`) melakukan CRUD soal langsung melalui `createServerAuthClient(carrier)` + RLS.
- Penulisan oleh pemain anonim dan transisi state sesi dilakukan hanya lewat BFF menggunakan `createServiceRoleClient()` (ADR-2) ke RPC `SECURITY DEFINER` yang di-`GRANT EXECUTE` khusus untuk `service_role`.

## Identitas Pemain (Cookie HMAC)

- Saat join, server membuat 32-byte token acak (`crypto.randomBytes(32)`) dan menyimpan `HMAC-SHA256(token, PLAYER_TOKEN_PEPPER)` di `players.token_hash`.
- Cookie `kuis_player=<playerId>.<token>` diset `HttpOnly`, `SameSite=Lax`, `Path=/`, `Max-Age=43200`, serta `Secure` di production.
- Verifikasi token selalu menggunakan `crypto.timingSafeEqual`.

## Pencegahan Kebocoran Kunci Jawaban

- `buildPlayerState` di `src/features/game/service.server.ts` memvalidasi payload keluar dengan `playerStateSchema` (`z.strictObject` per fase).
- Field `correctOptionId` hanya ada pada varian fase `reveal`.
- Kanal Realtime Broadcast hanya membawa sinyal tipis `{ kind, version }` tanpa data soal/jawaban.

## Kontrol Lain

- **CSRF:** `assertSameOriginRequest` pada seluruh route mutasi (`POST`, `PATCH`, `DELETE`) untuk admin maupun pemain.
- **Bounded JSON Body:** `readBoundedJsonBody` membatasi ukuran payload (maks 1 KB untuk endpoint pemain).
- **Boundary Otomatis:** `tooling/eslint/architecture.mjs`, `scripts/test-eslint-boundaries.mjs`, dan `scripts/test-server-boundary.mjs`.
