'use client';

import Link from 'next/link';
import { LogIn } from 'lucide-react';
import { AppBrandHeader } from '@/components/common/layout/app-brand-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FeedbackBanner } from '@/components/ui/feedback';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { AUTH_COPY } from '@/constants/auth.constant';
import { ROUTES } from '@/constants/routes.constant';
import { useAdminLoginFlow } from '@/hooks/use-admin-login-flow';
import { cn } from '@/utils';

interface AdminLoginViewProps {
  nextPath: string;
  className?: string;
}

export function AdminLoginView({ nextPath, className }: AdminLoginViewProps) {
  const flow = useAdminLoginFlow({ nextPath });
  const { register, handleSubmit, formState } = flow.loginForm;

  return (
    <main
      className={cn(
        'mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-6 px-4 py-10',
        className,
      )}
    >
      <AppBrandHeader compact />

      <Card className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <div>
            <Badge tone="blue">{AUTH_COPY.LOGIN_BADGE}</Badge>
          </div>
          <h1 className="m-0 text-2xl font-bold text-[var(--color-navy)]">
            {AUTH_COPY.LOGIN_TITLE}
          </h1>
          <p className="m-0 text-sm font-medium text-[var(--color-navy-muted)]">
            {AUTH_COPY.LOGIN_SUBTITLE}
          </p>
        </div>

        {flow.serverError ? (
          <FeedbackBanner tone="error">{flow.serverError}</FeedbackBanner>
        ) : null}

        <form
          onSubmit={handleSubmit(flow.onSubmitLogin)}
          noValidate
          className="flex flex-col gap-4"
        >
          <FormField
            label={AUTH_COPY.EMAIL_LABEL}
            error={formState.errors.email?.message}
            required
          >
            {(controlProps) => (
              <Input
                {...controlProps}
                {...register('email')}
                type="email"
                autoComplete="email"
                placeholder={AUTH_COPY.EMAIL_PLACEHOLDER}
              />
            )}
          </FormField>

          <FormField
            label={AUTH_COPY.PASSWORD_LABEL}
            error={formState.errors.password?.message}
            required
          >
            {(controlProps) => (
              <Input
                {...controlProps}
                {...register('password')}
                type="password"
                autoComplete="current-password"
                placeholder={AUTH_COPY.PASSWORD_PLACEHOLDER}
              />
            )}
          </FormField>

          <Button
            type="submit"
            size="lg"
            loading={flow.isSubmitting}
            loadingLabel={AUTH_COPY.SUBMITTING_BUTTON}
            className="w-full"
          >
            <LogIn size={18} aria-hidden="true" />
            <span>{AUTH_COPY.SUBMIT_BUTTON}</span>
          </Button>
        </form>
      </Card>

      <div className="text-center">
        <Link
          href={ROUTES.HOME}
          className="text-sm font-bold text-[var(--color-blue)] underline-offset-4 hover:underline"
        >
          ← Kembali ke halaman pemain
        </Link>
      </div>
    </main>
  );
}
