import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AdminCreateSessionCard } from '@/app/admin/(dashboard)/_components/console/admin-create-session-card';

describe('AdminCreateSessionCard', () => {
  it('generates a 4-digit PIN and submits session creation options', async () => {
    const user = userEvent.setup();
    const onCreate = vi.fn();

    render(
      <AdminCreateSessionCard
        isCreating={false}
        fieldErrors={{}}
        onCreate={onCreate}
      />,
    );

    expect(
      screen.getByRole('heading', { name: 'Buka Sesi Kuis Kelas' }),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: 'Buat PIN acak 4 digit' }),
    );
    const pinInput = screen.getByPlaceholderText(
      'Contoh: 4821',
    ) as HTMLInputElement;
    expect(pinInput.value).toMatch(/^\d{4}$/);

    await user.click(
      screen.getByLabelText(/Izinkan pemain bergabung setelah kuis dimulai/i),
    );
    await user.click(
      screen.getByRole('button', { name: /Buat Sesi & Buka Ruang Tunggu/i }),
    );

    expect(onCreate).toHaveBeenCalledWith({
      allowLateJoin: true,
      joinPin: pinInput.value,
    });
  });
});
