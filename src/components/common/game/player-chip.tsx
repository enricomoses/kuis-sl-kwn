import { X } from 'lucide-react';
import { cn } from '@/utils';

interface PlayerChipProps {
  name: string;
  highlight?: boolean;
  onKick?: () => void;
  className?: string;
}

export function PlayerChip({
  name,
  highlight = false,
  onKick,
  className,
}: PlayerChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-bold',
        highlight
          ? 'bg-[var(--color-blue)] text-[var(--color-white)]'
          : 'bg-[var(--color-blue-tint)] text-[var(--color-navy)]',
        className,
      )}
    >
      <span>{name}</span>
      {onKick ? (
        <button
          type="button"
          onClick={onKick}
          aria-label={`Keluarkan ${name}`}
          className="ml-0.5 inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-[var(--color-coral-tint)] text-[var(--color-coral-ink)] hover:bg-[var(--color-coral)] hover:text-[var(--color-navy)]"
        >
          <X size={14} aria-hidden="true" />
        </button>
      ) : null}
    </span>
  );
}
