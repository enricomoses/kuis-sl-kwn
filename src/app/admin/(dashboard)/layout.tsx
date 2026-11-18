import { connection } from 'next/server';
import type { ReactNode } from 'react';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ROUTES } from '@/constants/routes.constant';
import { requireAdminSession } from '@/features/auth/admin-guard.server';
import '@/styles/features/admin.css';
import '@/styles/features/play.css';
import { AdminShell } from './_components/admin-shell';

interface AdminDashboardLayoutProps {
  children: ReactNode;
}

function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <Skeleton className="h-14 w-full" />
      <Skeleton className="h-80 w-full" />
    </div>
  );
}

async function AuthenticatedAdminShell({
  children,
}: AdminDashboardLayoutProps) {
  await connection();
  const profile = await requireAdminSession(ROUTES.ADMIN_CONSOLE);
  return <AdminShell profile={profile}>{children}</AdminShell>;
}

export default function AdminDashboardLayout({
  children,
}: AdminDashboardLayoutProps) {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <AuthenticatedAdminShell>{children}</AuthenticatedAdminShell>
    </Suspense>
  );
}
