import type { LeaderboardEntry } from '@/types/game';

const FORMULA_PREFIX = /^[=+\-@\t\r]/;

/**
 * Escapes a single CSV field per RFC-4180 and neutralizes spreadsheet formula injection.
 */
export function escapeCsvCell(
  value: string | number | null | undefined,
): string {
  const raw = value === null || value === undefined ? '' : String(value);
  const safe = FORMULA_PREFIX.test(raw) ? `'${raw}` : raw;
  if (/[",\r\n]/.test(safe)) {
    return `"${safe.replace(/"/g, '""')}"`;
  }
  return safe;
}

export function buildLeaderboardCsv(
  entries: readonly LeaderboardEntry[],
): string {
  const header = [
    'Peringkat',
    'Nama Pemain',
    'Total Skor',
    'Jawaban Benar',
    'Total Waktu Benar (ms)',
  ].join(',');

  const rows = entries.map((entry) =>
    [
      escapeCsvCell(entry.rank),
      escapeCsvCell(entry.name),
      escapeCsvCell(entry.totalScore),
      escapeCsvCell(entry.correctCount),
      escapeCsvCell(entry.totalCorrectMs),
    ].join(','),
  );

  // Prefix UTF-8 BOM so Microsoft Excel renders Indonesian characters cleanly
  return `\uFEFF${[header, ...rows].join('\r\n')}\r\n`;
}
