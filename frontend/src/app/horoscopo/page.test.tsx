import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

import HoroscopoPage, { revalidate } from './page';
import type { CanonicalDailyHoroscopes } from '@/types/horoscope.types';

const mockGetCanonicalDailyHoroscopes = vi.fn();
vi.mock('@/lib/api/horoscope-server', () => ({
  getCanonicalDailyHoroscopes: () => mockGetCanonicalDailyHoroscopes(),
}));

// El hub en sí está cubierto por `HoroscopeHub.test.tsx`; acá interesa qué le pasa la ruta.
const mockHub = vi.fn();
vi.mock('@/components/features/horoscope/HoroscopeHub', () => ({
  HoroscopeHub: (props: { daily?: CanonicalDailyHoroscopes }) => {
    mockHub(props);
    return <div data-testid="horoscope-hub">{props.daily?.horoscopes.length ?? 0}</div>;
  },
}));

const DAILY = {
  canonicalDate: '2026-09-12',
  horoscopes: [],
  isShowingPreviousDay: false,
} as CanonicalDailyHoroscopes;

describe('HoroscopoPage (/horoscopo, T-SEO-015)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCanonicalDailyHoroscopes.mockResolvedValue(DAILY);
  });

  it('resuelve los 12 horóscopos del día canónico en el servidor y se los pasa al hub', async () => {
    render(await HoroscopoPage());

    expect(mockGetCanonicalDailyHoroscopes).toHaveBeenCalledTimes(1);
    expect(mockHub).toHaveBeenCalledWith({ daily: DAILY });
    expect(screen.getByTestId('horoscope-hub')).toBeInTheDocument();
  });

  it('si el horóscopo no resolvió, igual renderiza el hub', async () => {
    mockGetCanonicalDailyHoroscopes.mockResolvedValue(undefined);

    render(await HoroscopoPage());

    expect(mockHub).toHaveBeenCalledWith({ daily: undefined });
  });

  it('usa el mismo ISR que la portada y la ficha del signo: el horóscopo cambia a diario', () => {
    expect(revalidate).toBe(3600);
  });
});
