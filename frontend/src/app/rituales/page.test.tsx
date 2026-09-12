import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

import RitualesRoute from './page';
import type { RitualSummary } from '@/types/ritual.types';

const mockGetRituals = vi.fn();
vi.mock('@/lib/api/rituals-api', () => ({
  getRituals: () => mockGetRituals(),
}));

// La página y la guía tienen sus propios tests; acá interesa qué les pasa la ruta.
const mockRitualsPage = vi.fn();
vi.mock('@/components/features/rituals/RitualsPage', () => ({
  RitualsPage: (props: { initialRituals?: RitualSummary[] }) => {
    mockRitualsPage(props);
    return <div data-testid="rituals-page" />;
  },
}));
vi.mock('@/components/features/rituals/RitualsEditorialGuide', () => ({
  RitualsEditorialGuide: () => <div data-testid="rituals-editorial-guide" />,
}));

const RITUAL = { id: 1, slug: 'ritual-luna-nueva', title: 'Ritual de Luna Nueva' } as RitualSummary;

describe('RitualesRoute (/rituales, T-SEO-015)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetRituals.mockResolvedValue([RITUAL]);
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  it('resuelve los rituales en el servidor, los siembra en la página y renderiza la guía debajo', async () => {
    render(await RitualesRoute());

    expect(mockGetRituals).toHaveBeenCalledTimes(1);
    expect(mockRitualsPage).toHaveBeenCalledWith({ initialRituals: [RITUAL] });
    const page = screen.getByTestId('rituals-page');
    const guide = screen.getByTestId('rituals-editorial-guide');
    expect(page.compareDocumentPosition(guide) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('si la API falla, la ruta igual renderiza la página y la guía', async () => {
    mockGetRituals.mockRejectedValue(new Error('API caída'));

    render(await RitualesRoute());

    expect(mockRitualsPage).toHaveBeenCalledWith({ initialRituals: undefined });
    expect(screen.getByTestId('rituals-editorial-guide')).toBeInTheDocument();
  });
});
