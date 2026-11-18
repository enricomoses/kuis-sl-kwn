import { redirect } from 'next/navigation';
import { connection } from 'next/server';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ROUTES } from '@/constants/routes.constant';
import { getPlayMe } from '@/features/play/service.server';
import { JoinView } from './_components/join-view';

function JoinSkeleton() {
  return (
    <main className="site-container">
      <Skeleton className="h-14 w-3/4" />
      <Skeleton className="h-6 w-1/2" />
      <Skeleton className="h-44 w-full" />
    </main>
  );
}

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
    <Suspense fallback={<JoinSkeleton />}>
      <JoinContent />
    </Suspense>
  );
}
