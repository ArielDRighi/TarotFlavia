import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Home from './page';

// Mock child components
vi.mock('@/components/features/home', () => ({
  LandingPage: () => <div data-testid="landing-page">LandingPage Component</div>,
}));

vi.mock('@/components/features/dashboard', () => ({
  UserDashboard: () => <div data-testid="user-dashboard">UserDashboard Component</div>,
}));

// Mock Skeleton component
vi.mock('@/components/ui/skeleton', () => ({
  Skeleton: ({ className }: { className?: string }) => (
    <div data-testid="skeleton-loader" className={className}>
      Loading...
    </div>
  ),
}));

// Mock authStore
const mockUseAuthStore = vi.fn();
vi.mock('@/stores/authStore', () => ({
  useAuthStore: () => mockUseAuthStore(),
}));

/**
 * Tests for Home Page with Dual Logic
 * TASK-017: Implement dual HomePage (LandingPage + UserDashboard)
 *
 * Tests cover:
 * - Loading state (prevent FOUC)
 * - Unauthenticated users → LandingPage
 * - Authenticated users → UserDashboard (all plans)
 * - Auth state transitions
 */
describe('Home (Root Page)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should show loading skeleton while validating auth', () => {
      mockUseAuthStore.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: true,
      });

      render(<Home />);

      const skeletons = screen.getAllByTestId('skeleton-loader');
      expect(skeletons.length).toBeGreaterThan(0);
      expect(screen.queryByTestId('landing-page')).not.toBeInTheDocument();
      expect(screen.queryByTestId('user-dashboard')).not.toBeInTheDocument();
    });
  });

  describe('Unauthenticated Users', () => {
    it('should show LandingPage for unauthenticated users', () => {
      mockUseAuthStore.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });

      render(<Home />);

      expect(screen.getByTestId('landing-page')).toBeInTheDocument();
      expect(screen.queryByTestId('user-dashboard')).not.toBeInTheDocument();
    });
  });

  describe('Authenticated Users', () => {
    it('should show UserDashboard for FREE users', () => {
      mockUseAuthStore.mockReturnValue({
        user: { id: 1, name: 'Test User', plan: 'free' },
        isAuthenticated: true,
        isLoading: false,
      });

      render(<Home />);

      expect(screen.getByTestId('user-dashboard')).toBeInTheDocument();
      expect(screen.queryByTestId('landing-page')).not.toBeInTheDocument();
    });

    it('should show UserDashboard for PREMIUM users', () => {
      mockUseAuthStore.mockReturnValue({
        user: { id: 2, name: 'Premium User', plan: 'premium' },
        isAuthenticated: true,
        isLoading: false,
      });

      render(<Home />);

      expect(screen.getByTestId('user-dashboard')).toBeInTheDocument();
      expect(screen.queryByTestId('landing-page')).not.toBeInTheDocument();
    });

    it('should show UserDashboard for ANONYMOUS users when authenticated', () => {
      mockUseAuthStore.mockReturnValue({
        user: { id: 3, name: 'Guest', plan: 'anonymous' },
        isAuthenticated: true,
        isLoading: false,
      });

      render(<Home />);

      expect(screen.getByTestId('user-dashboard')).toBeInTheDocument();
      expect(screen.queryByTestId('landing-page')).not.toBeInTheDocument();
    });
  });

  describe('Auth State Transitions', () => {
    it('should handle transition from loading to unauthenticated', () => {
      mockUseAuthStore.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: true,
      });

      const { rerender } = render(<Home />);
      const skeletons = screen.getAllByTestId('skeleton-loader');
      expect(skeletons.length).toBeGreaterThan(0);

      // Simulate auth check complete - no user
      mockUseAuthStore.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });

      rerender(<Home />);
      expect(screen.getByTestId('landing-page')).toBeInTheDocument();
      expect(screen.queryAllByTestId('skeleton-loader').length).toBe(0);
    });

    it('should handle transition from loading to authenticated', () => {
      mockUseAuthStore.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: true,
      });

      const { rerender } = render(<Home />);
      const skeletons = screen.getAllByTestId('skeleton-loader');
      expect(skeletons.length).toBeGreaterThan(0);

      // Simulate auth check complete - user logged in
      mockUseAuthStore.mockReturnValue({
        user: { id: 1, name: 'Test User', plan: 'free' },
        isAuthenticated: true,
        isLoading: false,
      });

      rerender(<Home />);
      expect(screen.getByTestId('user-dashboard')).toBeInTheDocument();
      expect(screen.queryAllByTestId('skeleton-loader').length).toBe(0);
    });
  });

  describe('FOUC Prevention', () => {
    it('should not render content while loading to prevent FOUC', () => {
      mockUseAuthStore.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: true,
      });

      render(<Home />);

      // Should only show loading, no actual content
      const skeletons = screen.getAllByTestId('skeleton-loader');
      expect(skeletons.length).toBeGreaterThan(0);
      expect(screen.queryByTestId('landing-page')).not.toBeInTheDocument();
      expect(screen.queryByTestId('user-dashboard')).not.toBeInTheDocument();
    });
  });
});
