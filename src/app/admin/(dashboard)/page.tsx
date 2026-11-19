import type { Metadata } from 'next';
import { connection } from 'next/server';
import { Suspense } from 'react';
import { AdminConsoleSkeleton } from '@/components/common/feedback/page-skeletons';
import { ROUTES } from '@/constants/routes.constant';
import { requireAdminSession } from '@/features/auth/admin-guard.server';
import { getAdminActiveGameState } from '@/features/game/service.server';
import { AdminGameView } from './_components/console/admin-game-view';

export const metadata: Metadata = {
  title: 'Ruang Kontrol Admin',
};

async function AdminConsoleContent() {
  await connection();
  const profile = await requireAdminSession(ROUTES.ADMIN_CONSOLE);
  const initialState = await getAdminActiveGameState().catch(() => null);
  return <AdminGameView profile={profile} initialState={initialState} />;
}

export default function AdminConsolePage() {
  return (
    <Suspense fallback={<AdminConsoleSkeleton />}>
      <AdminConsoleContent />
    </Suspense>
  );
}
