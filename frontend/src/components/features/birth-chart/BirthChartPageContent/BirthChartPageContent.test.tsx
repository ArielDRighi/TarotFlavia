import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { BirthChartPageContent } from './BirthChartPageContent';

// Mock useArticleSnippet so EncyclopediaInfoWidget renders with data
const mockUseArticleSnippet = vi.fn();
vi.mock('@/hooks/api/useEncyclopediaArticles', () => ({
  useArticleSnippet: () => mockUseArticleSnippet(),
}));

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
}));

// Mock hooks
const mockUseAuth = vi.fn();
const mockUseCanGenerateChart = vi.fn();
const mockUseGenerateChart = vi.fn();
const mockUseGenerateChartAnonymous = vi.fn();
const mockUseBirthChartStore = vi.fn();

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('@/hooks/api/useBirthChart', () => ({
  useGenerateChart: () => mockUseGenerateChart(),
  useGenerateChartAnonymous: () => mockUseGenerateChartAnonymous(),
  useCanGenerateChart: () => mockUseCanGenerateChart(),
}));

vi.mock('@/stores/birthChartStore', () => ({
  useBirthChartStore: () => mockUseBirthChartStore(),
}));

// Mock BirthDataForm
vi.mock('@/components/features/birth-chart/BirthDataForm/BirthDataForm', () => ({
  BirthDataForm: () => <form data-testid="birth-data-form" />,
}));

// Mock BirthChartLoading
vi.mock('@/components/features/birth-chart/BirthChartLoading', () => ({
  BirthChartLoading: () => <div data-testid="birth-chart-loading" />,
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

describe('BirthChartPageContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
    });
    mockUseCanGenerateChart.mockReturnValue({
      canGenerate: true,
      remaining: 1,
      isLoading: false,
      message: null,
    });
    mockUseGenerateChart.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    });
    mockUseGenerateChartAnonymous.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    });
    mockUseBirthChartStore.mockReturnValue({
      setChartResult: vi.fn(),
      setFormData: vi.fn(),
    });
    mockUseArticleSnippet.mockReturnValue({
      data: {
        id: 6,
        slug: 'guia-carta-astral',
        nameEs: 'Guía de Carta Astral',
        snippet: 'Snippet de carta astral.',
      },
      isLoading: false,
      error: null,
    });
  });

  it('debe renderizar EncyclopediaInfoWidget con slug="guia-carta-astral"', () => {
    renderWithProviders(<BirthChartPageContent />);

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

    renderWithProviders(<BirthChartPageContent />);

    // The page should still render without errors
    expect(screen.getByText('Carta Astral')).toBeInTheDocument();
  });

  it('debe renderizar el titulo de la pagina', () => {
    renderWithProviders(<BirthChartPageContent />);

    expect(screen.getByText('Carta Astral')).toBeInTheDocument();
  });
});
