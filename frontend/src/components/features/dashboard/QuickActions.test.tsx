import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QuickActions } from './QuickActions';

// Mock authStore
const mockUseAuthStore = vi.fn();
vi.mock('@/stores/authStore', () => ({
  useAuthStore: () => mockUseAuthStore(),
}));

describe('QuickActions', () => {
  beforeEach(() => {
    // Reset mock to default (FREE user)
    mockUseAuthStore.mockReturnValue({
      user: {
        id: 1,
        email: 'test@example.com',
        plan: 'free',
      },
      isAuthenticated: true,
    });
  });

  it('should display "Nueva Lectura" button', () => {
    render(<QuickActions />);

    const newReadingButton = screen.getByText('Nueva Lectura');
    expect(newReadingButton).toBeInTheDocument();
  });

  describe('Conditional Routing based on User Plan', () => {
    it('should link "Nueva Lectura" to /tarot/tirada for FREE users', () => {
      mockUseAuthStore.mockReturnValue({
        user: {
          id: 1,
          email: 'free@test.com',
          plan: 'free',
        },
        isAuthenticated: true,
      });

      render(<QuickActions />);

      const newReadingButton = screen.getByText('Nueva Lectura');
      expect(newReadingButton.closest('a')).toHaveAttribute('href', '/tarot/tirada');
    });

    it('should link "Nueva Lectura" to /tarot for PREMIUM users', () => {
      mockUseAuthStore.mockReturnValue({
        user: {
          id: 2,
          email: 'premium@test.com',
          plan: 'premium',
        },
        isAuthenticated: true,
      });

      render(<QuickActions />);

      const newReadingButton = screen.getByText('Nueva Lectura');
      expect(newReadingButton.closest('a')).toHaveAttribute('href', '/tarot');
    });

    it('should default to /tarot/tirada when user is null', () => {
      mockUseAuthStore.mockReturnValue({
        user: null,
        isAuthenticated: false,
      });

      render(<QuickActions />);

      const newReadingButton = screen.getByText('Nueva Lectura');
      expect(newReadingButton.closest('a')).toHaveAttribute('href', '/tarot/tirada');
    });

    it('should default to /tarot/tirada when user plan is undefined', () => {
      mockUseAuthStore.mockReturnValue({
        user: {
          id: 3,
          email: 'test@example.com',
          plan: undefined,
        },
        isAuthenticated: true,
      });

      render(<QuickActions />);

      const newReadingButton = screen.getByText('Nueva Lectura');
      expect(newReadingButton.closest('a')).toHaveAttribute('href', '/tarot/tirada');
    });
  });

  it('should display "Historial de Lecturas" button', () => {
    render(<QuickActions />);

    const historyButton = screen.getByText('Historial de Lecturas');
    expect(historyButton).toBeInTheDocument();
  });

  it('should link "Historial de Lecturas" button to /historial', () => {
    render(<QuickActions />);

    const historyButton = screen.getByText('Historial de Lecturas');
    expect(historyButton.closest('a')).toHaveAttribute('href', '/historial');
  });

  it('should display "Carta del Día" button', () => {
    render(<QuickActions />);

    const dailyCardButton = screen.getByText('Carta del Día');
    expect(dailyCardButton).toBeInTheDocument();
  });

  it('should link "Carta del Día" button to /carta-del-dia', () => {
    render(<QuickActions />);

    const dailyCardButton = screen.getByText('Carta del Día');
    expect(dailyCardButton.closest('a')).toHaveAttribute('href', '/carta-del-dia');
  });

  it('should have primary styling on "Nueva Lectura" button', () => {
    render(<QuickActions />);

    const newReadingButton = screen.getByText('Nueva Lectura');
    const buttonElement = newReadingButton.closest('a');

    // Check for primary styling classes (purple gradient)
    expect(buttonElement).toHaveClass('bg-gradient-to-r');
    expect(buttonElement).toHaveClass('from-purple-600');
    expect(buttonElement).toHaveClass('to-pink-600');
  });

  it('should have secondary styling on other buttons', () => {
    render(<QuickActions />);

    const historyButton = screen.getByText('Historial de Lecturas');
    const buttonElement = historyButton.closest('a');

    // Check for secondary styling (border)
    expect(buttonElement).toHaveClass('border');
  });

  it('should display icons for all buttons', () => {
    render(<QuickActions />);

    // Check that all buttons have icons (lucide-react icons)
    const icons = document.querySelectorAll('svg');
    expect(icons.length).toBeGreaterThanOrEqual(3);
  });

  describe('Premium user — acceso a Carta Astral Historial', () => {
    beforeEach(() => {
      mockUseAuthStore.mockReturnValue({
        user: {
          id: 2,
          email: 'premium@test.com',
          plan: 'premium',
        },
        isAuthenticated: true,
      });
    });

    it('should display "Mis Cartas Astrales" card for Premium users', () => {
      render(<QuickActions />);

      expect(screen.getByText('Mis Cartas Astrales')).toBeInTheDocument();
    });

    it('should link "Mis Cartas Astrales" to /carta-astral/historial for Premium users', () => {
      render(<QuickActions />);

      const cartasCard = screen.getByText('Mis Cartas Astrales');
      expect(cartasCard.closest('a')).toHaveAttribute('href', '/carta-astral/historial');
    });

    it('should NOT display "Carta del Día" card for Premium users (replaced by Mis Cartas Astrales)', () => {
      render(<QuickActions />);

      expect(screen.queryByText('Carta del Día')).not.toBeInTheDocument();
    });
  });

  describe('Free user — NO muestra acceso a Carta Astral Historial', () => {
    beforeEach(() => {
      mockUseAuthStore.mockReturnValue({
        user: {
          id: 1,
          email: 'free@test.com',
          plan: 'free',
        },
        isAuthenticated: true,
      });
    });

    it('should NOT display "Mis Cartas Astrales" card for Free users', () => {
      render(<QuickActions />);

      expect(screen.queryByText('Mis Cartas Astrales')).not.toBeInTheDocument();
    });

    it('should display "Carta del Día" card for Free users', () => {
      render(<QuickActions />);

      expect(screen.getByText('Carta del Día')).toBeInTheDocument();
    });
  });
});
