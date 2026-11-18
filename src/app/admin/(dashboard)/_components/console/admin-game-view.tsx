'use client';

import { ConfirmDialog } from '@/components/common/feedback/confirm-dialog';
import { ErrorState } from '@/components/common/feedback/error-state';
import { ConnectionBadge } from '@/components/common/game/connection-badge';
import { PageHeader } from '@/components/common/layout/page-header';
import { useAdminGameConsole } from '@/hooks/use-admin-game-console';
import type { AdminSessionProfile } from '@/types/auth';
import type { AdminGameState } from '@/types/game';
import { cn } from '@/utils';
import { AdminControlBar } from './admin-control-bar';
import { AdminCreateSessionCard } from './admin-create-session-card';
import { AdminFinalPanel } from './admin-final-panel';
import { AdminLiveLeaderboard } from './admin-live-leaderboard';
import { AdminLobbyPanel } from './admin-lobby-panel';
import { AdminQuestionPanel } from './admin-question-panel';
import { AdminRevealPanel } from './admin-reveal-panel';

interface AdminGameViewProps {
  profile: AdminSessionProfile;
  initialState: AdminGameState | null;
  className?: string;
}

export function AdminGameView({
  profile,
  initialState,
  className,
}: AdminGameViewProps) {
  const consoleCtrl = useAdminGameConsole(profile, initialState);
  const state = consoleCtrl.state;

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      <PageHeader
        kicker="KENDALI KUIS REALTIME"
        title="Ruang Kontrol"
        subtitle="Proyeksikan layar ini ke kelas untuk menampilkan soal, timer, dan leaderboard live."
        aside={
          consoleCtrl.isActiveSession ? (
            <ConnectionBadge status={consoleCtrl.connectionStatus} />
          ) : null
        }
      />

      {consoleCtrl.isError ? (
        <ErrorState
          message="Gagal membaca status sesi kuis."
          onRetry={() => void consoleCtrl.refetch()}
        />
      ) : null}

      {!state ? (
        <AdminCreateSessionCard
          isCreating={consoleCtrl.isCreating}
          error={consoleCtrl.createError}
          fieldErrors={consoleCtrl.createFieldErrors}
          onCreate={(payload) => void consoleCtrl.createSession(payload)}
        />
      ) : state.session.phase === 'finished' ? (
        <AdminFinalPanel
          sessionId={state.session.id}
          leaderboard={state.leaderboard}
          onNewSession={consoleCtrl.startFreshSessionScreen}
        />
      ) : (
        <div className="flex flex-col gap-5">
          <div className="admin-console-grid">
            <div className="flex flex-col gap-4">
              {state.session.phase === 'lobby' ? (
                <AdminLobbyPanel
                  totalQuestions={state.session.totalQuestions}
                  allowLateJoin={state.session.allowLateJoin}
                  joinPin={state.session.joinPin}
                  players={state.players}
                  onKickRequest={consoleCtrl.setKickCandidate}
                />
              ) : null}

              {(state.session.phase === 'countdown' ||
                state.session.phase === 'question') &&
              state.currentQuestion ? (
                <AdminQuestionPanel
                  phase={state.session.phase}
                  questionNumber={state.session.currentIndex + 1}
                  totalQuestions={state.session.totalQuestions}
                  prompt={state.currentQuestion.prompt}
                  options={state.currentQuestion.options}
                  correctOptionId={state.currentQuestion.correctOptionId}
                  timeLimitSeconds={state.currentQuestion.timeLimitSeconds}
                  remainingMs={consoleCtrl.remainingMs}
                  remainingSeconds={consoleCtrl.remainingSeconds}
                  answeredCount={state.answeredCount}
                  totalPlayers={state.players.length}
                />
              ) : null}

              {state.session.phase === 'reveal' &&
              state.currentQuestion &&
              state.distribution ? (
                <AdminRevealPanel
                  questionNumber={state.session.currentIndex + 1}
                  totalQuestions={state.session.totalQuestions}
                  prompt={state.currentQuestion.prompt}
                  options={state.currentQuestion.options}
                  correctOptionId={state.currentQuestion.correctOptionId}
                  explanation={state.currentQuestion.explanation}
                  distribution={state.distribution}
                  answeredCount={state.answeredCount}
                  totalPlayers={state.players.length}
                />
              ) : null}

              <AdminControlBar
                phase={state.session.phase}
                playerCount={state.players.length}
                isLastQuestion={
                  state.session.currentIndex >= state.session.totalQuestions - 1
                }
                isPending={consoleCtrl.isActionPending}
                onAction={(action) => void consoleCtrl.runAction(action)}
                onRequestCancel={() => consoleCtrl.setCancelConfirmOpen(true)}
              />
            </div>

            <AdminLiveLeaderboard
              entries={state.leaderboard}
              hideScores={consoleCtrl.hideLiveScores}
              onToggleHideScores={consoleCtrl.toggleHideLiveScores}
              onKickPlayer={consoleCtrl.setKickCandidate}
            />
          </div>
        </div>
      )}

      <ConfirmDialog
        open={consoleCtrl.cancelConfirmOpen}
        title="Batalkan sesi kuis ini?"
        description="Semua pemain yang tergabung akan melihat notifikasi bahwa sesi dibatalkan, dan sesi tidak dapat dilanjutkan kembali."
        confirmLabel="Ya, Batalkan Sesi"
        destructive
        loading={consoleCtrl.isActionPending}
        onConfirm={() => void consoleCtrl.runAction('cancel')}
        onCancel={() => consoleCtrl.setCancelConfirmOpen(false)}
      />

      <ConfirmDialog
        open={Boolean(consoleCtrl.kickCandidate)}
        title={`Keluarkan ${consoleCtrl.kickCandidate?.name ?? 'pemain'}?`}
        description="Pemain dan jawabannya pada sesi ini akan dihapus dari daftar peserta."
        confirmLabel="Keluarkan Pemain"
        destructive
        loading={consoleCtrl.isKicking}
        onConfirm={() => void consoleCtrl.confirmKickPlayer()}
        onCancel={() => consoleCtrl.setKickCandidate(null)}
      />
    </div>
  );
}
