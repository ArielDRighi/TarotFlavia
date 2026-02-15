import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Header } from './Header';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
  })),
}));

// Mock useAuthStore
const mockUseAuthStore = vi.fn();
vi.mock('@/stores/authStore', () => ({
  useAuthStore: () => mockUseAuthStore(),
}));

// Mock notification hooks
vi.mock('@/hooks/api/useNotifications', () => ({
  useUnreadCount: vi.fn(() => ({
    data: { count: 0 },
    isLoading: false,
    error: null,
  })),
  useNotifications: vi.fn(() => ({
    data: [],
    isLoading: false,
    error: null,
  })),
  useMarkAsRead: vi.fn(() => ({
    mutate: vi.fn(),
  })),
  useMarkAllAsRead: vi.fn(() => ({
    mutate: vi.fn(),
  })),
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

    it('should show "Registrarse" button when not authenticated', () => {
      render(<Header />);

      const registerButton = screen.getByRole('link', { name: /registrarse/i });
      expect(registerButton).toBeInTheDocument();
      expect(registerButton).toHaveAttribute('href', '/registro');
    });

    it('should render "Registrarse" as primary button (more prominent)', () => {
      render(<Header />);

      const registerButton = screen.getByRole('link', { name: /registrarse/i });
      // Primary button has bg-primary class, outline button has border-input class
      // Registrarse should be primary (default variant), NOT outline
      expect(registerButton).toHaveClass('bg-primary');
      expect(registerButton).not.toHaveClass('border-input');
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

    it('should NOT show "Mis Sesiones" link (MVP: user sessions not implemented)', () => {
      render(<Header />);

      // Sessions endpoints exist only for tarotistas
      // User sessions feature is not implemented yet in MVP
      expect(screen.queryByRole('link', { name: /mis sesiones/i })).not.toBeInTheDocument();
    });

    it('should NOT show "Iniciar Sesión" link when authenticated', () => {
      render(<Header />);

      expect(screen.queryByRole('link', { name: /iniciar sesión/i })).not.toBeInTheDocument();
    });

    it('should NOT show "Registrarse" button when authenticated', () => {
      render(<Header />);

      expect(screen.queryByRole('link', { name: /registrarse/i })).not.toBeInTheDocument();
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

  describe('Public Navigation Links', () => {
    it('should display Carta del Día link for all users', () => {
      mockUseAuthStore.mockReturnValue({
        user: null,
        isAuthenticated: false,
      });

      render(<Header />);

      const cartaLink = screen.getByRole('link', { name: /carta del día/i });
      expect(cartaLink).toBeInTheDocument();
      expect(cartaLink).toHaveAttribute('href', '/carta-del-dia');
    });

    it('should display Horóscopo link for all users', () => {
      mockUseAuthStore.mockReturnValue({
        user: null,
        isAuthenticated: false,
      });

      render(<Header />);

      const horoscopoLink = screen.getByRole('link', { name: /^Horóscopo$/i });
      expect(horoscopoLink).toBeInTheDocument();
      expect(horoscopoLink).toHaveAttribute('href', '/horoscopo');
    });

    it('should display Horóscopo Chino link for all users', () => {
      mockUseAuthStore.mockReturnValue({
        user: null,
        isAuthenticated: false,
      });

      render(<Header />);

      const horoscopoChino = screen.getByRole('link', {
        name: /horóscopo chino/i,
      });
      expect(horoscopoChino).toBeInTheDocument();
      expect(horoscopoChino).toHaveAttribute('href', '/horoscopo-chino');
    });

    it('should display Numerología link for all users', () => {
      mockUseAuthStore.mockReturnValue({
        user: null,
        isAuthenticated: false,
      });

      render(<Header />);

      const numerologiaLink = screen.getByRole('link', { name: /numerología/i });
      expect(numerologiaLink).toBeInTheDocument();
      expect(numerologiaLink).toHaveAttribute('href', '/numerologia');
    });

    it('should display Rituales link for all users', () => {
      mockUseAuthStore.mockReturnValue({
        user: null,
        isAuthenticated: false,
      });

      render(<Header />);

      const ritualesLink = screen.getByRole('link', { name: /rituales/i });
      expect(ritualesLink).toBeInTheDocument();
      expect(ritualesLink).toHaveAttribute('href', '/rituales');
    });

    it('should display Péndulo link for all users', () => {
      mockUseAuthStore.mockReturnValue({
        user: null,
        isAuthenticated: false,
      });

      render(<Header />);

      const penduloLink = screen.getByRole('link', { name: /péndulo/i });
      expect(penduloLink).toBeInTheDocument();
      expect(penduloLink).toHaveAttribute('href', '/pendulo');
    });

    it('should display Carta Astral link for all users', () => {
      mockUseAuthStore.mockReturnValue({
        user: null,
        isAuthenticated: false,
      });

      render(<Header />);

      const cartaAstralLink = screen.getByRole('link', { name: /carta astral/i });
      expect(cartaAstralLink).toBeInTheDocument();
      expect(cartaAstralLink).toHaveAttribute('href', '/carta-astral');
    });
  });
});
