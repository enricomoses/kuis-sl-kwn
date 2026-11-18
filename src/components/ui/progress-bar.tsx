import { cn } from '@/utils';

interface ProgressBarProps {
  value: number;
  max: number;
  urgent?: boolean;
  label: string;
  className?: string;
}

export function ProgressBar({
  value,
  max,
  urgent = false,
  label,
  className,
}: ProgressBarProps) {
  const safeMax = max > 0 ? max : 1;
  const percent = Math.max(0, Math.min(100, (value / safeMax) * 100));

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={safeMax}
      aria-valuenow={Math.max(0, Math.min(safeMax, Math.round(value)))}
      className={cn('ui-progress', className)}
    >
      <div
        className={cn('ui-progress-fill', urgent && 'ui-progress-fill--urgent')}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
