import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserMenu } from './UserMenu';

// Mock useAuthStore
const mockLogout = vi.fn();
const mockUseAuthStore = vi.fn();
vi.mock('@/stores/authStore', () => ({
  useAuthStore: () => mockUseAuthStore(),
}));

describe('UserMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuthStore.mockReturnValue({ user: null, logout: mockLogout });
  });

  describe('Unauthenticated State', () => {
    beforeEach(() => {
      mockUseAuthStore.mockReturnValue({ user: null, logout: mockLogout });
    });

    it('should render "Iniciar Sesión" link when not authenticated', () => {
      render(<UserMenu />);

      expect(screen.getByRole('link', { name: /iniciar sesión/i })).toBeInTheDocument();
    });

    it('should NOT render avatar when not authenticated', () => {
      render(<UserMenu />);

      expect(screen.queryByTestId('user-avatar')).not.toBeInTheDocument();
    });
  });

  describe('Authenticated State', () => {
    const mockUser = {
      id: '1',
      name: 'María García',
      email: 'maria@test.com',
    };

    beforeEach(() => {
      mockUseAuthStore.mockReturnValue({ user: mockUser, logout: mockLogout });
    });

    it('should render avatar with user initial', () => {
      render(<UserMenu />);

      const avatar = screen.getByTestId('user-avatar');
      expect(avatar).toBeInTheDocument();
      expect(screen.getByText('M')).toBeInTheDocument();
    });

    it('should NOT show "Iniciar Sesión" link when authenticated', () => {
      render(<UserMenu />);

      expect(screen.queryByRole('link', { name: /iniciar sesión/i })).not.toBeInTheDocument();
    });

    describe('Dropdown Menu', () => {
      it('should open dropdown when avatar is clicked', async () => {
        const user = userEvent.setup();
        render(<UserMenu />);

        const triggerButton = screen.getByTestId('user-menu-trigger');
        await user.click(triggerButton);

        await waitFor(() => {
          expect(screen.getByRole('menu')).toBeInTheDocument();
        });
      });

      it('should show "Mi Perfil" option in dropdown', async () => {
        const user = userEvent.setup();
        render(<UserMenu />);

        await user.click(screen.getByTestId('user-menu-trigger'));

        await waitFor(() => {
          expect(screen.getByRole('menuitem', { name: /mi perfil/i })).toBeInTheDocument();
        });
      });

      it('should show "Mis Lecturas" option in dropdown', async () => {
        const user = userEvent.setup();
        render(<UserMenu />);

        await user.click(screen.getByTestId('user-menu-trigger'));

        await waitFor(() => {
          expect(screen.getByRole('menuitem', { name: /mis lecturas/i })).toBeInTheDocument();
        });
      });

      it('should show "Configuración" option in dropdown', async () => {
        const user = userEvent.setup();
        render(<UserMenu />);

        await user.click(screen.getByTestId('user-menu-trigger'));

        await waitFor(() => {
          expect(screen.getByRole('menuitem', { name: /configuración/i })).toBeInTheDocument();
        });
      });

      it('should show "Cerrar Sesión" option in dropdown', async () => {
        const user = userEvent.setup();
        render(<UserMenu />);

        await user.click(screen.getByTestId('user-menu-trigger'));

        await waitFor(() => {
          expect(screen.getByRole('menuitem', { name: /cerrar sesión/i })).toBeInTheDocument();
        });
      });

      it('should have a separator before "Cerrar Sesión"', async () => {
        const user = userEvent.setup();
        render(<UserMenu />);

        await user.click(screen.getByTestId('user-menu-trigger'));

        await waitFor(() => {
          expect(screen.getByRole('separator')).toBeInTheDocument();
        });
      });

      it('should call logout when "Cerrar Sesión" is clicked', async () => {
        const user = userEvent.setup();
        render(<UserMenu />);

        await user.click(screen.getByTestId('user-menu-trigger'));
        await waitFor(() => {
          expect(screen.getByRole('menuitem', { name: /cerrar sesión/i })).toBeInTheDocument();
        });

        await user.click(screen.getByRole('menuitem', { name: /cerrar sesión/i }));

        expect(mockLogout).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Avatar Initial', () => {
    it('should show first letter of name in uppercase', () => {
      mockUseAuthStore.mockReturnValue({
        user: { id: '1', name: 'juan pérez', email: 'juan@test.com' },
        logout: mockLogout,
      });
      render(<UserMenu />);

      expect(screen.getByText('J')).toBeInTheDocument();
    });

    it('should show "?" when user has no name', () => {
      mockUseAuthStore.mockReturnValue({
        user: { id: '1', name: '', email: 'test@test.com' },
        logout: mockLogout,
      });
      render(<UserMenu />);

      expect(screen.getByText('?')).toBeInTheDocument();
    });
  });
});
