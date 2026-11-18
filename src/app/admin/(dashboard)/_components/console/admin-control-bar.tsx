'use client';

import { ArrowRight, Flag, Play, SkipForward, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { AdminSessionAction, GamePhase } from '@/types/game';
import { cn } from '@/utils';

interface AdminControlBarProps {
  phase: GamePhase;
  playerCount: number;
  isLastQuestion: boolean;
  isPending: boolean;
  onAction: (action: AdminSessionAction) => void;
  onRequestCancel: () => void;
  className?: string;
}

export function AdminControlBar({
  phase,
  playerCount,
  isLastQuestion,
  isPending,
  onAction,
  onRequestCancel,
  className,
}: AdminControlBarProps) {
  return (
    <Card
      tone="cream"
      className={cn(
        'flex flex-wrap items-center justify-between gap-3',
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        {phase === 'lobby' ? (
          <Button
            size="lg"
            disabled={playerCount < 1}
            loading={isPending}
            onClick={() => onAction('start')}
          >
            <Play size={18} aria-hidden="true" />
            <span>Mulai Kuis</span>
          </Button>
        ) : null}

        {phase === 'countdown' || phase === 'question' ? (
          <Button
            size="lg"
            loading={isPending}
            onClick={() => onAction('close_question')}
          >
            <SkipForward size={18} aria-hidden="true" />
            <span>Akhiri Soal</span>
          </Button>
        ) : null}

        {phase === 'reveal' && !isLastQuestion ? (
          <Button
            size="lg"
            loading={isPending}
            onClick={() => onAction('next')}
          >
            <span>Soal Berikutnya</span>
            <ArrowRight size={18} aria-hidden="true" />
          </Button>
        ) : null}

        {phase === 'reveal' && isLastQuestion ? (
          <Button
            size="lg"
            loading={isPending}
            onClick={() => onAction('finish')}
          >
            <Flag size={18} aria-hidden="true" />
            <span>Lihat Hasil Akhir</span>
          </Button>
        ) : null}
      </div>

      <Button
        variant="danger"
        size="md"
        disabled={isPending}
        onClick={onRequestCancel}
      >
        <XCircle size={18} aria-hidden="true" />
        <span>Batalkan Sesi</span>
      </Button>
    </Card>
  );
}
