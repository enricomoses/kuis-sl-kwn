import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';
import { JoinForm } from '@/app/(site)/_components/join-form';

function TestJoinFormWrapper({
  requiresPin = false,
  nameError,
  onValidSubmit,
}: {
  requiresPin?: boolean;
  nameError?: string;
  onValidSubmit: (vals: { name: string; pin?: string }) => void;
}) {
  const form = useForm<{ name: string; pin?: string }>({
    defaultValues: { name: '', pin: '' },
  });

  return (
    <JoinForm
      register={form.register}
      errors={
        nameError
          ? { name: { type: 'server', message: nameError } }
          : form.formState.errors
      }
      requiresPin={requiresPin}
      isLocked={false}
      isSubmitting={false}
      serverError={null}
      onSubmit={form.handleSubmit(onValidSubmit)}
    />
  );
}

describe('JoinForm', () => {
  it('renders name error message with alert role and submits player name', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <TestJoinFormWrapper
        requiresPin
        nameError="Nama ini sudah digunakan oleh pemain lain."
        onValidSubmit={onSubmit}
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Nama ini sudah digunakan oleh pemain lain.',
    );

    const nameInput = screen.getByPlaceholderText('Masukkan namamu');
    const pinInput = screen.getByPlaceholderText('Masukkan 4 digit PIN');
    await user.type(nameInput, 'Budi');
    await user.type(pinInput, '4821');
    await user.click(screen.getByRole('button', { name: /Gabung/i }));

    expect(onSubmit).toHaveBeenCalledWith(
      { name: 'Budi', pin: '4821' },
      expect.anything(),
    );
  });
});
