import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { PendulumConsultation } from './PendulumConsultation';

// Mock useArticleSnippet so EncyclopediaInfoWidget renders with data
const mockUseArticleSnippet = vi.fn();
vi.mock('@/hooks/api/useEncyclopediaArticles', () => ({
  useArticleSnippet: () => mockUseArticleSnippet(),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
}));

// Mock hooks and stores
const mockUseAuthStore = vi.fn();
const mockUsePendulumCapabilities = vi.fn();
const mockUsePendulumQuery = vi.fn();

vi.mock('@/stores/authStore', () => ({
  useAuthStore: () => mockUseAuthStore(),
}));

vi.mock('@/hooks/api/usePendulum', () => ({
  usePendulumCapabilities: () => mockUsePendulumCapabilities(),
  usePendulumQuery: () => mockUsePendulumQuery(),
}));

// Mock pendulum child components
vi.mock('@/components/features/pendulum', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/components/features/pendulum')>();
  return {
    ...actual,
    Pendulum: () => <div data-testid="pendulum-animation" />,
    PendulumDisclaimer: () => null,
    PendulumLimitBanner: () => <div data-testid="pendulum-limit-banner" />,
    PendulumResponseDisplay: () => null,
    PendulumBlockedContent: () => null,
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

describe('PendulumConsultation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuthStore.mockReturnValue({
      user: null,
      isAuthenticated: false,
    });
    mockUsePendulumCapabilities.mockReturnValue({
      canUse: true,
    });
    mockUsePendulumQuery.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });
    mockUseArticleSnippet.mockReturnValue({
      data: {
        id: 2,
        slug: 'guide-pendulum',
        nameEs: 'Guía del Péndulo',
        snippet: 'Snippet del péndulo.',
      },
      isLoading: false,
      error: null,
    });
  });

  it('debe renderizar EncyclopediaInfoWidget con slug="guide-pendulum"', () => {
    renderWithProviders(<PendulumConsultation />);

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

    renderWithProviders(<PendulumConsultation />);

    // The page should still render without errors
    expect(screen.getByText('Péndulo Digital')).toBeInTheDocument();
  });

  it('debe renderizar el titulo de la pagina', () => {
    renderWithProviders(<PendulumConsultation />);

    expect(screen.getByText('Péndulo Digital')).toBeInTheDocument();
  });
});
