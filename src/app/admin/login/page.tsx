import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { connection } from 'next/server';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { getAdminSessionProfile } from '@/features/auth/admin-guard.server';
import { sanitizeAdminNextPath } from '@/features/auth/service.server';
import { AdminLoginView } from './_components/admin-login-view';

export const metadata: Metadata = {
  title: 'Login Admin',
};

interface AdminLoginPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function LoginSkeleton() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md items-center justify-center p-6">
      <Skeleton className="h-96 w-full" />
    </main>
  );
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
    <Suspense fallback={<LoginSkeleton />}>
      <AdminLoginContent searchParams={searchParams} />
    </Suspense>
  );
}
