'use client';

import { Play, Shuffle } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import type { CreateSessionRequest } from '@/types/game';
import { cn } from '@/utils';

interface AdminCreateSessionCardProps {
  isCreating: boolean;
  fieldErrors: Record<string, string[]>;
  onCreate: (payload: CreateSessionRequest) => void;
  className?: string;
}

export function AdminCreateSessionCard({
  isCreating,
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
    <section
      aria-labelledby="create-session-heading"
      className={cn(
        'auth-card mx-auto mt-2 flex w-full max-w-[480px] flex-col gap-6 px-6 py-7 sm:mt-4 sm:px-8 sm:py-8',
        className,
      )}
    >
      <div className="flex flex-col gap-1">
        <h2
          id="create-session-heading"
          className="m-0 text-xl font-bold tracking-[-0.02em] text-[var(--color-navy)]"
        >
          Buka Sesi Kuis Kelas
        </h2>
        <p className="m-0 text-sm font-medium text-[var(--color-navy-muted)]">
          Urutan soal aktif di Bank Soal akan dibekukan saat sesi dibuka.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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
                className="font-semibold tracking-[0.12em] tabular-nums placeholder:tracking-normal"
              />
              <Button
                type="button"
                variant="ghost"
                onClick={generateRandomPin}
                aria-label="Buat PIN acak 4 digit"
                className="shrink-0 rounded-[0.625rem] border-[1.5px] border-[rgba(23,35,59,0.16)] bg-white px-4 text-sm font-semibold hover:bg-[#faf8f4]"
              >
                <Shuffle size={16} aria-hidden="true" />
                <span>Acak</span>
              </Button>
            </div>
          )}
        </FormField>

        <label className="flex min-h-[48px] cursor-pointer items-center gap-3 rounded-[0.625rem] border border-[rgba(23,35,59,0.09)] bg-[#faf8f4] px-3.5 py-3 text-sm font-medium text-[var(--color-navy)] transition-colors hover:border-[rgba(23,35,59,0.18)]">
          <input
            type="checkbox"
            checked={allowLateJoin}
            onChange={(e) => setAllowLateJoin(e.target.checked)}
            className="h-4 w-4 shrink-0 rounded accent-[var(--color-blue)]"
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
          <Play size={17} aria-hidden="true" />
          <span>Buat Sesi &amp; Buka Ruang Tunggu</span>
        </Button>
      </form>
    </section>
  );
}
