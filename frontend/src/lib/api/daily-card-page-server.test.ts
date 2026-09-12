import { describe, it, expect, vi, beforeEach } from 'vitest';

import { getDailyCardPageData } from './daily-card-page-server';

const mockGetCanonicalDailyCard = vi.fn();
const mockGetDailyCardArchive = vi.fn();

vi.mock('./daily-card-server', () => ({
  getCanonicalDailyCard: () => mockGetCanonicalDailyCard(),
  getDailyCardArchive: () => mockGetDailyCardArchive(),
}));

describe('getDailyCardPageData (T-SEO-015)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  it('resuelve la carta de hoy y el archivo en paralelo', async () => {
    mockGetCanonicalDailyCard.mockResolvedValue({ canonicalDate: '2026-09-12', card: { id: 1 } });
    mockGetDailyCardArchive.mockResolvedValue([{ date: '2026-09-11', card: { id: 2 } }]);

    const data = await getDailyCardPageData();

    expect(data.today?.canonicalDate).toBe('2026-09-12');
    expect(data.archive).toHaveLength(1);
  });

  it('degrada por bloque: un rechazo no tumba al otro', async () => {
    mockGetCanonicalDailyCard.mockRejectedValue(new Error('boom'));
    mockGetDailyCardArchive.mockResolvedValue([]);

    const data = await getDailyCardPageData();

    expect(data.today).toBeUndefined();
    expect(data.archive).toEqual([]);
    expect(console.warn).toHaveBeenCalled();
  });
});
