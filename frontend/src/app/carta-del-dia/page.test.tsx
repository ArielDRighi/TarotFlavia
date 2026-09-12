import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

import CartaDelDiaPage, { revalidate } from './page';
import type { DailyCardPageData } from '@/types/home.types';

const mockGetDailyCardPageData = vi.fn();
vi.mock('@/lib/api/daily-card-page-server', () => ({
  getDailyCardPageData: () => mockGetDailyCardPageData(),
}));

// La página en sí está cubierta por `DailyCardPage.test.tsx`; acá interesa qué
// le pasa la ruta.
const mockPage = vi.fn();
vi.mock('@/components/features/daily-reading/DailyCardPage', () => ({
  DailyCardPage: (props: { data: DailyCardPageData }) => {
    mockPage(props);
    return <div data-testid="daily-card-page" />;
  },
}));

const DATA: DailyCardPageData = { today: undefined, archive: [] };

describe('CartaDelDiaPage (/carta-del-dia, T-SEO-015)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetDailyCardPageData.mockResolvedValue(DATA);
  });

  it('resuelve la carta de hoy y el archivo en el servidor y se los pasa a la página', async () => {
    render(await CartaDelDiaPage());

    expect(mockGetDailyCardPageData).toHaveBeenCalledTimes(1);
    expect(mockPage).toHaveBeenCalledWith({ data: DATA });
    expect(screen.getByTestId('daily-card-page')).toBeInTheDocument();
  });

  it('ISR de una hora: la carta cambia con el día canónico', () => {
    expect(revalidate).toBe(3600);
  });
});
