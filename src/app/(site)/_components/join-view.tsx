'use client';

import { AppBrandHeader } from '@/components/common/layout/app-brand-header';
import { Card } from '@/components/ui/card';
import { useJoinFlow } from '@/hooks/use-join-flow';
import type { PlayMeResponse } from '@/types/game';
import { cn } from '@/utils';
import { JoinForm } from './join-form';
import { WaitingForSession } from './waiting-for-session';

interface JoinViewProps {
  initialMe?: PlayMeResponse;
  className?: string;
}

export function JoinView({ initialMe, className }: JoinViewProps) {
  const flow = useJoinFlow(initialMe);

  return (
    <main className={cn('site-container', className)}>
      <AppBrandHeader />

      <Card className="flex flex-col gap-5">
        <JoinForm
          register={flow.form.register}
          errors={flow.form.formState.errors}
          requiresPin={flow.requiresPin}
          isLocked={flow.isLocked}
          isSubmitting={flow.isSubmitting}
          serverError={flow.serverError}
          onSubmit={flow.form.handleSubmit(flow.onSubmit)}
        />

        {!flow.isLoadingMe && !flow.activeSession ? (
          <WaitingForSession connectionStatus={flow.connectionStatus} />
        ) : null}
      </Card>
    </main>
  );
}
