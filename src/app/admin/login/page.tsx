import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { connection } from 'next/server';
import { Suspense } from 'react';
import { AdminLoginSkeleton } from '@/components/common/feedback/page-skeletons';
import { getAdminSessionProfile } from '@/features/auth/admin-guard.server';
import { sanitizeAdminNextPath } from '@/features/auth/service.server';
import { AdminLoginView } from './_components/admin-login-view';

export const metadata: Metadata = {
  title: 'Login Admin',
};

interface AdminLoginPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

async function AdminLoginContent({ searchParams }: AdminLoginPageProps) {
  await connection();
  const params = await searchParams;
  const rawNext = Array.isArray(params.next) ? params.next[0] : params.next;
  const nextPath = sanitizeAdminNextPath(rawNext);

  const profile = await getAdminSessionProfile();
  if (profile) {
    redirect(nextPath);
  }

  return <AdminLoginView nextPath={nextPath} />;
}

export default function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  return (
    <Suspense fallback={<AdminLoginSkeleton />}>
      <AdminLoginContent searchParams={searchParams} />
    </Suspense>
  );
}
