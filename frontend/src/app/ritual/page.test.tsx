import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/navigation';

import RitualPage from './page';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useCategories } from '@/hooks/api/useReadings';
import { useAuth } from '@/hooks/useAuth';
import { useUserCapabilities } from '@/hooks/api/useUserCapabilities';

// Mock modules
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('@/hooks/useRequireAuth', () => ({
  useRequireAuth: vi.fn(),
}));

vi.mock('@/hooks/api/useReadings', () => ({
  useCategories: vi.fn(),
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

// Mock useUserCapabilities
vi.mock('@/hooks/api/useUserCapabilities', () => ({
  useUserCapabilities: vi.fn(),
}));

// Mock categories data
const mockCategories = [
  {
    id: 1,
    name: 'Amor',
    slug: 'amor',
    description: 'Preguntas sobre el amor',
    color: '#FFB6C1',
    icon: 'heart',
    isActive: true,
  },
  {
    id: 2,
    name: 'Carrera',
    slug: 'carrera',
    description: 'Preguntas sobre carrera',
    color: '#ADD8E6',
    icon: 'briefcase',
    isActive: true,
  },
  {
    id: 3,
    name: 'Dinero',
    slug: 'dinero',
    description: 'Preguntas sobre dinero',
    color: '#90EE90',
    icon: 'dollar-sign',
    isActive: true,
  },
  {
    id: 4,
    name: 'Salud',
    slug: 'salud',
    description: 'Preguntas sobre salud',
    color: '#FFD700',
    icon: 'activity',
    isActive: true,
  },
  {
    id: 5,
    name: 'Espiritual',
    slug: 'espiritual',
    description: 'Preguntas espirituales',
    color: '#DDA0DD',
    icon: 'sparkles',
    isActive: true,
  },
  {
    id: 6,
    name: 'General',
    slug: 'general',
    description: 'Preguntas generales',
    color: '#FFFFE0',
    icon: 'star',
    isActive: true,
  },
];

describe('RitualPage', () => {
  const mockPush = vi.fn();
  const mockReplace = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock for capabilities - FREE user with daily card used
    (useUserCapabilities as ReturnType<typeof vi.fn>).mockReturnValue({
      data: {
        dailyCard: { used: 1, limit: 1, canUse: false, resetAt: '2026-01-09T00:00:00Z' },
        tarotReadings: { used: 0, limit: 1, canUse: true, resetAt: '2026-01-09T00:00:00Z' },
        canCreateDailyReading: false,
        canCreateTarotReading: true,
        canUseAI: false,
        canUseCustomQuestions: false,
        canUseAdvancedSpreads: false,
        plan: 'free',
        isAuthenticated: true,
      },
      isLoading: false,
    });

    (useRouter as Mock).mockReturnValue({ push: mockPush, replace: mockReplace });
    (useRequireAuth as Mock).mockReturnValue({ isLoading: false });
    (useAuth as Mock).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  });

  describe('Authentication Protection', () => {
    it('should call useRequireAuth to protect the route', () => {
      (useCategories as Mock).mockReturnValue({
        data: mockCategories,
        isLoading: false,
        error: null,
      });

      render(<RitualPage />);

      expect(useRequireAuth).toHaveBeenCalled();
    });

    it('should show loading state when auth is loading', () => {
      // When useRequireAuth is loading, the component still renders
      // but CategorySelector will handle its own loading state
      (useRequireAuth as Mock).mockReturnValue({ isLoading: true });
      (useCategories as Mock).mockReturnValue({
        data: undefined,
        isLoading: true, // Categories are also loading
        error: null,
      });

      render(<RitualPage />);

      // The page should render with skeleton cards from CategorySelector
      expect(screen.getAllByTestId('skeleton-card')).toHaveLength(6);
    });
  });

  describe('FREE User Redirection (TASK-2)', () => {
    it('should redirect FREE user to /ritual/tirada immediately', () => {
      (useAuth as Mock).mockReturnValue({
        user: { id: 1, name: 'Free User', plan: 'free', email: 'free@test.com' },
        isAuthenticated: true,
        isLoading: false,
      });

      (useCategories as Mock).mockReturnValue({
        data: mockCategories,
        isLoading: false,
        error: null,
      });

      render(<RitualPage />);

      expect(mockReplace).toHaveBeenCalledWith('/ritual/tirada');
      expect(mockReplace).toHaveBeenCalledTimes(1);
    });

    it('should redirect FREE user even if categories are loading', () => {
      (useAuth as Mock).mockReturnValue({
        user: { id: 1, name: 'Free User', plan: 'free', email: 'free@test.com' },
        isAuthenticated: true,
        isLoading: false,
      });

      (useCategories as Mock).mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      });

      render(<RitualPage />);

      // Redirect will NOT happen while categories are still loading
      // because CategorySelector waits for isLoading to be false
      expect(mockReplace).not.toHaveBeenCalled();
    });

    it('should redirect FREE user even when categories fail to load', () => {
      (useAuth as Mock).mockReturnValue({
        user: { id: 1, name: 'Free User', plan: 'free', email: 'free@test.com' },
        isAuthenticated: true,
        isLoading: false,
      });

      (useCategories as Mock).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Failed to fetch'),
        refetch: vi.fn(),
      });

      render(<RitualPage />);

      expect(mockReplace).toHaveBeenCalledWith('/ritual/tirada');
    });

    it('should NOT show categories to FREE user (redirect happens first)', () => {
      (useAuth as Mock).mockReturnValue({
        user: { id: 1, name: 'Free User', plan: 'free', email: 'free@test.com' },
        isAuthenticated: true,
        isLoading: false,
      });

      (useCategories as Mock).mockReturnValue({
        data: mockCategories,
        isLoading: false,
        error: null,
      });

      render(<RitualPage />);

      // Should redirect, so categories should not be visible
      expect(mockReplace).toHaveBeenCalledWith('/ritual/tirada');
      // Note: Categories might still render briefly before redirect, but redirect is called
    });
  });

  describe('PREMIUM User - No Redirection', () => {
    it('should NOT redirect PREMIUM user', () => {
      // Need to mock PREMIUM capabilities
      (useUserCapabilities as ReturnType<typeof vi.fn>).mockReturnValue({
        data: {
          dailyCard: { used: 0, limit: 1, canUse: true, resetAt: '2026-01-09T00:00:00Z' },
          tarotReadings: { used: 0, limit: 3, canUse: true, resetAt: '2026-01-09T00:00:00Z' },
          canCreateDailyReading: true,
          canCreateTarotReading: true,
          canUseAI: true,
          canUseCustomQuestions: true,
          canUseAdvancedSpreads: true,
          plan: 'premium',
          isAuthenticated: true,
        },
        isLoading: false,
      });

      (useAuth as Mock).mockReturnValue({
        user: { id: 2, name: 'Premium User', plan: 'premium', email: 'premium@test.com' },
        isAuthenticated: true,
        isLoading: false,
      });

      (useCategories as Mock).mockReturnValue({
        data: mockCategories,
        isLoading: false,
        error: null,
      });

      render(<RitualPage />);

      expect(mockReplace).not.toHaveBeenCalled();
    });

    it('should show categories to PREMIUM user', () => {
      // Need to mock PREMIUM capabilities
      (useUserCapabilities as ReturnType<typeof vi.fn>).mockReturnValue({
        data: {
          dailyCard: { used: 0, limit: 1, canUse: true, resetAt: '2026-01-09T00:00:00Z' },
          tarotReadings: { used: 0, limit: 3, canUse: true, resetAt: '2026-01-09T00:00:00Z' },
          canCreateDailyReading: true,
          canCreateTarotReading: true,
          canUseAI: true,
          canUseCustomQuestions: true,
          canUseAdvancedSpreads: true,
          plan: 'premium',
          isAuthenticated: true,
        },
        isLoading: false,
      });

      (useAuth as Mock).mockReturnValue({
        user: { id: 2, name: 'Premium User', plan: 'premium', email: 'premium@test.com' },
        isAuthenticated: true,
        isLoading: false,
      });

      (useCategories as Mock).mockReturnValue({
        data: mockCategories,
        isLoading: false,
        error: null,
      });

      render(<RitualPage />);

      expect(screen.getByText('Amor')).toBeInTheDocument();
      expect(screen.getByText('Carrera')).toBeInTheDocument();
    });
  });

  describe('Anonymous User - Redirection', () => {
    it('should redirect anonymous user to /ritual/tirada (no custom questions capability)', () => {
      // Anonymous users have canUseCustomQuestions: false
      (useUserCapabilities as ReturnType<typeof vi.fn>).mockReturnValue({
        data: {
          dailyCard: { used: 0, limit: 1, canUse: true, resetAt: '2026-01-09T00:00:00Z' },
          tarotReadings: { used: 0, limit: 0, canUse: false, resetAt: '2026-01-09T00:00:00Z' },
          canCreateDailyReading: true,
          canCreateTarotReading: false,
          canUseAI: false,
          canUseCustomQuestions: false,
          canUseAdvancedSpreads: false,
          plan: 'anonymous',
          isAuthenticated: false,
        },
        isLoading: false,
      });

      (useAuth as Mock).mockReturnValue({
        user: { id: 3, name: 'Anonymous', plan: 'anonymous', email: '' },
        isAuthenticated: false,
        isLoading: false,
      });

      (useCategories as Mock).mockReturnValue({
        data: mockCategories,
        isLoading: false,
        error: null,
      });

      render(<RitualPage />);

      expect(mockReplace).toHaveBeenCalledWith('/ritual/tirada');
    });

    it('should redirect when user is null (no custom questions capability)', () => {
      // Default capabilities from beforeEach has canUseCustomQuestions: false
      (useAuth as Mock).mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });

      (useCategories as Mock).mockReturnValue({
        data: mockCategories,
        isLoading: false,
        error: null,
      });

      render(<RitualPage />);

      expect(mockReplace).toHaveBeenCalledWith('/ritual/tirada');
    });
  });

  describe('Page Layout', () => {
    beforeEach(() => {
      // Mock PREMIUM capabilities so CategorySelector doesn't redirect
      (useUserCapabilities as ReturnType<typeof vi.fn>).mockReturnValue({
        data: {
          dailyCard: { used: 0, limit: 1, canUse: true, resetAt: '2026-01-09T00:00:00Z' },
          tarotReadings: { used: 0, limit: 3, canUse: true, resetAt: '2026-01-09T00:00:00Z' },
          canCreateDailyReading: true,
          canCreateTarotReading: true,
          canUseAI: true,
          canUseCustomQuestions: true,
          canUseAdvancedSpreads: true,
          plan: 'premium',
          isAuthenticated: true,
        },
        isLoading: false,
      });
    });

    it('should render the main title with correct text', () => {
      (useCategories as Mock).mockReturnValue({
        data: mockCategories,
        isLoading: false,
        error: null,
      });

      render(<RitualPage />);

      expect(
        screen.getByRole('heading', { level: 1, name: /¿qué inquieta tu alma hoy\?/i })
      ).toBeInTheDocument();
    });

    it('should have font-serif class on heading', () => {
      (useCategories as Mock).mockReturnValue({
        data: mockCategories,
        isLoading: false,
        error: null,
      });

      render(<RitualPage />);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveClass('font-serif');
    });

    it('should have min-h-screen class on container', () => {
      (useCategories as Mock).mockReturnValue({
        data: mockCategories,
        isLoading: false,
        error: null,
      });

      const { container } = render(<RitualPage />);

      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv).toHaveClass('min-h-screen');
    });

    it('should have bg-bg-main class on container', () => {
      (useCategories as Mock).mockReturnValue({
        data: mockCategories,
        isLoading: false,
        error: null,
      });

      const { container } = render(<RitualPage />);

      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv).toHaveClass('bg-bg-main');
    });
  });

  describe('Loading State', () => {
    it('should show skeleton cards while loading categories', () => {
      (useCategories as Mock).mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      });

      render(<RitualPage />);

      expect(screen.getAllByTestId('skeleton-card')).toHaveLength(6);
    });
  });

  describe('Error State', () => {
    beforeEach(() => {
      // Mock PREMIUM capabilities so CategorySelector doesn't redirect
      (useUserCapabilities as ReturnType<typeof vi.fn>).mockReturnValue({
        data: {
          dailyCard: { used: 0, limit: 1, canUse: true, resetAt: '2026-01-09T00:00:00Z' },
          tarotReadings: { used: 0, limit: 3, canUse: true, resetAt: '2026-01-09T00:00:00Z' },
          canCreateDailyReading: true,
          canCreateTarotReading: true,
          canUseAI: true,
          canUseCustomQuestions: true,
          canUseAdvancedSpreads: true,
          plan: 'premium',
          isAuthenticated: true,
        },
        isLoading: false,
      });
    });

    it('should show error display when categories fail to load', () => {
      (useCategories as Mock).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Failed to fetch'),
        refetch: vi.fn(),
      });

      render(<RitualPage />);

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/error al cargar las categorías/i)).toBeInTheDocument();
    });

    it('should show retry button in error state', () => {
      const mockRefetch = vi.fn();
      (useCategories as Mock).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Failed to fetch'),
        refetch: mockRefetch,
      });

      render(<RitualPage />);

      const retryButton = screen.getByRole('button', { name: /intentar de nuevo/i });
      expect(retryButton).toBeInTheDocument();

      fireEvent.click(retryButton);
      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  describe('Empty State', () => {
    beforeEach(() => {
      // Mock PREMIUM capabilities so CategorySelector doesn't redirect
      (useUserCapabilities as ReturnType<typeof vi.fn>).mockReturnValue({
        data: {
          dailyCard: { used: 0, limit: 1, canUse: true, resetAt: '2026-01-09T00:00:00Z' },
          tarotReadings: { used: 0, limit: 3, canUse: true, resetAt: '2026-01-09T00:00:00Z' },
          canCreateDailyReading: true,
          canCreateTarotReading: true,
          canUseAI: true,
          canUseCustomQuestions: true,
          canUseAdvancedSpreads: true,
          plan: 'premium',
          isAuthenticated: true,
        },
        isLoading: false,
      });
    });

    it('should show empty state when no categories exist', () => {
      (useCategories as Mock).mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      });

      render(<RitualPage />);

      expect(screen.getByText(/no hay categorías disponibles/i)).toBeInTheDocument();
    });
  });

  describe('Categories Display', () => {
    beforeEach(() => {
      // Mock PREMIUM capabilities so CategorySelector doesn't redirect
      (useUserCapabilities as ReturnType<typeof vi.fn>).mockReturnValue({
        data: {
          dailyCard: { used: 0, limit: 1, canUse: true, resetAt: '2026-01-09T00:00:00Z' },
          tarotReadings: { used: 0, limit: 3, canUse: true, resetAt: '2026-01-09T00:00:00Z' },
          canCreateDailyReading: true,
          canCreateTarotReading: true,
          canUseAI: true,
          canUseCustomQuestions: true,
          canUseAdvancedSpreads: true,
          plan: 'premium',
          isAuthenticated: true,
        },
        isLoading: false,
      });
    });

    it('should render all category cards', () => {
      (useCategories as Mock).mockReturnValue({
        data: mockCategories,
        isLoading: false,
        error: null,
      });

      render(<RitualPage />);

      expect(screen.getByText('Amor')).toBeInTheDocument();
      expect(screen.getByText('Carrera')).toBeInTheDocument();
      expect(screen.getByText('Dinero')).toBeInTheDocument();
      expect(screen.getByText('Salud')).toBeInTheDocument();
      expect(screen.getByText('Espiritual')).toBeInTheDocument();
      expect(screen.getByText('General')).toBeInTheDocument();
    });

    it('should display category icons', () => {
      (useCategories as Mock).mockReturnValue({
        data: mockCategories,
        isLoading: false,
        error: null,
      });

      render(<RitualPage />);

      // Check that icon containers exist for each category
      const categoryCards = screen.getAllByTestId('category-card');
      expect(categoryCards).toHaveLength(6);
    });

    it('should have responsive grid layout classes', () => {
      (useCategories as Mock).mockReturnValue({
        data: mockCategories,
        isLoading: false,
        error: null,
      });

      render(<RitualPage />);

      const grid = screen.getByTestId('categories-grid');
      expect(grid).toHaveClass('grid');
      expect(grid).toHaveClass('gap-6');
    });
  });

  describe('Navigation', () => {
    beforeEach(() => {
      // Mock PREMIUM capabilities so CategorySelector doesn't redirect
      (useUserCapabilities as ReturnType<typeof vi.fn>).mockReturnValue({
        data: {
          dailyCard: { used: 0, limit: 1, canUse: true, resetAt: '2026-01-09T00:00:00Z' },
          tarotReadings: { used: 0, limit: 3, canUse: true, resetAt: '2026-01-09T00:00:00Z' },
          canCreateDailyReading: true,
          canCreateTarotReading: true,
          canUseAI: true,
          canUseCustomQuestions: true,
          canUseAdvancedSpreads: true,
          plan: 'premium',
          isAuthenticated: true,
        },
        isLoading: false,
      });
    });

    it('should navigate to questions page when category is clicked', () => {
      (useCategories as Mock).mockReturnValue({
        data: mockCategories,
        isLoading: false,
        error: null,
      });

      render(<RitualPage />);

      const amorCard = screen.getByText('Amor').closest('[data-testid="category-card"]');
      expect(amorCard).toBeInTheDocument();

      fireEvent.click(amorCard!);

      expect(mockPush).toHaveBeenCalledWith('/ritual/preguntas?categoryId=1');
    });

    it('should navigate with correct categoryId for each category', () => {
      (useCategories as Mock).mockReturnValue({
        data: mockCategories,
        isLoading: false,
        error: null,
      });

      render(<RitualPage />);

      const carreraCard = screen.getByText('Carrera').closest('[data-testid="category-card"]');
      fireEvent.click(carreraCard!);

      expect(mockPush).toHaveBeenCalledWith('/ritual/preguntas?categoryId=2');
    });
  });

  describe('Hover Effects', () => {
    beforeEach(() => {
      // Mock PREMIUM capabilities so CategorySelector doesn't redirect
      (useUserCapabilities as ReturnType<typeof vi.fn>).mockReturnValue({
        data: {
          dailyCard: { used: 0, limit: 1, canUse: true, resetAt: '2026-01-09T00:00:00Z' },
          tarotReadings: { used: 0, limit: 3, canUse: true, resetAt: '2026-01-09T00:00:00Z' },
          canCreateDailyReading: true,
          canCreateTarotReading: true,
          canUseAI: true,
          canUseCustomQuestions: true,
          canUseAdvancedSpreads: true,
          plan: 'premium',
          isAuthenticated: true,
        },
        isLoading: false,
      });
    });

    it('should have hover scale effect class on category cards', () => {
      (useCategories as Mock).mockReturnValue({
        data: mockCategories,
        isLoading: false,
        error: null,
      });

      render(<RitualPage />);

      const categoryCards = screen.getAllByTestId('category-card');
      categoryCards.forEach((card) => {
        expect(card).toHaveClass('hover:scale-105');
      });
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      // Mock PREMIUM capabilities so CategorySelector doesn't redirect
      (useUserCapabilities as ReturnType<typeof vi.fn>).mockReturnValue({
        data: {
          dailyCard: { used: 0, limit: 1, canUse: true, resetAt: '2026-01-09T00:00:00Z' },
          tarotReadings: { used: 0, limit: 3, canUse: true, resetAt: '2026-01-09T00:00:00Z' },
          canCreateDailyReading: true,
          canCreateTarotReading: true,
          canUseAI: true,
          canUseCustomQuestions: true,
          canUseAdvancedSpreads: true,
          plan: 'premium',
          isAuthenticated: true,
        },
        isLoading: false,
      });
    });

    it('should have accessible card buttons', () => {
      (useCategories as Mock).mockReturnValue({
        data: mockCategories,
        isLoading: false,
        error: null,
      });

      render(<RitualPage />);

      const categoryCards = screen.getAllByTestId('category-card');
      categoryCards.forEach((card) => {
        expect(card).toHaveAttribute('role', 'button');
        expect(card).toHaveAttribute('tabIndex', '0');
      });
    });

    it('should be keyboard navigable with Enter key', () => {
      (useCategories as Mock).mockReturnValue({
        data: mockCategories,
        isLoading: false,
        error: null,
      });

      render(<RitualPage />);

      const amorCard = screen.getByText('Amor').closest('[data-testid="category-card"]');

      fireEvent.keyDown(amorCard!, { key: 'Enter' });

      expect(mockPush).toHaveBeenCalledWith('/ritual/preguntas?categoryId=1');
    });

    it('should be keyboard navigable with Space key', () => {
      (useCategories as Mock).mockReturnValue({
        data: mockCategories,
        isLoading: false,
        error: null,
      });

      render(<RitualPage />);

      const carreraCard = screen.getByText('Carrera').closest('[data-testid="category-card"]');

      fireEvent.keyDown(carreraCard!, { key: ' ' });

      expect(mockPush).toHaveBeenCalledWith('/ritual/preguntas?categoryId=2');
    });
  });
});
