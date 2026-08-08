import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HomePageContent } from './HomePageContent';

// Mock child components
vi.mock('./LandingPage', () => ({
  LandingPage: () => <div data-testid="landing-page">LandingPage Component</div>,
}));

vi.mock('@/components/features/dashboard', () => ({
  UserDashboard: () => <div data-testid="user-dashboard">UserDashboard Component</div>,
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
describe('HomePageContent (Root Page)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading State', () => {
    it('⚠️ T-PROD-022: muestra la landing mientras se valida la sesión, no un skeleton', () => {
      // `isLoading` arranca en `true` en el store, así que el skeleton que había
      // acá ERA el render del servidor: la home le servía a Googlebot una pantalla
      // de carga. La landing es el default, también en SSR.
      mockUseAuthStore.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: true,
      });

      render(<HomePageContent />);

      expect(screen.getByTestId('landing-page')).toBeInTheDocument();
      expect(screen.queryByTestId('user-dashboard')).not.toBeInTheDocument();
    });

    it('⚠️ T-PROD-022: muestra el dashboard en cuanto hay sesión, aunque siga cargando', () => {
      mockUseAuthStore.mockReturnValue({
        user: { id: 1, name: 'Test User', plan: 'free' },
        isAuthenticated: true,
        isLoading: true,
      });

      render(<HomePageContent />);

      expect(screen.getByTestId('user-dashboard')).toBeInTheDocument();
    });
  });

  describe('Unauthenticated Users', () => {
    it('should show LandingPage for unauthenticated users', () => {
      mockUseAuthStore.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });

      render(<HomePageContent />);

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

      render(<HomePageContent />);

      expect(screen.getByTestId('user-dashboard')).toBeInTheDocument();
      expect(screen.queryByTestId('landing-page')).not.toBeInTheDocument();
    });

    it('should show UserDashboard for PREMIUM users', () => {
      mockUseAuthStore.mockReturnValue({
        user: { id: 2, name: 'Premium User', plan: 'premium' },
        isAuthenticated: true,
        isLoading: false,
      });

      render(<HomePageContent />);

      expect(screen.getByTestId('user-dashboard')).toBeInTheDocument();
      expect(screen.queryByTestId('landing-page')).not.toBeInTheDocument();
    });

    it('should show UserDashboard for ANONYMOUS users when authenticated', () => {
      mockUseAuthStore.mockReturnValue({
        user: { id: 3, name: 'Guest', plan: 'anonymous' },
        isAuthenticated: true,
        isLoading: false,
      });

      render(<HomePageContent />);

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

      const { rerender } = render(<HomePageContent />);
      // Antes de resolver la sesión ya se ve la landing (T-PROD-022).
      expect(screen.getByTestId('landing-page')).toBeInTheDocument();

      // Simulate auth check complete - no user
      mockUseAuthStore.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });

      rerender(<HomePageContent />);
      expect(screen.getByTestId('landing-page')).toBeInTheDocument();
    });

    it('should handle transition from loading to authenticated', () => {
      mockUseAuthStore.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: true,
      });

      const { rerender } = render(<HomePageContent />);
      // Antes de resolver la sesión ya se ve la landing (T-PROD-022).
      expect(screen.getByTestId('landing-page')).toBeInTheDocument();

      // Simulate auth check complete - user logged in
      mockUseAuthStore.mockReturnValue({
        user: { id: 1, name: 'Test User', plan: 'free' },
        isAuthenticated: true,
        isLoading: false,
      });

      rerender(<HomePageContent />);
      expect(screen.getByTestId('user-dashboard')).toBeInTheDocument();
    });
  });

  describe('Contenido indexable (T-PROD-022)', () => {
    it('⚠️ nunca deja la home sin contenido: el render por defecto es la landing', () => {
      // TASK-017 aseveraba lo contrario ("no renderizar contenido mientras carga,
      // para evitar el FOUC"). Se invirtió a propósito: como `isLoading` arranca en
      // `true`, ese comportamiento hacía que el HTML servido por el servidor —lo
      // que ve Googlebot y lo que evaluó AdSense— fuera una pantalla de carga.
      // El precio es un parpadeo de la landing antes del dashboard para un usuario
      // logueado; el beneficio es tener una home indexable.
      mockUseAuthStore.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: true,
      });

      render(<HomePageContent />);

      expect(screen.getByTestId('landing-page')).toBeInTheDocument();
    });
  });
});
