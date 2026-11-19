import { connection } from 'next/server';
import type { ReactNode } from 'react';
import { Suspense } from 'react';
import { AdminDashboardLayoutSkeleton } from '@/components/common/feedback/page-skeletons';
import { ROUTES } from '@/constants/routes.constant';
import { requireAdminSession } from '@/features/auth/admin-guard.server';
import '@/styles/features/admin.css';
import '@/styles/features/play.css';
import { AdminShell } from './_components/admin-shell';

interface AdminDashboardLayoutProps {
  children: ReactNode;
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
    <Suspense fallback={<AdminDashboardLayoutSkeleton />}>
      <AuthenticatedAdminShell>{children}</AuthenticatedAdminShell>
    </Suspense>
  );
}
