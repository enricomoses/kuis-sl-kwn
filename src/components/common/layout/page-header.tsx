import type { ReactNode } from 'react';
import { cn } from '@/utils';

interface PageHeaderProps {
  kicker?: string;
  title: string;
  subtitle?: ReactNode;
  aside?: ReactNode;
  className?: string;
}

export function PageHeader({
  kicker,
  title,
  subtitle,
  aside,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-end justify-between gap-4',
        className,
      )}
    >
      <div className="flex flex-col gap-1.5">
        {kicker ? (
          <span className="quiz-kicker quiz-kicker--blue">{kicker}</span>
        ) : null}
        <h1 className="m-0 text-2xl font-bold text-[var(--color-navy)] sm:text-3xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="m-0 text-sm font-medium text-[var(--color-navy-muted)] sm:text-base">
            {subtitle}
          </p>
        ) : null}
      </div>
      {aside ? <div className="flex items-center gap-2">{aside}</div> : null}
    </div>
  );
}
