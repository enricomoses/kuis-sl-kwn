import { APP_INFO } from '@/constants/app.constant';
import { cn } from '@/utils';

interface AppBrandHeaderProps {
  compact?: boolean;
  centered?: boolean;
  className?: string;
}

export function AppBrandHeader({
  compact = false,
  centered = false,
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

  if (centered) {
    return (
      <header className={cn('text-center', className)}>
        <h1 className="m-0 text-[1.5rem] leading-[1.2] font-bold tracking-[-0.025em] text-balance text-[var(--color-navy)] sm:text-[1.625rem]">
          {APP_INFO.TITLE}
        </h1>
      </header>
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
