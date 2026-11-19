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
        'flex flex-wrap items-center justify-between gap-4 border-b border-[rgba(23,35,59,0.08)] pb-5',
        className,
      )}
    >
      <div className="flex flex-col gap-1">
        {kicker ? (
          <span className="quiz-kicker quiz-kicker--blue">{kicker}</span>
        ) : null}
        <h1 className="m-0 text-[1.5rem] leading-[1.2] font-bold tracking-[-0.025em] text-[var(--color-navy)] sm:text-[1.75rem]">
          {title}
        </h1>
        {subtitle ? (
          <p className="m-0 text-sm font-medium text-[var(--color-navy-muted)]">
            {subtitle}
          </p>
        ) : null}
      </div>
      {aside ? <div className="flex items-center gap-2">{aside}</div> : null}
    </div>
  );
}
