'use client';

import { ArrowRight } from 'lucide-react';
import type { FormEventHandler } from 'react';
import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { FeedbackBanner } from '@/components/ui/feedback';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { GAME_COPY, GAME_LIMITS } from '@/constants/game.constant';
import { cn } from '@/utils';

interface JoinFormValues {
  name: string;
  pin?: string;
}

interface JoinFormProps {
  register: UseFormRegister<JoinFormValues>;
  errors: FieldErrors<JoinFormValues>;
  requiresPin: boolean;
  isLocked: boolean;
  isSubmitting: boolean;
  onSubmit: FormEventHandler<HTMLFormElement>;
  className?: string;
}

export function JoinForm({
  register,
  errors,
  requiresPin,
  isLocked,
  isSubmitting,
  onSubmit,
  className,
}: JoinFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className={cn('flex flex-col gap-4', className)}
    >
      {isLocked ? (
        <FeedbackBanner tone="info">
          Sesi sedang berjalan dan pendaftaran sementara dikunci oleh admin.
        </FeedbackBanner>
      ) : null}

      <FormField
        label={GAME_COPY.JOIN_LABEL}
        error={errors.name?.message}
        required
      >
        {(controlProps) => (
          <Input
            {...controlProps}
            {...register('name')}
            placeholder={GAME_COPY.JOIN_PLACEHOLDER}
            autoComplete="nickname"
            autoFocus
            maxLength={GAME_LIMITS.NAME_MAX}
          />
        )}
      </FormField>

      {requiresPin ? (
        <FormField
          label={GAME_COPY.JOIN_PIN_LABEL}
          error={errors.pin?.message}
          required
        >
          {(controlProps) => (
            <Input
              {...controlProps}
              {...register('pin')}
              placeholder={GAME_COPY.JOIN_PIN_PLACEHOLDER}
              inputMode="numeric"
              maxLength={4}
              autoComplete="one-time-code"
            />
          )}
        </FormField>
      ) : null}

      <Button
        type="submit"
        size="lg"
        loading={isSubmitting}
        loadingLabel={GAME_COPY.JOIN_SUBMITTING}
        className="group w-full"
      >
        <span>{GAME_COPY.JOIN_BUTTON}</span>
        <ArrowRight
          size={18}
          aria-hidden="true"
          className="transition-transform duration-150 group-hover:translate-x-0.5"
        />
      </Button>
    </form>
  );
}
