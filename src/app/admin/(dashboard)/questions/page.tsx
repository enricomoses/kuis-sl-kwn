import type { Metadata } from 'next';
import { connection } from 'next/server';
import { Suspense } from 'react';
import { AdminQuestionsSkeleton } from '@/components/common/feedback/page-skeletons';
import { ROUTES } from '@/constants/routes.constant';
import { requireAdminSession } from '@/features/auth/admin-guard.server';
import { listAdminQuestions } from '@/features/question/service.server';
import { AdminQuestionsView } from './_components/admin-questions-view';

export const metadata: Metadata = {
  title: 'Bank Soal Admin',
};

async function AdminQuestionsContent() {
  await connection();
  const profile = await requireAdminSession(ROUTES.ADMIN_QUESTIONS);
  const initialData = await listAdminQuestions().catch(() => undefined);
  return <AdminQuestionsView profile={profile} initialData={initialData} />;
}

export default function AdminQuestionsPage() {
  return (
    <Suspense fallback={<AdminQuestionsSkeleton />}>
      <AdminQuestionsContent />
    </Suspense>
  );
}
