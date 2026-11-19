'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { AUTH_COPY } from '@/constants/auth.constant';
import { useAdminLogin } from '@/hooks/queries/use-admin-auth';
import { ApiClientError } from '@/lib/errors';
import { notifyError, notifySuccess } from '@/lib/toast';
import type { LoginRequest } from '@/types/auth';
import { loginRequestSchema } from '@/validations/auth.schema';

export function useAdminLoginFlow({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const loginMutation = useAdminLogin();

  const loginForm = useForm<LoginRequest>({
    resolver: zodResolver(loginRequestSchema),
    defaultValues: { email: '', password: '', next: nextPath },
  });

  async function onSubmitLogin(values: LoginRequest) {
    try {
      const result = await loginMutation.mutateAsync({
        email: values.email,
        password: values.password,
        next: nextPath,
      });
      notifySuccess(AUTH_COPY.LOGIN_SUCCESS, {
        toastId: 'admin-login-success',
      });
      router.replace(result.data.redirectTo);
      router.refresh();
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.fieldErrors?.email?.[0]) {
          loginForm.setError('email', { message: err.fieldErrors.email[0] });
        }
        if (err.fieldErrors?.password?.[0]) {
          loginForm.setError('password', {
            message: err.fieldErrors.password[0],
          });
        }
        notifyError(err.message, { toastId: `admin-login-error-${err.code}` });
        return;
      }
      notifyError(AUTH_COPY.ERROR_INVALID_CREDENTIALS, {
        toastId: 'admin-login-error-unknown',
      });
    }
  }

  return {
    loginForm,
    isSubmitting: loginForm.formState.isSubmitting || loginMutation.isPending,
    onSubmitLogin,
  };
}
