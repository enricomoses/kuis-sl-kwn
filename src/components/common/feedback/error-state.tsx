import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { UI_COPY } from '@/constants/ui.constant';
import { cn } from '@/utils';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = 'Terjadi Kendala',
  message,
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <Card
      tone="coral"
      role="alert"
      className={cn(
        'flex flex-col items-start gap-3 text-[var(--color-coral-ink)]',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <AlertCircle size={20} aria-hidden="true" />
        <h2 className="m-0 text-base font-bold">{title}</h2>
      </div>
      <p className="m-0 text-sm font-medium">{message}</p>
      {onRetry ? (
        <Button variant="danger" size="sm" onClick={onRetry}>
          {UI_COPY.RETRY}
        </Button>
      ) : null}
    </Card>
  );
}
