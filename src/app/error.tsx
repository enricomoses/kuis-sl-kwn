'use client';

import { ErrorState } from '@/components/common/feedback/error-state';

interface GlobalErrorProps {
  reset: () => void;
}

export default function GlobalError({ reset }: GlobalErrorProps) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-lg items-center justify-center p-6">
      <ErrorState
        title="Terjadi Kesalahan"
        message="Halaman mengalami kendala tak terduga. Silakan muat ulang untuk melanjutkan."
        onRetry={reset}
        className="w-full"
      />
    </main>
  );
}
