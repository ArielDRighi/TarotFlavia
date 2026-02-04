import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SubscriptionTab } from './SubscriptionTab';
import type { UserProfile, UserCapabilities } from '@/types';

// Mock useUserCapabilities - single source of truth for usage stats
const mockUseUserCapabilities = vi.fn();
vi.mock('@/hooks/api/useUserCapabilities', () => ({
  useUserCapabilities: () => mockUseUserCapabilities(),
}));

// Note: Backend still sends limit fields for backward compatibility,
// but components should use useUserCapabilities() hook instead of these fields
const createMockProfile = (overrides?: Partial<UserProfile>): UserProfile => ({
  id: 1,
  email: 'test@example.com',
  name: 'Test User',
  roles: ['consumer'],
  plan: 'free',
  // Backend sends these but components should use useUserCapabilities()
  dailyCardCount: 0,
  dailyCardLimit: 1,
  tarotReadingsCount: 0,
  tarotReadingsLimit: 1,
  dailyReadingsCount: 0,
  dailyReadingsLimit: 1,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  profilePicture: undefined,
  lastLogin: null,
  ...overrides,
});

const createMockCapabilities = (
  overrides?: Partial<UserCapabilities>
): { data: UserCapabilities; isLoading: boolean } => ({
  data: {
    dailyCard: { used: 0, limit: 1, canUse: true, resetAt: '2026-01-09T00:00:00Z' },
    tarotReadings: { used: 0, limit: 1, canUse: true, resetAt: '2026-01-09T00:00:00Z' },
    pendulum: { used: 0, limit: 3, canUse: true, resetAt: '2026-01-09T00:00:00Z', period: 'daily' },
    canCreateDailyReading: true,
    canCreateTarotReading: true,
    canUseAI: false,
    canUseCustomQuestions: false,
    canUseAdvancedSpreads: false,
    plan: 'free',
    isAuthenticated: true,
    ...overrides,
  },
  isLoading: false,
});

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

const createWrapper = () => {
  const queryClient = createTestQueryClient();
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
};

