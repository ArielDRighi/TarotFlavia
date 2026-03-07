import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { RitualsPage } from './RitualsPage';

// Mock useArticleSnippet so EncyclopediaInfoWidget renders with data
const mockUseArticleSnippet = vi.fn();
vi.mock('@/hooks/api/useEncyclopediaArticles', () => ({
  useArticleSnippet: () => mockUseArticleSnippet(),
}));

// Mock hooks and stores
const mockUseAuthStore = vi.fn();
const mockUseRituals = vi.fn();
const mockUseFeaturedRituals = vi.fn();
const mockUseRitualCategories = vi.fn();

vi.mock('@/stores/authStore', () => ({
  useAuthStore: () => mockUseAuthStore(),
}));

vi.mock('@/hooks/api/useRituals', () => ({
  useRituals: () => mockUseRituals(),
  useFeaturedRituals: () => mockUseFeaturedRituals(),
  useRitualCategories: () => mockUseRitualCategories(),
}));

// Mock child components
vi.mock('@/components/features/rituals', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/components/features/rituals')>();
  return {
    ...actual,
    RitualGrid: () => <div data-testid="ritual-grid" />,
    RitualCategorySelector: () => <div data-testid="ritual-category-selector" />,
    RitualDifficultyFilter: () => <div data-testid="ritual-difficulty-filter" />,
    RitualsSkeleton: () => <div data-testid="rituals-skeleton" />,
  };
});

vi.mock('@/components/ui/search-bar', () => ({
  SearchBar: () => <div data-testid="search-bar" />,
}));

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  });
}

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = createTestQueryClient();
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('RitualsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: false,
    });
    mockUseRituals.mockReturnValue({
      data: [],
      isLoading: false,
    });
    mockUseFeaturedRituals.mockReturnValue({
      data: [],
      isLoading: false,
    });
    mockUseRitualCategories.mockReturnValue({
      data: [],
    });
    mockUseArticleSnippet.mockReturnValue({
      data: {
        id: 5,
        slug: 'guide-ritual',
        nameEs: 'Guía de Rituales',
        snippet: 'Snippet de rituales.',
      },
      isLoading: false,
      error: null,
    });
  });

  it('debe renderizar EncyclopediaInfoWidget con slug="guide-ritual"', () => {
    renderWithProviders(<RitualsPage />);

    const widget = screen.getByTestId('encyclopedia-info-widget');
    expect(widget).toBeInTheDocument();
  });

  it('debe renderizar correctamente si EncyclopediaInfoWidget retorna null', () => {
    // Simulate widget returning null (error state)
    mockUseArticleSnippet.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('API error'),
    });

    renderWithProviders(<RitualsPage />);

    // The page should still render without errors
    expect(screen.getByText('Rituales')).toBeInTheDocument();
  });

  it('debe renderizar el titulo de la pagina', () => {
    renderWithProviders(<RitualsPage />);

    expect(screen.getByText('Rituales')).toBeInTheDocument();
  });
});
