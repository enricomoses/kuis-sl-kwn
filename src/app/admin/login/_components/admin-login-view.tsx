'use client';

import { ArrowLeft, LogIn } from 'lucide-react';
import Link from 'next/link';
import { PartnerLogos } from '@/components/common/layout/partner-logos';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { APP_INFO } from '@/constants/app.constant';
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
        'mx-auto flex min-h-dvh w-full max-w-[448px] flex-col items-center justify-center gap-6 px-4 py-10',
        className,
      )}
    >
      <PartnerLogos size="sm" />

      <div className="auth-card">
        <div className="flex flex-col gap-6 px-6 py-7 sm:px-8 sm:py-8">
          <header className="flex flex-col gap-1.5 text-center">
            <p className="m-0 text-xs font-semibold tracking-wider text-[var(--color-blue)] uppercase">
              {APP_INFO.TITLE}
            </p>
            <h1 className="m-0 text-[1.5rem] leading-[1.2] font-bold tracking-[-0.025em] text-[var(--color-navy)]">
              {AUTH_COPY.LOGIN_TITLE}
            </h1>
          </header>

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
              className="mt-1 w-full"
            >
              <LogIn size={18} aria-hidden="true" />
              <span>{AUTH_COPY.SUBMIT_BUTTON}</span>
            </Button>
          </form>
        </div>
      </div>

      <Link
        href={ROUTES.HOME}
        className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-[var(--color-navy-muted)] transition-colors hover:text-[var(--color-navy)]"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        <span>Kembali ke halaman pemain</span>
      </Link>
    </main>
  );
}
