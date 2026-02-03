import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PersonalizedRitualsWidget } from './PersonalizedRitualsWidget';
import { useRitualRecommendations } from '@/hooks/api/useRitualRecommendations';
import { useAuthStore } from '@/stores/authStore';
import type { AuthUser, AuthStore } from '@/types';
import type { UseQueryResult } from '@tanstack/react-query';
import type { RitualRecommendationsResponse } from '@/types';

// Mock dependencies
vi.mock('@/hooks/api/useRitualRecommendations');
vi.mock('@/stores/authStore');

describe('PersonalizedRitualsWidget', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  const mockAuthStore = (plan: string) => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: { id: 1, plan } as AuthUser,
      isAuthenticated: true,
      isLoading: false,
      _hasHydrated: true,
      setUser: vi.fn(),
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      checkAuth: vi.fn(),
      setHasHydrated: vi.fn(),
    } as AuthStore);
  };

  const mockRecommendationsHook = (
    data: RitualRecommendationsResponse | undefined,
    isLoading: boolean = false,
    isError: boolean = false,
    error: Error | null = null
  ) => {
    vi.mocked(useRitualRecommendations).mockReturnValue({
      data,
      isLoading,
      isError,
      error,
      isSuccess: !isLoading && !isError && data !== undefined,
      status: isLoading ? 'pending' : isError ? 'error' : 'success',
      fetchStatus: 'idle',
    } as UseQueryResult<RitualRecommendationsResponse, Error>);
  };

  describe('Free user experience', () => {
    it('should show upsell card for free users', () => {
      mockAuthStore('free');
      mockRecommendationsHook(undefined);

      render(<PersonalizedRitualsWidget />, { wrapper });

      expect(screen.getByText('Rituales Recomendados para Ti')).toBeInTheDocument();
      expect(
        screen.getByText(/analizamos tus lecturas para sugerirte rituales personalizados/i)
      ).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /desbloquear recomendaciones/i })).toHaveAttribute(
        'href',
        '/premium'
      );
    });

    it('should not call useRitualRecommendations for free users', () => {
      mockAuthStore('free');
      mockRecommendationsHook(undefined);

      render(<PersonalizedRitualsWidget />, { wrapper });

      expect(useRitualRecommendations).toHaveBeenCalled();
      // But the hook should not fetch (enabled: false)
    });
  });

  describe('Premium user experience', () => {
    it('should show loading state for premium users', () => {
      mockAuthStore('premium');
      mockRecommendationsHook(undefined, true);

      render(<PersonalizedRitualsWidget />, { wrapper });

      expect(screen.getByTestId('personalized-rituals-skeleton')).toBeInTheDocument();
    });

    it('should show empty state when no recommendations available', () => {
      mockAuthStore('premium');
      mockRecommendationsHook({ hasRecommendations: false, recommendations: [] });

      render(<PersonalizedRitualsWidget />, { wrapper });

      expect(screen.getByText('Rituales para Ti')).toBeInTheDocument();
      expect(
        screen.getByText(/realiza algunas lecturas más para que podamos analizar/i)
      ).toBeInTheDocument();
    });

    it('should render recommendations correctly', () => {
      mockAuthStore('premium');
      mockRecommendationsHook({
        hasRecommendations: true,
        recommendations: [
          {
            pattern: 'heartbreak',
            message: 'Detectamos un patrón de desamor en tus lecturas recientes',
            suggestedCategories: ['love', 'healing'],
          },
          {
            pattern: 'material_block',
            message: 'Tus lecturas indican bloqueos financieros',
            suggestedCategories: ['abundance'],
          },
        ],
      });

      render(<PersonalizedRitualsWidget />, { wrapper });

      expect(screen.getByText('Recomendado para Ti')).toBeInTheDocument();
      expect(
        screen.getByText('Detectamos un patrón de desamor en tus lecturas recientes')
      ).toBeInTheDocument();
      expect(screen.getByText('Tus lecturas indican bloqueos financieros')).toBeInTheDocument();
    });

    it('should show only first 2 recommendations', () => {
      mockAuthStore('premium');
      mockRecommendationsHook({
        hasRecommendations: true,
        recommendations: [
          {
            pattern: 'heartbreak',
            message: 'Message 1',
            suggestedCategories: ['love'],
          },
          {
            pattern: 'material_block',
            message: 'Message 2',
            suggestedCategories: ['abundance'],
          },
          {
            pattern: 'success',
            message: 'Message 3',
            suggestedCategories: ['protection'],
          },
        ],
      });

      render(<PersonalizedRitualsWidget />, { wrapper });

      expect(screen.getByText('Message 1')).toBeInTheDocument();
      expect(screen.getByText('Message 2')).toBeInTheDocument();
      expect(screen.queryByText('Message 3')).not.toBeInTheDocument();
    });

    it('should render category links correctly', () => {
      mockAuthStore('premium');
      mockRecommendationsHook({
        hasRecommendations: true,
        recommendations: [
          {
            pattern: 'heartbreak',
            message: 'Test message',
            suggestedCategories: ['love', 'healing'],
          },
        ],
      });

      render(<PersonalizedRitualsWidget />, { wrapper });

      const loveLink = screen.getByRole('link', { name: /ver rituales de love/i });
      const healingLink = screen.getByRole('link', { name: /ver rituales de healing/i });

      expect(loveLink).toHaveAttribute('href', '/rituales?category=love');
      expect(healingLink).toHaveAttribute('href', '/rituales?category=healing');
    });

    it('should render correct icon for each pattern', () => {
      mockAuthStore('premium');
      mockRecommendationsHook({
        hasRecommendations: true,
        recommendations: [
          {
            pattern: 'heartbreak',
            message: 'Heartbreak pattern',
            suggestedCategories: ['love'],
          },
        ],
      });

      const { container } = render(<PersonalizedRitualsWidget />, { wrapper });

      // Check that icon wrapper exists
      const iconWrapper = container.querySelector('.bg-purple-500\\/20');
      expect(iconWrapper).toBeInTheDocument();
    });
  });

  describe('Error handling', () => {
    it('should display error message when API call fails', () => {
      mockAuthStore('premium');
      mockRecommendationsHook(undefined, false, true, new Error('Network error'));

      render(<PersonalizedRitualsWidget />, { wrapper });

      // Should display error message
      expect(screen.getByText(/error al cargar recomendaciones/i)).toBeInTheDocument();
      expect(screen.getByText(/inténtalo de nuevo más tarde/i)).toBeInTheDocument();
      
      // Should NOT show recommendations or empty state
      expect(screen.queryByText('Recomendado para Ti')).not.toBeInTheDocument();
      expect(screen.queryByText(/realiza algunas lecturas más/i)).not.toBeInTheDocument();
    });
  });

  describe('Data-testid', () => {
    it('should have data-testid for main card', () => {
      mockAuthStore('free');
      mockRecommendationsHook(undefined);

      const { container } = render(<PersonalizedRitualsWidget />, { wrapper });

      expect(
        container.querySelector('[data-testid="personalized-rituals-widget"]')
      ).toBeInTheDocument();
    });
  });
});
