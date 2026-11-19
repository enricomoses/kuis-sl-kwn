'use client';

import { useEffect, useRef } from 'react';
import { ErrorState } from '@/components/common/feedback/error-state';
import { PlayPanelSkeleton } from '@/components/common/feedback/page-skeletons';
import { ConnectionBadge } from '@/components/common/game/connection-badge';
import { AppBrandHeader } from '@/components/common/layout/app-brand-header';
import { usePlayController } from '@/hooks/use-play-controller';
import type { PlayerState } from '@/types/game';
import { cn } from '@/utils';
import { PlayCancelledPanel } from './play-cancelled-panel';
import { PlayCountdownPanel } from './play-countdown-panel';
import { PlayFinishedPanel } from './play-finished-panel';
import { PlayLobbyPanel } from './play-lobby-panel';
import { PlayQuestionPanel } from './play-question-panel';
import { PlayRevealPanel } from './play-reveal-panel';

interface PlayViewProps {
  initialState?: PlayerState;
  className?: string;
}

export function PlayView({ initialState, className }: PlayViewProps) {
  const controller = usePlayController(initialState);
  const mainRef = useRef<HTMLElement>(null);
  const state = controller.state;

  const phaseFocusKey = state
    ? state.phase === 'countdown' ||
      state.phase === 'question' ||
      state.phase === 'reveal'
      ? `${state.phase}:${state.questionIndex}`
      : state.phase
    : '';

  // Move focus to the active phase heading on transitions (PRD §15.4)
  useEffect(() => {
    if (!phaseFocusKey) return;
    const heading = mainRef.current?.querySelector<HTMLElement>(
      '[data-phase-heading="true"]',
    );
    heading?.focus();
  }, [phaseFocusKey]);

  return (
    <main ref={mainRef} className={cn('play-container', className)}>
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {controller.announcement}
      </div>

      <div className="play-topbar">
        <AppBrandHeader compact />
        {state && state.phase !== 'finished' && state.phase !== 'cancelled' ? (
          <ConnectionBadge status={controller.connectionStatus} />
        ) : null}
      </div>

      {controller.isLoading && !state ? <PlayPanelSkeleton /> : null}

      {controller.isError && !state ? (
        <ErrorState
          message="Gagal memuat status sesi kuis. Periksa koneksimu lalu coba lagi."
          onRetry={() => void controller.refetch()}
        />
      ) : null}

      {state?.phase === 'lobby' ? (
        <PlayLobbyPanel
          meId={state.me.id}
          meName={state.me.name}
          players={state.players}
          playerCount={state.playerCount}
        />
      ) : null}

      {state?.phase === 'countdown' ? (
        <PlayCountdownPanel
          questionNumber={state.questionIndex + 1}
          totalQuestions={state.session.totalQuestions}
          remainingSeconds={controller.remainingSeconds}
        />
      ) : null}

      {state?.phase === 'question' ? (
        <PlayQuestionPanel
          questionNumber={state.questionIndex + 1}
          totalQuestions={state.session.totalQuestions}
          prompt={state.question.prompt}
          options={state.question.options}
          timeLimitSeconds={state.question.timeLimitSeconds}
          remainingMs={controller.remainingMs}
          remainingSeconds={controller.remainingSeconds}
          selectedOptionId={state.myAnswer?.optionId ?? null}
          isSubmitting={controller.isSubmitting}
          failedSubmission={controller.failedSubmission}
          onSelectOption={controller.selectOption}
          onRetrySubmit={controller.retrySubmit}
        />
      ) : null}

      {state?.phase === 'reveal' ? (
        <PlayRevealPanel
          questionNumber={state.questionIndex + 1}
          totalQuestions={state.session.totalQuestions}
          prompt={state.question.prompt}
          options={state.question.options}
          explanation={state.question.explanation}
          correctOptionId={state.correctOptionId}
          myResult={state.myResult}
          myRank={state.me.rank}
          myPlayerId={state.me.id}
          myTotalScore={state.me.totalScore}
          distribution={state.distribution}
          leaderboard={state.leaderboard}
          isLastQuestion={state.isLastQuestion}
        />
      ) : null}

      {state?.phase === 'finished' ? (
        <PlayFinishedPanel
          myPlayerId={state.me.id}
          myRank={state.me.rank}
          myTotalScore={state.me.totalScore}
          leaderboard={state.leaderboard}
        />
      ) : null}

      {state?.phase === 'cancelled' ? <PlayCancelledPanel /> : null}
    </main>
  );
}
