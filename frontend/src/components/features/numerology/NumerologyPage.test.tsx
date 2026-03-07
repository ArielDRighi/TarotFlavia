import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { NumerologyPage } from './NumerologyPage';

// Mock useArticleSnippet so EncyclopediaInfoWidget renders with data
const mockUseArticleSnippet = vi.fn();
vi.mock('@/hooks/api/useEncyclopediaArticles', () => ({
  useArticleSnippet: () => mockUseArticleSnippet(),
}));

// Mock hooks
const mockUseAuthStore = vi.fn();
const mockUseCalculateNumerology = vi.fn();
const mockUseMyNumerologyProfile = vi.fn();

vi.mock('@/stores/authStore', () => ({
  useAuthStore: () => mockUseAuthStore(),
}));

vi.mock('@/hooks/api/useNumerology', () => ({
  useCalculateNumerology: () => mockUseCalculateNumerology(),
  useMyNumerologyProfile: () => mockUseMyNumerologyProfile(),
}));

// Mock NumerologyIntro and NumerologyProfile (children components)
vi.mock('@/components/features/numerology', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/components/features/numerology')>();
  return {
    ...actual,
    NumerologyIntro: () => <div data-testid="numerology-intro" />,
    NumerologyProfile: () => <div data-testid="numerology-profile" />,
  };
});

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

describe('NumerologyPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuthStore.mockReturnValue({
      user: null,
      isAuthenticated: false,
    });
    mockUseCalculateNumerology.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    });
    mockUseMyNumerologyProfile.mockReturnValue({
      data: null,
      isLoading: false,
    });
    mockUseArticleSnippet.mockReturnValue({
      data: {
        id: 1,
        slug: 'guia-numerologia',
        nameEs: 'Guía de Numerología',
        snippet: 'Snippet de numerología.',
      },
      isLoading: false,
      error: null,
    });
  });

  it('debe renderizar EncyclopediaInfoWidget con slug="guia-numerologia"', () => {
    renderWithProviders(<NumerologyPage />);

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

    renderWithProviders(<NumerologyPage />);

    // The page should still render without errors
    expect(screen.getByTestId('numerologia-page')).toBeInTheDocument();
  });

  it('debe renderizar el titulo de la pagina', () => {
    renderWithProviders(<NumerologyPage />);

    expect(screen.getByText('Numerología')).toBeInTheDocument();
  });
});
