import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Header } from './Header';

// Mock useAuthStore
const mockUseAuthStore = vi.fn();
vi.mock('@/stores/authStore', () => ({
  useAuthStore: () => mockUseAuthStore(),
}));

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuthStore.mockReturnValue({ user: null });
  });

  describe('Logo', () => {
    it('should render logo with "Tarot" text', () => {
      render(<Header />);

      expect(screen.getByText('Tarot')).toBeInTheDocument();
    });

    it('should render logo with serif font', () => {
      render(<Header />);

      const logo = screen.getByText('Tarot');
      expect(logo).toHaveClass('font-serif');
    });

    it('should render logo as a link to home', () => {
      render(<Header />);

      const logoLink = screen.getByRole('link', { name: /tarot/i });
      expect(logoLink).toHaveAttribute('href', '/');
    });
  });

  describe('Surface and Shadow', () => {
    it('should have surface background (white)', () => {
      render(<Header />);

      const header = screen.getByRole('banner');
      expect(header).toHaveClass('bg-surface');
    });

    it('should have soft shadow', () => {
      render(<Header />);

      const header = screen.getByRole('banner');
      expect(header).toHaveClass('shadow-soft');
    });

    it('should be sticky at top', () => {
      render(<Header />);

      const header = screen.getByRole('banner');
      expect(header).toHaveClass('sticky');
      expect(header).toHaveClass('top-0');
    });
  });

  describe('Navigation - Unauthenticated', () => {
    beforeEach(() => {
      mockUseAuthStore.mockReturnValue({ user: null });
    });

    it('should NOT show "Explorar" button when not authenticated', () => {
      render(<Header />);

      expect(screen.queryByRole('link', { name: /explorar/i })).not.toBeInTheDocument();
    });

    it('should NOT show "Mis Sesiones" button when not authenticated', () => {
      render(<Header />);

      expect(screen.queryByRole('link', { name: /mis sesiones/i })).not.toBeInTheDocument();
    });

    it('should show "Iniciar Sesión" link when not authenticated', () => {
      render(<Header />);

      expect(screen.getByRole('link', { name: /iniciar sesión/i })).toBeInTheDocument();
    });
  });

  describe('Navigation - Authenticated', () => {
    const mockUser = {
      id: '1',
      name: 'María García',
      email: 'maria@test.com',
    };

    beforeEach(() => {
      mockUseAuthStore.mockReturnValue({ user: mockUser });
    });

    it('should show "Nueva Lectura" link when authenticated', () => {
      render(<Header />);

      const link = screen.getByRole('link', { name: /nueva lectura/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/ritual');
    });

    it('should NOT show "Explorar" link (MVP: single tarotista)', () => {
      render(<Header />);

      // MVP solo trabaja con un tarotista (Flavia)
      // El link "Explorar" está oculto para evitar confusión
      expect(screen.queryByRole('link', { name: /explorar/i })).not.toBeInTheDocument();
    });

    it('should show "Mis Sesiones" link when authenticated', () => {
      render(<Header />);

      expect(screen.getByRole('link', { name: /mis sesiones/i })).toBeInTheDocument();
    });

    it('should NOT show "Iniciar Sesión" link when authenticated', () => {
      render(<Header />);

      expect(screen.queryByRole('link', { name: /iniciar sesión/i })).not.toBeInTheDocument();
    });
  });

  describe('Mobile Menu', () => {
    it('should render hamburger menu button on mobile', () => {
      render(<Header />);

      const menuButton = screen.getByRole('button', { name: /menú/i });
      expect(menuButton).toBeInTheDocument();
    });

    it('should have hamburger button hidden on desktop', () => {
      render(<Header />);

      const menuButton = screen.getByRole('button', { name: /menú/i });
      expect(menuButton).toHaveClass('md:hidden');
    });
  });

  describe('Accessibility', () => {
    it('should have proper header landmark', () => {
      render(<Header />);

      expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    it('should have navigation landmark', () => {
      render(<Header />);

      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });
  });
});
