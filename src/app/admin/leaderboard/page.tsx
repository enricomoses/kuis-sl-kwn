import type { Metadata } from 'next';
import { connection } from 'next/server';
import { Suspense } from 'react';
import { AdminLeaderboardSkeleton } from '@/components/common/feedback/page-skeletons';
import { ROUTES } from '@/constants/routes.constant';
import { requireAdminSession } from '@/features/auth/admin-guard.server';
import { getAdminLiveLeaderboard } from '@/features/game/service.server';
import { AdminLeaderboardView } from './_components/admin-leaderboard-view';

export const metadata: Metadata = {
  title: 'Leaderboard Live',
};

async function AdminLeaderboardContent() {
  await connection();
  const profile = await requireAdminSession(ROUTES.ADMIN_LEADERBOARD);
  const initialState = await getAdminLiveLeaderboard().catch(() => null);

  return <AdminLeaderboardView profile={profile} initialState={initialState} />;
}

export default function AdminLeaderboardPage() {
  return (
    <Suspense fallback={<AdminLeaderboardSkeleton />}>
      <AdminLeaderboardContent />
    </Suspense>
  );
}
