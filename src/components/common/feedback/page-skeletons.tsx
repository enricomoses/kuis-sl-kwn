import { Skeleton } from '@/components/ui/skeleton';

/** Exact-layout skeleton for the player join page (`/`). */
export function JoinPageSkeleton() {
  return (
    <main
      className="site-container"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Memuat halaman gabung kuis…</span>

      <div className="flex items-center justify-center gap-4 py-1.5">
        <Skeleton className="h-10 w-10 rounded-full sm:h-11 sm:w-11" />
        <span
          aria-hidden="true"
          className="h-7 w-px bg-[var(--color-navy-faint)]"
        />
        <Skeleton className="h-10 w-24 sm:h-11 sm:w-28" />
      </div>

      <div className="auth-card">
        <div className="flex flex-col gap-6 px-6 py-7 sm:px-8 sm:py-8">
          <div className="flex flex-col items-center gap-2">
            <Skeleton className="h-7 w-3/4" />
            <Skeleton className="h-7 w-1/2" />
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-12 w-full rounded-[0.625rem]" />
            </div>
            <Skeleton className="h-12 w-full rounded-[0.625rem]" />
          </div>
        </div>

        <div className="auth-card-footer flex flex-col gap-1.5 px-6 py-4 sm:px-8">
          <Skeleton className="h-4 w-44" />
          <Skeleton className="h-3.5 w-full max-w-[320px]" />
        </div>
      </div>
    </main>
  );
}

/** Exact-layout skeleton for the active player card inside `/play`. */
export function PlayPanelSkeleton() {
  return (
    <div
      className="ui-card flex flex-col gap-5 border border-[rgba(23,35,59,0.09)]"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Memuat sesi kuis…</span>

      <div className="flex items-center justify-between gap-2">
        <Skeleton className="h-6 w-28 rounded-full" />
        <Skeleton className="h-5 w-16" />
      </div>

      <Skeleton className="h-3 w-full rounded-full" />

      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-11/12" />
        <Skeleton className="h-7 w-2/3" />
      </div>

      <div className="flex flex-col gap-3">
        <Skeleton className="h-[60px] w-full rounded-2xl" />
        <Skeleton className="h-[60px] w-full rounded-2xl" />
        <Skeleton className="h-[60px] w-full rounded-2xl" />
        <Skeleton className="h-[60px] w-full rounded-2xl" />
      </div>
    </div>
  );
}

/** Exact-layout skeleton for the full player quiz page (`/play`). */
export function PlayPageSkeleton() {
  return (
    <main className="play-container">
      <div className="play-topbar">
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-5 w-56" />
          <Skeleton className="h-3.5 w-48" />
        </div>
        <Skeleton className="h-7 w-24 rounded-full" />
      </div>
      <PlayPanelSkeleton />
    </main>
  );
}

/** Exact-layout skeleton for the admin login page (`/admin/login`). */
export function AdminLoginSkeleton() {
  return (
    <main
      className="mx-auto flex min-h-dvh w-full max-w-[448px] flex-col items-center justify-center gap-6 px-4 py-10"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Memuat halaman login admin…</span>

      <div className="flex items-center justify-center gap-2.5 py-1">
        <Skeleton className="h-9 w-9 rounded-full" />
        <span
          aria-hidden="true"
          className="h-6 w-px bg-[var(--color-navy-faint)]"
        />
        <Skeleton className="h-9 w-24" />
      </div>

      <div className="auth-card">
        <div className="flex flex-col gap-6 px-6 py-7 sm:px-8 sm:py-8">
          <div className="flex flex-col items-center gap-2">
            <Skeleton className="h-3.5 w-48" />
            <Skeleton className="h-7 w-52" />
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-12 w-full rounded-[0.625rem]" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-12 w-full rounded-[0.625rem]" />
            </div>
            <Skeleton className="mt-1 h-12 w-full rounded-[0.625rem]" />
          </div>
        </div>
      </div>

      <Skeleton className="h-5 w-48" />
    </main>
  );
}

/** Exact-layout skeleton for the admin console page (`/admin`). */
export function AdminConsoleSkeleton() {
  return (
    <div
      className="flex flex-col gap-6"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Memuat ruang kontrol admin…</span>

      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[rgba(23,35,59,0.08)] pb-5">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-44" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
      </div>

      <div className="auth-card mx-auto mt-2 flex w-full max-w-[480px] flex-col gap-6 px-6 py-7 sm:mt-4 sm:px-8 sm:py-8">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-4 w-44" />
            <div className="flex gap-2">
              <Skeleton className="h-12 flex-1 rounded-[0.625rem]" />
              <Skeleton className="h-12 w-24 rounded-[0.625rem]" />
            </div>
            <Skeleton className="h-3.5 w-72 max-w-full" />
          </div>

          <Skeleton className="h-12 w-full rounded-[0.625rem]" />
          <Skeleton className="h-12 w-full rounded-[0.625rem]" />
        </div>
      </div>
    </div>
  );
}

