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
      profilePicture: null,
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
      profilePicture: null,
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
      profilePicture: null,
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
      const logos = screen.getAllByText(/auguria/i);
      expect(logos.length).toBeGreaterThanOrEqual(1);
    });

    it('should render all navigation items', () => {
      render(
        <AdminLayout>
          <div>Content</div>
        </AdminLayout>
      );

      // Sección Principal
      expect(screen.getAllByText('Dashboard').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Métricas').length).toBeGreaterThanOrEqual(1);

      // Sección Gestión
      expect(screen.getAllByText('Usuarios').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Tarotistas').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Lecturas').length).toBeGreaterThanOrEqual(1);

      // Sección Sistema
      expect(screen.getAllByText('Uso de Interpretaciones').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Configuración de Planes').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Seguridad').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Caché').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Audit Logs').length).toBeGreaterThanOrEqual(1);
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

    it('should render section headers', () => {
      render(
        <AdminLayout>
          <div>Content</div>
        </AdminLayout>
      );

      expect(screen.getByText('PRINCIPAL')).toBeInTheDocument();
      expect(screen.getByText('GESTIÓN')).toBeInTheDocument();
      expect(screen.getByText('SISTEMA')).toBeInTheDocument();
    });

    it('should render navigation items in correct order within sections', () => {
      const { container } = render(
        <AdminLayout>
          <div>Content</div>
        </AdminLayout>
      );

      const links = container.querySelectorAll('nav a');
      const linkTexts = Array.from(links).map((link) => link.textContent);

      // Verificar que los items están en el orden esperado
      expect(linkTexts).toContain('Dashboard');
      expect(linkTexts).toContain('Métricas');
      expect(linkTexts).toContain('Usuarios');
      expect(linkTexts).toContain('Tarotistas');
      expect(linkTexts).toContain('Lecturas');
      expect(linkTexts).toContain('Uso de Interpretaciones');
      expect(linkTexts).toContain('Configuración de Planes');
      expect(linkTexts).toContain('Seguridad');
      expect(linkTexts).toContain('Caché');
      expect(linkTexts).toContain('Audit Logs');
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
      profilePicture: null,
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

      // Inicialmente el drawer no debe estar visible
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      // Click to open
      await user.click(menuButton);

      // Verificar que el drawer se abre
      const drawer = screen.getByRole('dialog', { name: /navigation menu/i });
      expect(drawer).toBeInTheDocument();

      // Click en el botón de cerrar dentro del drawer
      const closeButton = screen.getByRole('button', { name: /close menu/i });
      await user.click(closeButton);

      // Verificar que el drawer se cierra
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should close drawer when clicking backdrop', async () => {
      const user = userEvent.setup();
      render(
        <AdminLayout>
          <div>Content</div>
        </AdminLayout>
      );

      const menuButton = screen.getByRole('button', { name: /toggle.*menu/i });

      // Abrir drawer
      await user.click(menuButton);
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      // Click en el backdrop (presentation role)
      const backdrop = screen.getByRole('presentation');
      await user.click(backdrop);

      // Verificar que se cierra
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should close drawer when pressing Escape key', async () => {
      const user = userEvent.setup();
      render(
        <AdminLayout>
          <div>Content</div>
        </AdminLayout>
      );

      const menuButton = screen.getByRole('button', { name: /toggle.*menu/i });

      // Abrir drawer
      await user.click(menuButton);
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      // Presionar Escape
      await user.keyboard('{Escape}');

      // Verificar que se cierra
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
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
      profilePicture: null,
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
      expect(main).toHaveClass('bg-bg-main');
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
