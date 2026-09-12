import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';

import Page, { revalidate } from './page';
import type { EditorialHomeData } from '@/types/home.types';

/**
 * Ruta `/` (T-SEO-014).
 *
 * Es un server component sin lógica: resuelve los datos de la portada con
 * `getEditorialHomeData`, renderiza `EditorialHome` y la pasa como `children`
 * a `HomePageContent`. Lo que se verifica
 * acá es ese cableado y el ISR, no el contenido (que tiene sus propios tests).
 */

const mockGetEditorialHomeData = vi.fn<() => Promise<EditorialHomeData>>();

vi.mock('@/lib/api/home-server', () => ({
  getEditorialHomeData: () => mockGetEditorialHomeData(),
}));

vi.mock('@/components/features/home/HomePageContent', () => ({
  HomePageContent: ({ children }: { children: ReactNode }) => (
    <div data-testid="home-page-content">{children}</div>
  ),
}));

vi.mock('@/components/features/home/EditorialHome', () => ({
  EditorialHome: ({ data }: { data: EditorialHomeData }) => (
    <div data-testid="editorial-home">
      {data.dailyHoroscopes ? 'horóscopo servido' : 'sin horóscopo'}
    </div>
  ),
}));

const DATA: EditorialHomeData = {
  dailyHoroscopes: { canonicalDate: '2026-09-12', horoscopes: [], isShowingPreviousDay: false },
  dailyCard: undefined,
  latestGuides: undefined,
};

describe('Home Page (/)', () => {
  beforeEach(() => {
    mockGetEditorialHomeData.mockReset().mockResolvedValue(DATA);
  });

  it('resuelve los datos en el servidor y renderiza EditorialHome como children de HomePageContent', async () => {
    render(await Page());

    expect(mockGetEditorialHomeData).toHaveBeenCalledTimes(1);
    const content = screen.getByTestId('home-page-content');
    expect(content).toContainElement(screen.getByTestId('editorial-home'));
    expect(content).toHaveTextContent('horóscopo servido');
  });

  it('⚠️ T-SEO-014: ISR de una hora, igual que la ficha del signo', () => {
    // El horóscopo y la carta cambian una vez por día y el cron puede atrasarse:
    // la home no puede quedar estática hasta el próximo deploy.
    expect(revalidate).toBe(3600);
  });
});