/** Exact-layout skeleton for the admin dashboard shell (`/admin/*` layout). */
export function AdminDashboardLayoutSkeleton() {
  return (
    <div className="admin-shell">
      <div className="admin-header">
        <div className="admin-header-inner">
          <div className="admin-brand">
            <div className="flex shrink-0 items-center gap-2.5">
              <Skeleton className="h-9 w-9 rounded-full" />
              <span
                aria-hidden="true"
                className="h-6 w-px bg-[var(--color-navy-faint)]"
              />
              <Skeleton className="h-9 w-24" />
            </div>
            <span
              aria-hidden="true"
              className="admin-brand-divider hidden xl:block"
            />
            <Skeleton className="hidden h-5 w-52 xl:block" />
          </div>

          <div className="admin-nav">
            <Skeleton className="h-11 w-11 rounded-[0.625rem] sm:w-32" />
            <Skeleton className="h-11 w-11 rounded-[0.625rem] sm:w-28" />
            <Skeleton className="h-11 w-11 rounded-[0.625rem] sm:w-24" />
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <Skeleton className="hidden h-4 w-36 lg:block" />
            <Skeleton className="h-10 w-10 rounded-[0.625rem] sm:w-24" />
          </div>
        </div>
      </div>

      <main className="admin-main">
        <AdminConsoleSkeleton />
      </main>
    </div>
  );
}

/** Exact-layout skeleton list of question cards inside `/admin/questions`. */
export function AdminQuestionCardsSkeleton() {
  return (
    <div
      className="flex flex-col gap-4"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Memuat daftar soal…</span>

      {[0, 1, 2].map((item) => (
        <div key={item} className="admin-panel flex flex-col gap-4 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Skeleton className="h-6 w-6 rounded-md" />
              <Skeleton className="h-6 w-28 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <div className="flex items-center gap-1.5">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <Skeleton className="h-10 w-10 rounded-xl" />
              <Skeleton className="h-10 w-20 rounded-xl" />
              <Skeleton className="h-10 w-24 rounded-xl" />
            </div>
          </div>

          <Skeleton className="h-6 w-3/4" />

          <div className="grid gap-2 sm:grid-cols-2">
            <Skeleton className="h-11 w-full rounded-[0.625rem]" />
            <Skeleton className="h-11 w-full rounded-[0.625rem]" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Exact-layout skeleton for the full Bank Soal page (`/admin/questions`). */
export function AdminQuestionsSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[rgba(23,35,59,0.08)] pb-5">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
        <Skeleton className="h-12 w-36 rounded-xl" />
      </div>

      <AdminQuestionCardsSkeleton />
    </div>
  );
}

/** Exact-layout skeleton list of session history rows inside `/admin/history`. */
export function AdminHistoryListSkeleton() {
  return (
    <div
      className="flex flex-col gap-3"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Memuat riwayat sesi…</span>

      {[0, 1, 2].map((item) => (
        <div
          key={item}
          className="admin-panel flex flex-wrap items-center justify-between gap-4 p-6"
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-4 w-36" />
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-36" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-28 rounded-xl" />
            <Skeleton className="h-10 w-20 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Exact-layout skeleton for the full Riwayat Sesi page (`/admin/history`). */
export function AdminHistorySkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[rgba(23,35,59,0.08)] pb-5">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-44" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
      </div>

      <AdminHistoryListSkeleton />
    </div>
  );
}

/** Exact-layout skeleton for the projection-safe live leaderboard (`/admin/leaderboard`). */
export function AdminLeaderboardSkeleton() {
  return (
    <main
      className="mx-auto flex min-h-dvh w-full max-w-[820px] flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Memuat leaderboard live…</span>

      <header className="flex flex-col items-center gap-4 text-center">
        <div className="flex items-center justify-center gap-2.5 py-1">
          <Skeleton className="h-9 w-9 rounded-full" />
          <span
            aria-hidden="true"
            className="h-6 w-px bg-[var(--color-navy-faint)]"
          />
          <Skeleton className="h-9 w-24" />
        </div>

        <div className="flex flex-col items-center gap-2">
          <Skeleton className="h-3.5 w-48" />
          <Skeleton className="h-8 w-44" />
          <Skeleton className="h-4 w-36" />
        </div>
      </header>

      <div className="podium-grid">
        <Skeleton className="min-h-[132px] w-full rounded-2xl" />
        <Skeleton className="min-h-[168px] w-full rounded-2xl" />
        <Skeleton className="min-h-[116px] w-full rounded-2xl" />
      </div>

      <section className="admin-panel flex flex-col gap-4 p-5 sm:p-6">
        <div className="flex items-center justify-between gap-2 border-b border-[rgba(23,35,59,0.08)] pb-3">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <div className="flex flex-col gap-2">
          {[0, 1, 2, 3, 4].map((item) => (
            <Skeleton key={item} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      </section>
    </main>
  );
}

/** Exact-layout skeleton for the session results modal in `/admin/history`. */
export function AdminHistoryDetailSkeleton() {
  return (
    <div
      className="flex flex-col gap-5"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Memuat detail hasil sesi…</span>

      <div className="flex justify-end">
        <Skeleton className="h-10 w-28 rounded-xl" />
      </div>

      <div className="flex flex-col gap-2">
        <Skeleton className="h-3.5 w-36" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>

      <div className="flex flex-col gap-2">
        <Skeleton className="h-3.5 w-32" />
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-16 w-full rounded-xl" />
      </div>
    </div>
  );
}
