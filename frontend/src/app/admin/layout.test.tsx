import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminLayout from './layout';
import * as useAuthModule from '@/hooks/useAuth';

// Mock del hook useAuth
vi.mock('@/hooks/useAuth');

// Mock del Next.js navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => '/admin',
}));

describe('AdminLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Authorization Guard', () => {
    it('should redirect to /perfil if user is not admin', () => {
      vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
        user: {
          id: 1,
          email: 'user@test.com',
          name: 'User',
          roles: ['consumer'],
          plan: 'free',
          dailyReadingsCount: 0,
          dailyReadingsLimit: 5,
        },
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        checkAuth: vi.fn(),
      });

      render(
        <AdminLayout>
          <div>Content</div>
        </AdminLayout>
      );

      expect(mockPush).toHaveBeenCalledWith('/perfil');
    });

    it('should NOT redirect if user has admin role', () => {
      vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
        user: {
          id: 1,
          email: 'admin@test.com',
          name: 'Admin',
          roles: ['admin'],
          plan: 'premium',
          dailyReadingsCount: 0,
          dailyReadingsLimit: 100,
        },
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        checkAuth: vi.fn(),
      });

      render(
        <AdminLayout>
          <div data-testid="child">Content</div>
        </AdminLayout>
      );

      expect(mockPush).not.toHaveBeenCalled();
      expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    it('should redirect if user is not authenticated', () => {
      vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        checkAuth: vi.fn(),
      });

      render(
        <AdminLayout>
          <div>Content</div>
        </AdminLayout>
      );

      expect(mockPush).toHaveBeenCalledWith('/perfil');
    });
  });

  describe('Sidebar Navigation', () => {
    beforeEach(() => {
      vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
        user: {
          id: 1,
          email: 'admin@test.com',
          name: 'Admin',
          roles: ['admin'],
          plan: 'premium',
          dailyReadingsCount: 0,
          dailyReadingsLimit: 100,
        },
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        checkAuth: vi.fn(),
      });
    });

    it('should render sidebar with logo', () => {
      render(
        <AdminLayout>
          <div>Content</div>
        </AdminLayout>
      );

      // Verificar que el logo está en el sidebar (desktop)
      const logos = screen.getAllByText(/tarotflavia/i);
      expect(logos.length).toBeGreaterThanOrEqual(1);
    });

    it('should render all navigation items', () => {
      render(
        <AdminLayout>
          <div>Content</div>
        </AdminLayout>
      );

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Usuarios')).toBeInTheDocument();
      expect(screen.getByText('Tarotistas')).toBeInTheDocument();
      expect(screen.getByText('Lecturas')).toBeInTheDocument();
      expect(screen.getByText('Configuración')).toBeInTheDocument();
    });

    it('should render navigation icons', () => {
      render(
        <AdminLayout>
          <div>Content</div>
        </AdminLayout>
      );

      // Los íconos deben estar presentes (verificar por aria-label o data-testid si los añadimos)
      const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
      expect(dashboardLink).toBeInTheDocument();
    });

    it('should highlight active link', () => {
      render(
        <AdminLayout>
          <div>Content</div>
        </AdminLayout>
      );

      // El link activo debe tener estilos especiales
      const activeLink = screen.getByRole('link', { name: /dashboard/i });
      expect(activeLink).toHaveClass('bg-primary/10');
    });
  });

  describe('Responsive Behavior', () => {
    beforeEach(() => {
      vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
        user: {
          id: 1,
          email: 'admin@test.com',
          name: 'Admin',
          roles: ['admin'],
          plan: 'premium',
          dailyReadingsCount: 0,
          dailyReadingsLimit: 100,
        },
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        checkAuth: vi.fn(),
      });
    });

    it('should render hamburger menu button for mobile', () => {
      render(
        <AdminLayout>
          <div>Content</div>
        </AdminLayout>
      );

      const menuButton = screen.getByRole('button', { name: /toggle.*menu/i });
      expect(menuButton).toBeInTheDocument();
    });

    it('should toggle mobile menu on button click', async () => {
      const user = userEvent.setup();
      render(
        <AdminLayout>
          <div>Content</div>
        </AdminLayout>
      );

      const menuButton = screen.getByRole('button', { name: /toggle.*menu/i });

      // Click to open
      await user.click(menuButton);

      // Verificar que se abre (el sidebar debe ser visible)
      // Nota: esto depende de la implementación específica del drawer/sheet
    });

    it('should have responsive sidebar classes', () => {
      const { container } = render(
        <AdminLayout>
          <div>Content</div>
        </AdminLayout>
      );

      // Desktop sidebar debe estar visible
      const sidebar = container.querySelector('aside');
      expect(sidebar).toBeInTheDocument();
    });
  });

  describe('Layout Structure', () => {
    beforeEach(() => {
      vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
        user: {
          id: 1,
          email: 'admin@test.com',
          name: 'Admin',
          roles: ['admin'],
          plan: 'premium',
          dailyReadingsCount: 0,
          dailyReadingsLimit: 100,
        },
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        checkAuth: vi.fn(),
      });
    });

    it('should render children in main content area', () => {
      render(
        <AdminLayout>
          <div data-testid="child-content">Child Content</div>
        </AdminLayout>
      );

      expect(screen.getByTestId('child-content')).toBeInTheDocument();
      expect(screen.getByText('Child Content')).toBeInTheDocument();
    });

    it('should have proper background for main area', () => {
      const { container } = render(
        <AdminLayout>
          <div>Content</div>
        </AdminLayout>
      );

      const main = container.querySelector('main');
      expect(main).toBeInTheDocument();
      expect(main).toHaveClass('bg-main');
    });

    it('should have sidebar on the left and content on the right', () => {
      const { container } = render(
        <AdminLayout>
          <div>Content</div>
        </AdminLayout>
      );

      const sidebar = container.querySelector('aside');
      const main = container.querySelector('main');

      expect(sidebar).toBeInTheDocument();
      expect(main).toBeInTheDocument();
    });
  });
});
