'use client';

import {
  Archive,
  ArrowDown,
  ArrowUp,
  Check,
  Clock,
  Pencil,
  Sparkles,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  OPTION_LETTERS,
  QUESTION_TYPE_LABELS,
} from '@/constants/game.constant';
import { UI_COPY } from '@/constants/ui.constant';
import type { AdminQuestion } from '@/types/question';
import { cn } from '@/utils';

interface AdminQuestionCardProps {
  question: AdminQuestion;
  index: number;
  total: number;
  locked: boolean;
  reordering: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onEdit: () => void;
  onArchive: () => void;
  className?: string;
}

export function AdminQuestionCard({
  question,
  index,
  total,
  locked,
  reordering,
  onMoveUp,
  onMoveDown,
  onEdit,
  onArchive,
  className,
}: AdminQuestionCardProps) {
  return (
    <Card className={cn('flex flex-col gap-4', className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="solid-blue">#{index + 1}</Badge>
          <Badge tone="blue">{QUESTION_TYPE_LABELS[question.type]}</Badge>
          <Badge tone="neutral">
            <Clock size={14} aria-hidden="true" />
            <span>{question.timeLimitSeconds} dtk</span>
          </Badge>
          <Badge tone="neutral">
            <Sparkles size={14} aria-hidden="true" />
            <span>{question.basePoints} poin</span>
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            disabled={locked || reordering || index === 0}
            onClick={onMoveUp}
            aria-label={`Naikkan urutan soal ${index + 1}`}
          >
            <ArrowUp size={16} aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={locked || reordering || index === total - 1}
            onClick={onMoveDown}
            aria-label={`Turunkan urutan soal ${index + 1}`}
          >
            <ArrowDown size={16} aria-hidden="true" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            disabled={locked}
            onClick={onEdit}
          >
            <Pencil size={15} aria-hidden="true" />
            <span>{UI_COPY.EDIT}</span>
          </Button>
          <Button
            variant="danger"
            size="sm"
            disabled={locked}
            onClick={onArchive}
          >
            <Archive size={15} aria-hidden="true" />
            <span>{UI_COPY.ARCHIVE}</span>
          </Button>
        </div>
      </div>

      <h2 className="m-0 text-lg leading-snug font-bold text-[var(--color-navy)]">
        {question.prompt}
      </h2>

      <div className="grid gap-2 sm:grid-cols-2">
        {question.options.map((option, optIdx) => {
          const letter = OPTION_LETTERS[optIdx] ?? String(optIdx + 1);
          const isCorrect = option.id === question.correctOptionId;
          return (
            <div
              key={option.id}
              className={cn(
                'flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold',
                isCorrect
                  ? 'bg-[var(--color-blue-tint)] text-[var(--color-navy)] ring-2 ring-[var(--color-blue)]'
                  : 'bg-[var(--color-cream)] text-[var(--color-navy)]',
              )}
            >
              <span className="font-bold text-[var(--color-blue)]">
                {letter}.
              </span>
              <span className="flex-1">{option.text}</span>
              {isCorrect ? (
                <span className="inline-flex shrink-0 items-center gap-0.5 text-xs font-bold text-[var(--color-blue)] uppercase">
                  <Check size={14} aria-hidden="true" />
                  <span>Benar</span>
                </span>
              ) : null}
            </div>
          );
        })}
      </div>

      {question.explanation ? (
        <p className="m-0 rounded-xl bg-[var(--color-cream)] px-3.5 py-2.5 text-sm font-medium text-[var(--color-navy-muted)]">
          <strong>Penjelasan:</strong> {question.explanation}
        </p>
      ) : null}
    </Card>
  );
}
