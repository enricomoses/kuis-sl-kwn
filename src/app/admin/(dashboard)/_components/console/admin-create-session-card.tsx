'use client';

import { Play, Shuffle } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FeedbackBanner } from '@/components/ui/feedback';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import type { CreateSessionRequest } from '@/types/game';
import { cn } from '@/utils';

interface AdminCreateSessionCardProps {
  isCreating: boolean;
  error: string | null;
  fieldErrors: Record<string, string[]>;
  onCreate: (payload: CreateSessionRequest) => void;
  className?: string;
}

export function AdminCreateSessionCard({
  isCreating,
  error,
  fieldErrors,
  onCreate,
  className,
}: AdminCreateSessionCardProps) {
  const [allowLateJoin, setAllowLateJoin] = useState(false);
  const [joinPin, setJoinPin] = useState('');

  function generateRandomPin() {
    const code = String(Math.floor(1000 + Math.random() * 9000));
    setJoinPin(code);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onCreate({
      allowLateJoin,
      joinPin: joinPin.trim() ? joinPin.trim() : null,
    });
  }

  return (
    <Card
      className={cn('mx-auto flex w-full max-w-xl flex-col gap-5', className)}
    >
      <div className="flex flex-col gap-1">
        <span className="quiz-kicker quiz-kicker--blue">SESI BARU</span>
        <h2 className="m-0 text-2xl font-bold text-[var(--color-navy)]">
          Buka Sesi Kuis Kelas
        </h2>
        <p className="m-0 text-sm font-medium text-[var(--color-navy-muted)]">
          Urutan soal aktif di Bank Soal akan dibekukan saat sesi dibuka.
        </p>
      </div>

      {error ? <FeedbackBanner tone="error">{error}</FeedbackBanner> : null}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FormField
          label="PIN Join 4 Digit (Opsional)"
          helper="Kosongkan jika siswa boleh langsung gabung tanpa PIN."
          error={fieldErrors.joinPin?.[0]}
        >
          {(controlProps) => (
            <div className="flex gap-2">
              <Input
                {...controlProps}
                value={joinPin}
                onChange={(e) =>
                  setJoinPin(e.target.value.replace(/\D/g, '').slice(0, 4))
                }
                placeholder="Contoh: 4821"
                inputMode="numeric"
                maxLength={4}
              />
              <Button
                type="button"
                variant="secondary"
                onClick={generateRandomPin}
                aria-label="Buat PIN acak 4 digit"
              >
                <Shuffle size={18} aria-hidden="true" />
                <span>Acak</span>
              </Button>
            </div>
          )}
        </FormField>

        <label className="flex min-h-[48px] cursor-pointer items-center gap-3 rounded-xl bg-[var(--color-cream)] px-4 py-3 text-sm font-semibold text-[var(--color-navy)]">
          <input
            type="checkbox"
            checked={allowLateJoin}
            onChange={(e) => setAllowLateJoin(e.target.checked)}
            className="h-5 w-5 accent-[var(--color-blue)]"
          />
          <span>Izinkan pemain bergabung setelah kuis dimulai (late join)</span>
        </label>

        <Button
          type="submit"
          size="lg"
          loading={isCreating}
          loadingLabel="Membuka sesi…"
          className="w-full"
        >
          <Play size={18} aria-hidden="true" />
          <span>Buat Sesi &amp; Buka Ruang Tunggu</span>
        </Button>
      </form>
    </Card>
  );
}
