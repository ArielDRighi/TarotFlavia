import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import CardDetailPage from './page';
import { ArcanaType } from '@/types/encyclopedia.types';
import type { CardDetail } from '@/types/encyclopedia.types';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockParams = { slug: 'el-loco' };

vi.mock('next/navigation', () => ({
  useParams: () => mockParams,
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

const mockUseCard = vi.fn();
const mockUseRelatedCards = vi.fn();
const mockUseCardNavigation = vi.fn();

vi.mock('@/hooks/api/useEncyclopedia', () => ({
  useCard: (slug: string) => mockUseCard(slug),
  useRelatedCards: (slug: string) => mockUseRelatedCards(slug),
  useCardNavigation: (slug: string) => mockUseCardNavigation(slug),
}));

// ─── Mock data ────────────────────────────────────────────────────────────────

const mockCardDetail: CardDetail = {
  id: 1,
  slug: 'el-loco',
  nameEs: 'El Loco',
  nameEn: 'The Fool',
  arcanaType: ArcanaType.MAJOR,
  number: 0,
  romanNumeral: '0',
  courtRank: null,
  suit: null,
  element: null,
  planet: null,
  zodiacSign: null,
  thumbnailUrl: '/img/el-loco-thumb.jpg',
  imageUrl: '/img/el-loco.jpg',
  meaningUpright: 'Nuevos comienzos, inocencia, espontaneidad.',
  meaningReversed: 'Imprudencia, falta de dirección.',
  description: 'El Loco representa el comienzo de un viaje.',
  keywords: {
    upright: ['libertad', 'aventura'],
    reversed: ['imprudencia', 'caos'],
  },
  relatedCards: [2, 3],
};

// ─── Test setup ───────────────────────────────────────────────────────────────

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
}

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = createTestQueryClient();
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

function setupSubComponentMocks() {
  mockUseRelatedCards.mockReturnValue({ data: [], isLoading: false });
  mockUseCardNavigation.mockReturnValue({ data: null, isLoading: false });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('CardDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockParams.slug = 'el-loco';
    setupSubComponentMocks();
  });

  it('should render card detail when data is loaded', () => {
    mockUseCard.mockReturnValue({ data: mockCardDetail, isLoading: false, error: null });

    renderWithProviders(<CardDetailPage />);

    expect(screen.getByTestId('card-detail-view')).toBeInTheDocument();
    expect(screen.getByText('El Loco')).toBeInTheDocument();
  });

  it('should pass slug to useCard hook', () => {
    mockUseCard.mockReturnValue({ data: mockCardDetail, isLoading: false, error: null });

    renderWithProviders(<CardDetailPage />);

    expect(mockUseCard).toHaveBeenCalledWith('el-loco');
  });

  it('should render loading skeleton when card is loading', () => {
    mockUseCard.mockReturnValue({ data: undefined, isLoading: true, error: null });

    renderWithProviders(<CardDetailPage />);

    expect(screen.getByTestId('encyclopedia-skeleton')).toBeInTheDocument();
  });

  it('should render 404 message when card is not found (error)', () => {
    mockUseCard.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Not found'),
    });

    renderWithProviders(<CardDetailPage />);

    expect(screen.getByText('Carta no encontrada')).toBeInTheDocument();
    expect(screen.getByText('La carta que buscas no existe o fue eliminada.')).toBeInTheDocument();
  });

  it('should render 404 message when card data is null', () => {
    mockUseCard.mockReturnValue({ data: null, isLoading: false, error: null });

    renderWithProviders(<CardDetailPage />);

    expect(screen.getByText('Carta no encontrada')).toBeInTheDocument();
  });

  it('should render link back to encyclopedia on 404', () => {
    mockUseCard.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Not found'),
    });

    renderWithProviders(<CardDetailPage />);

    expect(screen.getByRole('link', { name: /ver todas las cartas/i })).toHaveAttribute(
      'href',
      '/enciclopedia'
    );
  });

  it('should render card description when available', () => {
    mockUseCard.mockReturnValue({ data: mockCardDetail, isLoading: false, error: null });

    renderWithProviders(<CardDetailPage />);

    expect(screen.getByText('El Loco representa el comienzo de un viaje.')).toBeInTheDocument();
  });
});
