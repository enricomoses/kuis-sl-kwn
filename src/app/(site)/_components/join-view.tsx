'use client';

import { AppBrandHeader } from '@/components/common/layout/app-brand-header';
import { PartnerLogos } from '@/components/common/layout/partner-logos';
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
      <PartnerLogos />

      <div className="auth-card">
        <div className="flex flex-col gap-6 px-6 py-7 sm:px-8 sm:py-8">
          <AppBrandHeader centered />

          <JoinForm
            register={flow.form.register}
            errors={flow.form.formState.errors}
            requiresPin={flow.requiresPin}
            isLocked={flow.isLocked}
            isSubmitting={flow.isSubmitting}
            onSubmit={flow.form.handleSubmit(flow.onSubmit)}
          />
        </div>

        {!flow.isLoadingMe && !flow.activeSession ? (
          <WaitingForSession />
        ) : null}
      </div>
    </main>
  );
}
