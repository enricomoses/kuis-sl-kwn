import { APP_INFO } from '@/constants/app.constant';
import { cn } from '@/utils';

interface AppBrandHeaderProps {
  compact?: boolean;
  className?: string;
}

export function AppBrandHeader({
  compact = false,
  className,
}: AppBrandHeaderProps) {
  if (compact) {
    return (
      <div className={cn('flex flex-col gap-0.5', className)}>
        <p className="m-0 text-base font-bold text-[var(--color-navy)]">
          {APP_INFO.TITLE}
        </p>
        <p className="m-0 text-xs font-medium text-[var(--color-navy-muted)]">
          {APP_INFO.SUBTITLE_1} · {APP_INFO.SUBTITLE_2}
        </p>
      </div>
    );
  }

  return (
    <header className={cn('flex flex-col gap-2', className)}>
      <h1 className="quiz-page-title">{APP_INFO.TITLE}</h1>
      <div className="flex flex-col gap-0.5">
        <p className="quiz-page-subtitle">{APP_INFO.SUBTITLE_1}</p>
        <p className="quiz-page-subtitle">{APP_INFO.SUBTITLE_2}</p>
      </div>
    </header>
  );
}
