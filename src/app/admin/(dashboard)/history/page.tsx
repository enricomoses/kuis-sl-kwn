import type { Metadata } from 'next';
import { connection } from 'next/server';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ROUTES } from '@/constants/routes.constant';
import { requireAdminSession } from '@/features/auth/admin-guard.server';
import { listGameSessionHistory } from '@/features/game/service.server';
import { AdminHistoryView } from './_components/admin-history-view';

export const metadata: Metadata = {
  title: 'Riwayat Sesi Admin',
};

function HistorySkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-12 w-64" />
      <Skeleton className="h-28 w-full" />
      <Skeleton className="h-28 w-full" />
    </div>
  );
}

async function AdminHistoryContent() {
  await connection();
  const profile = await requireAdminSession(ROUTES.ADMIN_HISTORY);
  const initialData = await listGameSessionHistory().catch(() => undefined);
  return <AdminHistoryView profile={profile} initialData={initialData} />;
}

export default function AdminHistoryPage() {
  return (
    <Suspense fallback={<HistorySkeleton />}>
      <AdminHistoryContent />
    </Suspense>
  );
}
