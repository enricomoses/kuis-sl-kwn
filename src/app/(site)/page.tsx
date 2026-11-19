import { redirect } from 'next/navigation';
import { connection } from 'next/server';
import { Suspense } from 'react';
import { JoinPageSkeleton } from '@/components/common/feedback/page-skeletons';
import { ROUTES } from '@/constants/routes.constant';
import { getPlayMe } from '@/features/play/service.server';
import { JoinView } from './_components/join-view';

async function JoinContent() {
  await connection();
  const initialMe = await getPlayMe().catch(() => undefined);

  if (initialMe?.player && initialMe.session) {
    redirect(ROUTES.PLAY);
  }

  return <JoinView initialMe={initialMe} />;
}

export default function HomePage() {
  return (
    <Suspense fallback={<JoinPageSkeleton />}>
      <JoinContent />
    </Suspense>
  );
}
