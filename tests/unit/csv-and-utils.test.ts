import { describe, expect, it } from 'vitest';
import { createPreferencesStore } from '@/stores/preferences.store';
import { buildListParams } from '@/utils/api';
import { buildLeaderboardCsv, escapeCsvCell } from '@/utils/csv';

describe('CSV, buildListParams & preferences store', () => {
  it('escapes commas, quotes, and neutralizes spreadsheet formula injection', () => {
    expect(escapeCsvCell('Budi, S.Kom')).toBe('"Budi, S.Kom"');
    expect(escapeCsvCell('=CMD()')).toBe("'=CMD()");
    expect(escapeCsvCell('+123')).toBe("'+123");
    expect(escapeCsvCell('Nama "A"')).toBe('"Nama ""A"""');
  });

  it('builds UTF-8 BOM CSV for leaderboard entries', () => {
    const csv = buildLeaderboardCsv([
      {
        rank: 1,
        playerId: '11111111-1111-4111-8111-111111111111',
        name: 'Sinta',
        totalScore: 2650,
        correctCount: 3,
        totalCorrectMs: 4200,
      },
    ]);
    expect(csv.startsWith('\uFEFFPeringkat,Nama Pemain')).toBe(true);
    expect(csv).toContain('1,Sinta,2650,3,4200');
  });

  it('cleans undefined/empty params in buildListParams', () => {
    expect(
      buildListParams(
        { q: '  halo ', empty: '', skip: null, filter: 'all' },
        { omitAll: true },
      ),
    ).toEqual({ q: 'halo' });
    expect(buildListParams({ empty: '  ' })).toBeUndefined();
  });

  it('updates preferences store cleanly', () => {
    const store = createPreferencesStore();
    expect(store.getState().hideLiveScores).toBe(false);
    store.getState().toggleHideLiveScores();
    expect(store.getState().hideLiveScores).toBe(true);
    store.getState().setLastPlayerName('Raka');
    expect(store.getState().lastPlayerName).toBe('Raka');
  });
});
