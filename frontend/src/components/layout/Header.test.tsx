import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Header } from './Header';
import * as nextNavigation from 'next/navigation';
import { useUnreadCount } from '@/hooks/api/useNotifications';
import { CTA_AUTH } from '@/lib/constants/cta-copy';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
  })),
  usePathname: vi.fn(() => '/'),
}));

// Mock useAuthStore
const mockUseAuthStore = vi.fn();
vi.mock('@/stores/authStore', () => ({
  useAuthStore: () => mockUseAuthStore(),
}));

// HeaderNavLinks/UserMenu now derive premium from useUserPlanFeatures
// (capabilities-backed). Keep the tests driving premium via the mocked authStore
// user.plan by having the mocked hook read the same source.
vi.mock('@/hooks/utils/useUserPlanFeatures', () => ({
  useUserPlanFeatures: () => {
    const state = mockUseAuthStore() as { user?: { plan?: string } | null };
    return { isPremium: state?.user?.plan === 'premium' };
  },
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

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  // T-PROD-011: las notificaciones NO están planeadas en la web. La feature existe
  // completa (backend + frontend) pero queda oculta y bloqueada tras un feature flag
  // opt-in, para poder reactivarla más adelante sin reescribirla.
  describe('Notification Bell - Feature Flag (T-PROD-011)', () => {
    const authenticatedUser = { id: 1, name: 'María', email: 'maria@test.com', plan: 'free' };

    it('should NOT render the notification bell by default (flag off)', () => {
      mockUseAuthStore.mockReturnValue({ user: authenticatedUser });

      render(<Header />);

      expect(screen.queryByTestId('notification-bell-button')).not.toBeInTheDocument();
    });

    it('should NOT render the notification bell when the flag is explicitly disabled', () => {
      vi.stubEnv('NEXT_PUBLIC_NOTIFICATIONS_ENABLED', 'false');
      mockUseAuthStore.mockReturnValue({ user: authenticatedUser });

      render(<Header />);

      expect(screen.queryByTestId('notification-bell-button')).not.toBeInTheDocument();
    });

    it('should NOT query the notifications API when the flag is off (bloqueada, no solo oculta)', () => {
      mockUseAuthStore.mockReturnValue({ user: authenticatedUser });

      render(<Header />);

      // Si NotificationBell no se monta, su hook de React Query nunca corre
      // → cero peticiones a /notifications/count.
      expect(vi.mocked(useUnreadCount)).not.toHaveBeenCalled();
    });

    it('should render the notification bell when the flag is enabled', () => {
      vi.stubEnv('NEXT_PUBLIC_NOTIFICATIONS_ENABLED', 'true');
      mockUseAuthStore.mockReturnValue({ user: authenticatedUser });

      render(<Header />);

      expect(screen.getByTestId('notification-bell-button')).toBeInTheDocument();
    });

    it('should NOT render the notification bell for anonymous users even with the flag on', () => {
      vi.stubEnv('NEXT_PUBLIC_NOTIFICATIONS_ENABLED', 'true');
      mockUseAuthStore.mockReturnValue({ user: null });

      render(<Header />);

      expect(screen.queryByTestId('notification-bell-button')).not.toBeInTheDocument();
    });
  });

  describe('Logo', () => {
    it('should render logo with "Auguria" text', () => {
      render(<Header />);

      expect(screen.getByText('Auguria')).toBeInTheDocument();
    });

    it('should render logo with serif font', () => {
      render(<Header />);

      const logo = screen.getByText('Auguria');
      expect(logo).toHaveClass('font-serif');
    });

    it('should render logo as a link to home', () => {
      render(<Header />);

      const logoLink = screen.getByRole('link', { name: /^auguria$/i });
      expect(logoLink).toHaveAttribute('href', '/');
    });

    it('should keep the logo in the flex flow on mobile (no absolute centering)', () => {
      // T-PROD-002: el centrado absoluto sacaba el logo del flujo flex y se
      // superponía con los botones de auth en viewports de 320-430px.
      render(<Header />);

      const logoLink = screen.getByRole('link', { name: /^auguria$/i });
      expect(logoLink).not.toHaveClass('absolute');
      expect(logoLink).not.toHaveClass('-translate-x-1/2');
    });

    it('should not shrink the logo below its content width', () => {
      render(<Header />);

      const logoLink = screen.getByRole('link', { name: /^auguria$/i });
      expect(logoLink).toHaveClass('shrink-0');
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

    it('should show "Crear cuenta" button when not authenticated', () => {
      render(<Header />);

      const registerButton = screen.getByRole('link', { name: CTA_AUTH.REGISTER });
      expect(registerButton).toBeInTheDocument();
      expect(registerButton).toHaveAttribute('href', '/registro');
    });

    it('should render "Crear cuenta" as primary button (more prominent)', () => {
      render(<Header />);

      const registerButton = screen.getByRole('link', { name: CTA_AUTH.REGISTER });
      // Primary button has bg-primary class, outline button has border-input class
      // Crear cuenta should be primary (default variant), NOT outline
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

    it('should show "Tirada de Tarot" link when authenticated', () => {
      render(<Header />);

      const link = screen.getByRole('link', { name: /tirada de tarot/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/tarot');
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

    it('should NOT show "Crear cuenta" button when authenticated', () => {
      render(<Header />);

      expect(screen.queryByRole('link', { name: CTA_AUTH.REGISTER })).not.toBeInTheDocument();
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

    it('should have aria-expanded=false when menu is closed', () => {
      render(<Header />);

      const menuButton = screen.getByRole('button', { name: /menú/i });
      expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('should open the mobile menu Sheet when hamburger button is clicked', async () => {
      const user = userEvent.setup();
      render(<Header />);

      const menuButton = screen.getByRole('button', { name: /menú/i });
      await user.click(menuButton);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should have aria-expanded=true when menu is open', async () => {
      const user = userEvent.setup();
      render(<Header />);

      const menuButton = screen.getByRole('button', { name: /menú/i });
      await user.click(menuButton);

      expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    });

    it('should show navigation links inside the mobile menu', async () => {
      const user = userEvent.setup();
      render(<Header />);

      await user.click(screen.getByRole('button', { name: /menú/i }));

      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      expect(screen.getAllByRole('link', { name: /tarot del día/i }).length).toBeGreaterThan(0);
    });

    it('should show "Tirada de Tarot" link in mobile menu when authenticated', async () => {
      mockUseAuthStore.mockReturnValue({
        user: { id: 1, name: 'María', email: 'maria@test.com', plan: 'free' },
      });
      const user = userEvent.setup();
      render(<Header />);

      await user.click(screen.getByRole('button', { name: /menú/i }));

      expect(screen.getAllByRole('link', { name: /tirada de tarot/i }).length).toBeGreaterThan(0);
    });

    it('should show "Premium" link in mobile menu for free authenticated users', async () => {
      mockUseAuthStore.mockReturnValue({
        user: { id: 1, name: 'María', email: 'maria@test.com', plan: 'free' },
      });
      const user = userEvent.setup();
      render(<Header />);

      await user.click(screen.getByRole('button', { name: /menú/i }));

      const premiumLinks = screen.getAllByRole('link', { name: /premium/i });
      expect(premiumLinks.length).toBeGreaterThan(0);
    });

    it('should NOT show "Premium" link in mobile menu for premium users', async () => {
      mockUseAuthStore.mockReturnValue({
        user: { id: 1, name: 'María', email: 'maria@test.com', plan: 'premium' },
      });
      const user = userEvent.setup();
      render(<Header />);

      await user.click(screen.getByRole('button', { name: /menú/i }));

      expect(screen.queryByRole('link', { name: /^premium$/i })).not.toBeInTheDocument();
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
    it('should display Tarot del Día link for all users', () => {
      mockUseAuthStore.mockReturnValue({
        user: null,
        isAuthenticated: false,
      });

      render(<Header />);

      const cartaLink = screen.getByRole('link', { name: /tarot del día/i });
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

  describe('Premium Badge - T-FE-04', () => {
    it('should show "Premium" link for authenticated free users', () => {
      mockUseAuthStore.mockReturnValue({
        user: { id: 1, name: 'María', email: 'maria@test.com', plan: 'free' },
      });

      render(<Header />);

      const premiumLink = screen.getByRole('link', { name: /premium/i });
      expect(premiumLink).toBeInTheDocument();
      expect(premiumLink).toHaveAttribute('href', '/premium');
    });

    it('should NOT show "Premium" link for authenticated premium users', () => {
      mockUseAuthStore.mockReturnValue({
        user: { id: 1, name: 'María', email: 'maria@test.com', plan: 'premium' },
      });

      render(<Header />);

      // The UserMenu dropdown trigger (avatar) is visible, but no "Premium" nav link
      expect(screen.queryByRole('link', { name: /^premium$/i })).not.toBeInTheDocument();
    });

    it('should NOT show "Premium" link for unauthenticated users', () => {
      mockUseAuthStore.mockReturnValue({ user: null });

      render(<Header />);

      expect(screen.queryByRole('link', { name: /^premium$/i })).not.toBeInTheDocument();
    });

    it('should render "Premium" link with a star icon', () => {
      mockUseAuthStore.mockReturnValue({
        user: { id: 1, name: 'María', email: 'maria@test.com', plan: 'free' },
      });

      render(<Header />);

      const premiumLink = screen.getByRole('link', { name: /premium/i });
      // Link should contain an svg (the star icon)
      expect(premiumLink.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('Active Navigation Links', () => {
    it('should highlight Servicios link when on /servicios path', () => {
      mockUseAuthStore.mockReturnValue({ user: null });
      vi.mocked(nextNavigation.usePathname).mockReturnValue('/servicios');

      render(<Header />);

      const serviciosLink = screen.getByRole('link', { name: /^servicios$/i });
      expect(serviciosLink).toHaveClass('text-primary');
      expect(serviciosLink).toHaveClass('font-semibold');
    });

    it('should highlight Servicios link when on a nested /servicios/* path', () => {
      mockUseAuthStore.mockReturnValue({ user: null });
      vi.mocked(nextNavigation.usePathname).mockReturnValue('/servicios/arbol-genealogico');

      render(<Header />);

      const serviciosLink = screen.getByRole('link', { name: /^servicios$/i });
      expect(serviciosLink).toHaveClass('text-primary');
      expect(serviciosLink).toHaveClass('font-semibold');
    });

    it('should NOT highlight Servicios link when on a different path', () => {
      mockUseAuthStore.mockReturnValue({ user: null });
      vi.mocked(nextNavigation.usePathname).mockReturnValue('/horoscopo');

      render(<Header />);

      const serviciosLink = screen.getByRole('link', { name: /^servicios$/i });
      expect(serviciosLink).not.toHaveClass('font-semibold');
    });
  });
});
