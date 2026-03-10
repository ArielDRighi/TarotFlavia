import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { NumerologyPage } from './NumerologyPage';

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
  });

  it('debe renderizar NumerologyIntro (que incluye link a enciclopedia)', () => {
    renderWithProviders(<NumerologyPage />);

    expect(screen.getByTestId('numerology-intro')).toBeInTheDocument();
  });

  it('debe renderizar correctamente la página sin errores', () => {
    renderWithProviders(<NumerologyPage />);

    expect(screen.getByTestId('numerologia-page')).toBeInTheDocument();
  });

  it('debe renderizar el titulo de la pagina', () => {
    renderWithProviders(<NumerologyPage />);

    expect(screen.getByText('Numerología')).toBeInTheDocument();
  });
});
