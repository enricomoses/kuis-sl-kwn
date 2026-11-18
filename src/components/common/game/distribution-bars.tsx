import { Check } from 'lucide-react';
import { OPTION_LETTERS } from '@/constants/game.constant';
import type { QuestionOption } from '@/types/question';
import { cn } from '@/utils';

interface DistributionBarsProps {
  options: readonly QuestionOption[];
  distribution: Record<string, number>;
  correctOptionId: string;
  className?: string;
}

export function DistributionBars({
  options,
  distribution,
  correctOptionId,
  className,
}: DistributionBarsProps) {
  const totalVotes = Object.values(distribution).reduce(
    (sum, count) => sum + count,
    0,
  );

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {options.map((option, index) => {
        const count = distribution[option.id] ?? 0;
        const percent =
          totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
        const isCorrect = option.id === correctOptionId;
        const letter = OPTION_LETTERS[index] ?? String(index + 1);

        return (
          <div key={option.id} className="flex flex-col gap-1">
            <div className="flex items-center justify-between gap-2 text-sm font-semibold">
              <span className="flex min-w-0 items-center gap-1.5">
                <span className="font-bold text-[var(--color-navy)]">
                  {letter}.
                </span>
                <span className="truncate text-[var(--color-navy)]">
                  {option.text}
                </span>
                {isCorrect ? (
                  <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-[var(--color-blue)] px-2 py-0.5 text-xs font-bold text-[var(--color-white)]">
                    <Check size={12} aria-hidden="true" />
                    <span>Benar</span>
                  </span>
                ) : null}
              </span>
              <span className="shrink-0 text-[var(--color-navy-muted)] tabular-nums">
                {count} ({percent}%)
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-[var(--color-cream-strong)]">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  isCorrect
                    ? 'bg-[var(--color-blue)]'
                    : 'bg-[var(--color-coral)]',
                )}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
