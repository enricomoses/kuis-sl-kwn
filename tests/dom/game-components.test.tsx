import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CountdownBar } from '@/components/common/game/countdown-bar';
import { LeaderboardList } from '@/components/common/game/leaderboard-list';

describe('CountdownBar & LeaderboardList', () => {
  it('renders CountdownBar progressbar semantics and remaining seconds', () => {
    render(
      <CountdownBar
        remainingMs={4000}
        totalSeconds={20}
        remainingSeconds={4}
        label="Soal 1 dari 5"
      />,
    );

    expect(screen.getByText('4 dtk')).toBeInTheDocument();
    const bar = screen.getByRole('progressbar', { name: 'Soal 1 dari 5' });
    expect(bar).toHaveAttribute('aria-valuenow', '4000');
    expect(bar).toHaveAttribute('aria-valuemax', '20000');
  });

  it('highlights current player and supports hiding scores in LeaderboardList', () => {
    const entries = [
      {
        rank: 1,
        playerId: '11111111-1111-4111-8111-111111111111',
        name: 'Budi',
        totalScore: 1900,
        correctCount: 2,
        totalCorrectMs: 2500,
      },
      {
        rank: 2,
        playerId: '22222222-2222-4222-8222-222222222222',
        name: 'Sinta',
        totalScore: 1500,
        correctCount: 2,
        totalCorrectMs: 5000,
      },
    ];

    const { rerender } = render(
      <LeaderboardList
        entries={entries}
        highlightPlayerId="22222222-2222-4222-8222-222222222222"
      />,
    );

    expect(screen.getByText('(Kamu)')).toBeInTheDocument();
    expect(screen.getByText('1.900')).toBeInTheDocument();

    rerender(<LeaderboardList entries={entries} hideScores />);
    expect(screen.queryByText('1.900')).not.toBeInTheDocument();
    expect(screen.getAllByText('•••')).toHaveLength(2);
  });
});
