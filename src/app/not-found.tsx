import Link from 'next/link';
import { buttonStyles } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ROUTES } from '@/constants/routes.constant';

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-lg items-center justify-center p-6">
      <Card tone="blue" className="flex w-full flex-col items-start gap-4">
        <span className="quiz-kicker quiz-kicker--blue">404</span>
        <h1 className="m-0 text-2xl font-bold text-[var(--color-navy)]">
          Halaman Tidak Ditemukan
        </h1>
        <p className="m-0 text-sm font-medium text-[var(--color-navy-muted)]">
          Tautan yang kamu buka tidak tersedia. Kembali ke beranda kuis untuk
          bergabung.
        </p>
        <Link href={ROUTES.HOME} className={buttonStyles('primary', 'md')}>
          Kembali ke Beranda
        </Link>
      </Card>
    </main>
  );
}