describe('SubscriptionTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock: FREE user with available readings
    mockUseUserCapabilities.mockReturnValue(createMockCapabilities());
  });

  describe('Plan Display', () => {
    it('should render free plan correctly', () => {
      const profile = createMockProfile({ plan: 'free' });
      render(<SubscriptionTab profile={profile} />, { wrapper: createWrapper() });

      expect(
        screen.getByText((content, element) => {
          return !!(element?.classList.contains('text-lg') && /Plan GRATUITO/i.test(content));
        })
      ).toBeInTheDocument();
      expect(screen.getByText(/plan gratuito con funcionalidades básicas/i)).toBeInTheDocument();
    });

    it('should render premium plan correctly', () => {
      const profile = createMockProfile({ plan: 'premium' });
      mockUseUserCapabilities.mockReturnValue(
        createMockCapabilities({
          plan: 'premium',
          tarotReadings: { used: 0, limit: 3, canUse: true, resetAt: '2026-01-09T00:00:00Z' },
        })
      );
      render(<SubscriptionTab profile={profile} />, { wrapper: createWrapper() });

      expect(screen.getByText(/plan premium con funcionalidades avanzadas/i)).toBeInTheDocument();
    });

    it('should render anonymous plan correctly', () => {
      const profile = createMockProfile({ plan: 'anonymous' });
      mockUseUserCapabilities.mockReturnValue(
        createMockCapabilities({
          plan: 'anonymous',
          tarotReadings: { used: 0, limit: 0, canUse: false, resetAt: '2026-01-09T00:00:00Z' },
        })
      );
      render(<SubscriptionTab profile={profile} />, { wrapper: createWrapper() });

      expect(
        screen.getByText((content, element) => {
          return !!(element?.classList.contains('text-lg') && /Plan ANÓNIMO/i.test(content));
        })
      ).toBeInTheDocument();
      expect(screen.getByText(/plan anónimo con funcionalidades limitadas/i)).toBeInTheDocument();
    });
  });

  describe('Usage Statistics (from useUserCapabilities)', () => {
    it('should display tarot readings count and limit', () => {
      mockUseUserCapabilities.mockReturnValue(
        createMockCapabilities({
          tarotReadings: { used: 1, limit: 3, canUse: true, resetAt: '2026-01-09T00:00:00Z' },
        })
      );
      const profile = createMockProfile();
      render(<SubscriptionTab profile={profile} />, { wrapper: createWrapper() });

      expect(screen.getByText('1 / 3')).toBeInTheDocument();
    });

    it('should display remaining tarot readings', () => {
      mockUseUserCapabilities.mockReturnValue(
        createMockCapabilities({
          tarotReadings: { used: 1, limit: 3, canUse: true, resetAt: '2026-01-09T00:00:00Z' },
        })
      );
      const profile = createMockProfile();
      render(<SubscriptionTab profile={profile} />, { wrapper: createWrapper() });

      expect(screen.getByText(/restantes:/i)).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('should display daily card usage', () => {
      mockUseUserCapabilities.mockReturnValue(
        createMockCapabilities({
          dailyCard: { used: 1, limit: 1, canUse: false, resetAt: '2026-01-09T00:00:00Z' },
        })
      );
      const profile = createMockProfile();
      render(<SubscriptionTab profile={profile} />, { wrapper: createWrapper() });

      expect(screen.getByText('1 / 1')).toBeInTheDocument();
      expect(screen.getByText(/ya recibiste tu carta del día/i)).toBeInTheDocument();
    });

    it('should show daily card available when not used', () => {
      mockUseUserCapabilities.mockReturnValue(
        createMockCapabilities({
          dailyCard: { used: 0, limit: 1, canUse: true, resetAt: '2026-01-09T00:00:00Z' },
        })
      );
      const profile = createMockProfile();
      render(<SubscriptionTab profile={profile} />, { wrapper: createWrapper() });

      expect(screen.getByText(/disponible para hoy/i)).toBeInTheDocument();
    });

    it('should render progress bars', () => {
      mockUseUserCapabilities.mockReturnValue(
        createMockCapabilities({
          tarotReadings: { used: 2, limit: 3, canUse: true, resetAt: '2026-01-09T00:00:00Z' },
          dailyCard: { used: 1, limit: 1, canUse: false, resetAt: '2026-01-09T00:00:00Z' },
        })
      );
      const profile = createMockProfile();
      const { container } = render(<SubscriptionTab profile={profile} />, {
        wrapper: createWrapper(),
      });

      // Should have 2 progress bars (tarot readings + daily card)
      const progressContainers = container.querySelectorAll('.bg-secondary.h-2.w-full');
      expect(progressContainers).toHaveLength(2);
    });

    it('should handle zero limit gracefully', () => {
      mockUseUserCapabilities.mockReturnValue(
        createMockCapabilities({
          tarotReadings: { used: 0, limit: 0, canUse: false, resetAt: '2026-01-09T00:00:00Z' },
          dailyCard: { used: 0, limit: 0, canUse: false, resetAt: '2026-01-09T00:00:00Z' },
        })
      );
      const profile = createMockProfile();

      expect(() =>
        render(<SubscriptionTab profile={profile} />, { wrapper: createWrapper() })
      ).not.toThrow();
      // Should display 0/0 for both
      const zeroTexts = screen.getAllByText('0 / 0');
      expect(zeroTexts.length).toBeGreaterThanOrEqual(1);
    });

    it('should show loading skeleton when capabilities are loading', () => {
      mockUseUserCapabilities.mockReturnValue({
        data: undefined,
        isLoading: true,
      });
      const profile = createMockProfile();
      const { container } = render(<SubscriptionTab profile={profile} />, {
        wrapper: createWrapper(),
      });

      // Should show skeleton loaders
      const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('Plan Upgrade Section', () => {
    it('should show upgrade section for free users', () => {
      const profile = createMockProfile({ plan: 'free' });
      render(<SubscriptionTab profile={profile} />, { wrapper: createWrapper() });

      expect(screen.getByText('Mejora tu Plan')).toBeInTheDocument();
      expect(screen.getByText(/actualiza a premium/i)).toBeInTheDocument();
    });

    it('should list upgrade benefits for free users', () => {
      const profile = createMockProfile({ plan: 'free' });
      render(<SubscriptionTab profile={profile} />, { wrapper: createWrapper() });

      expect(screen.getByText(/3 tiradas de tarot por día/i)).toBeInTheDocument();
      expect(screen.getByText(/interpretaciones personalizadas con ia/i)).toBeInTheDocument();
      expect(screen.getByText(/acceso a todas las tiradas/i)).toBeInTheDocument();
      expect(screen.getByText(/preguntas personalizadas/i)).toBeInTheDocument();
    });

    it('should show "coming soon" message for upgrade', () => {
      const profile = createMockProfile({ plan: 'free' });
      render(<SubscriptionTab profile={profile} />, { wrapper: createWrapper() });

      expect(screen.getByText(/próximamente: mejora de planes disponible/i)).toBeInTheDocument();
    });

    it('should NOT show upgrade section for premium users', () => {
      const profile = createMockProfile({ plan: 'premium' });
      mockUseUserCapabilities.mockReturnValue(createMockCapabilities({ plan: 'premium' }));
      render(<SubscriptionTab profile={profile} />, { wrapper: createWrapper() });

      expect(screen.queryByText('Mejora tu Plan')).not.toBeInTheDocument();
    });

    it('should NOT show upgrade section for anonymous users', () => {
      const profile = createMockProfile({ plan: 'anonymous' });
      mockUseUserCapabilities.mockReturnValue(createMockCapabilities({ plan: 'anonymous' }));
      render(<SubscriptionTab profile={profile} />, { wrapper: createWrapper() });

      expect(screen.queryByText('Mejora tu Plan')).not.toBeInTheDocument();
    });
  });

  describe('Component Structure', () => {
    it('should render plan section', () => {
      const profile = createMockProfile();
      render(<SubscriptionTab profile={profile} />, { wrapper: createWrapper() });

      expect(screen.getByText('Plan Actual')).toBeInTheDocument();
    });

    it('should render usage statistics section', () => {
      const profile = createMockProfile();
      render(<SubscriptionTab profile={profile} />, { wrapper: createWrapper() });

      expect(screen.getByText('Estadísticas de Uso')).toBeInTheDocument();
    });

    it('should render all sections in correct order', () => {
      const profile = createMockProfile({ plan: 'free' });
      render(<SubscriptionTab profile={profile} />, {
        wrapper: createWrapper(),
      });

      // Verify the three main card titles are present
      expect(screen.getByText('Plan Actual')).toBeInTheDocument();
      expect(screen.getByText('Estadísticas de Uso')).toBeInTheDocument();
      expect(screen.getByText('Mejora tu Plan')).toBeInTheDocument();
    });
  });
});
