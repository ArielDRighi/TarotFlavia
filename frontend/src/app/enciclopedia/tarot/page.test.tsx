import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import EnciclopediaTarotPage from './page';
import { ArcanaType, type CardSummary } from '@/types/encyclopedia.types';

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

const mockUseCards = vi.fn<
  (filters?: unknown, initialData?: unknown) => { data: CardSummary[]; isLoading: boolean }
>(() => ({ data: [], isLoading: false }));

vi.mock('@/hooks/api/useEncyclopedia', () => ({
  useCards: (filters: unknown, initialData: unknown) => mockUseCards(filters, initialData),
  useMajorArcana: () => ({ data: [], isLoading: false }),
  useCardsBySuit: () => ({ data: [], isLoading: false }),
  useSearchCards: () => ({ data: [], isLoading: false }),
}));

const mockGetCards = vi.fn();

vi.mock('@/lib/api/encyclopedia-api', () => ({
  getCards: () => mockGetCards(),
}));

// ─── Test setup ───────────────────────────────────────────────────────────────

const card: CardSummary = {
  id: 1,
  slug: 'el-loco',
  nameEs: 'El Loco',
  arcanaType: ArcanaType.MAJOR,
  number: 0,
  suit: null,
  thumbnailUrl: '/images/tarot/major/00-the-fool.jpg',
};

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
}

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = createTestQueryClient();
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('EnciclopediaTarotPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseCards.mockReturnValue({ data: [], isLoading: false });
    mockGetCards.mockResolvedValue([card]);
  });

  it('debe renderizar el contenido de la enciclopedia de tarot', async () => {
    renderWithProviders(await EnciclopediaTarotPage());

    expect(screen.getByText('Enciclopedia del Tarot')).toBeInTheDocument();
  });

  it('⚠️ T-SEO-003: resuelve las cartas en el servidor y las siembra en el cliente', async () => {
    renderWithProviders(await EnciclopediaTarotPage());

    expect(mockGetCards).toHaveBeenCalledTimes(1);
    expect(mockUseCards).toHaveBeenCalledWith(undefined, [card]);
  });

  it('⚠️ T-SEO-003: si la API falla, la ruta sigue sirviendo su contenido propio', async () => {
    mockGetCards.mockRejectedValue(new Error('API caída'));

    renderWithProviders(await EnciclopediaTarotPage());

    expect(mockUseCards).toHaveBeenCalledWith(undefined, undefined);
    expect(screen.getByTestId('listing-intro')).toBeInTheDocument();
  });

  it('⚠️ T-SEO-003: renderiza la introducción editorial indexable', async () => {
    renderWithProviders(await EnciclopediaTarotPage());

    expect(
      screen.getByRole('heading', { level: 2, name: 'Las 78 cartas, carta por carta' })
    ).toBeInTheDocument();
  });
});
