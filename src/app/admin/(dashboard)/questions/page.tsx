import type { Metadata } from 'next';
import { connection } from 'next/server';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ROUTES } from '@/constants/routes.constant';
import { requireAdminSession } from '@/features/auth/admin-guard.server';
import { listAdminQuestions } from '@/features/question/service.server';
import { AdminQuestionsView } from './_components/admin-questions-view';

export const metadata: Metadata = {
  title: 'Bank Soal Admin',
};

function QuestionsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-12 w-72" />
      <Skeleton className="h-36 w-full" />
      <Skeleton className="h-36 w-full" />
    </div>
  );
}

async function AdminQuestionsContent() {
  await connection();
  const profile = await requireAdminSession(ROUTES.ADMIN_QUESTIONS);
  const initialData = await listAdminQuestions().catch(() => undefined);
  return <AdminQuestionsView profile={profile} initialData={initialData} />;
}

export default function AdminQuestionsPage() {
  return (
    <Suspense fallback={<QuestionsSkeleton />}>
      <AdminQuestionsContent />
    </Suspense>
  );
}
