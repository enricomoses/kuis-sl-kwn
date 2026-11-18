import type { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/utils';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <Card
      tone="cream"
      className={cn(
        'flex flex-col items-center justify-center gap-3 py-10 text-center',
        className,
      )}
    >
      <h2 className="m-0 text-lg font-bold text-[var(--color-navy)]">
        {title}
      </h2>
      {description ? (
        <p className="m-0 max-w-md text-sm text-[var(--color-navy-muted)]">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-1">{action}</div> : null}
    </Card>
  );
}
