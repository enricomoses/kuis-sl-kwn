import { Skeleton } from '@/components/ui/skeleton';

export default function PlayLoading() {
  return (
    <main className="play-container">
      <div className="play-topbar">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-8 w-28" />
      </div>
      <Skeleton className="h-72 w-full" />
    </main>
  );
}
