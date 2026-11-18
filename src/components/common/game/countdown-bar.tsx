import { Timer } from 'lucide-react';
import { ProgressBar } from '@/components/ui/progress-bar';
import { cn } from '@/utils';

interface CountdownBarProps {
  remainingMs: number;
  totalSeconds: number;
  remainingSeconds: number;
  label?: string;
  className?: string;
}

export function CountdownBar({
  remainingMs,
  totalSeconds,
  remainingSeconds,
  label = 'Sisa waktu soal',
  className,
}: CountdownBarProps) {
  const urgent = remainingSeconds > 0 && remainingSeconds <= 5;
  const totalMs = Math.max(1000, totalSeconds * 1000);

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="quiz-kicker quiz-kicker--blue">{label}</span>
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-base font-bold tabular-nums',
            urgent
              ? 'bg-[var(--color-coral-tint)] text-[var(--color-coral-ink)]'
              : 'bg-[var(--color-blue-tint)] text-[var(--color-blue)]',
          )}
        >
          <Timer size={18} aria-hidden="true" />
          <span>{remainingSeconds} dtk</span>
        </span>
      </div>
      <ProgressBar
        value={remainingMs}
        max={totalMs}
        urgent={urgent}
        label={label}
      />
    </div>
  );
}
