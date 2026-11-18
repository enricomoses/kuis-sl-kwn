import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { PlayAnswerOptions } from '@/app/(site)/play/_components/play-answer-options';

const OPTIONS = [
  { id: 'true', text: 'Benar' },
  { id: 'false', text: 'Salah' },
];

describe('PlayAnswerOptions', () => {
  it('calls onSelect when idle and locks all options once selected', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    const { rerender } = render(
      <PlayAnswerOptions
        options={OPTIONS}
        selectedOptionId={null}
        onSelect={onSelect}
      />,
    );

    await user.click(screen.getByRole('button', { name: /Salah/i }));
    expect(onSelect).toHaveBeenCalledWith('false');

    rerender(
      <PlayAnswerOptions
        options={OPTIONS}
        selectedOptionId="false"
        onSelect={onSelect}
      />,
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).toBeDisabled();
    expect(buttons[1]).toBeDisabled();
    expect(buttons[1]).toHaveAttribute('aria-pressed', 'true');
  });
});
