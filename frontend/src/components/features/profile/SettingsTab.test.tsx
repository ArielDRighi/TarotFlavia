import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SettingsTab } from './SettingsTab';

// Mock hooks
const mockDeleteAccount = vi.fn();

vi.mock('@/hooks/api/useUser', () => ({
  useDeleteAccount: vi.fn(() => ({
    mutate: mockDeleteAccount,
    isPending: false,
  })),
}));

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock useAuth
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
    },
  }),
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

const createWrapper = () => {
  const queryClient = createTestQueryClient();
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
};

describe('SettingsTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render notifications section', () => {
      render(<SettingsTab />, { wrapper: createWrapper() });

      expect(screen.getByText('Notificaciones')).toBeInTheDocument();
      expect(
        screen.getByText(/configuración de notificaciones disponible próximamente/i)
      ).toBeInTheDocument();
    });

    it('should render privacy section', () => {
      render(<SettingsTab />, { wrapper: createWrapper() });

      expect(screen.getByText('Privacidad')).toBeInTheDocument();
      expect(
        screen.getByText(/opciones de privacidad disponibles próximamente/i)
      ).toBeInTheDocument();
    });

    it('should render danger zone section', () => {
      render(<SettingsTab />, { wrapper: createWrapper() });

      expect(screen.getByText('Zona Peligrosa')).toBeInTheDocument();
    });

    it('should render delete account button', () => {
      render(<SettingsTab />, { wrapper: createWrapper() });

      expect(screen.getByRole('button', { name: /eliminar cuenta/i })).toBeInTheDocument();
    });

    it('should show warning message in danger zone', () => {
      render(<SettingsTab />, { wrapper: createWrapper() });

      expect(
        screen.getByText(/una vez que elimines tu cuenta, no hay vuelta atrás/i)
      ).toBeInTheDocument();
    });
  });

  describe('Delete Account Modal', () => {
    it('should open modal when delete button is clicked', async () => {
      const user = userEvent.setup();
      render(<SettingsTab />, { wrapper: createWrapper() });

      const deleteButton = screen.getByRole('button', { name: /eliminar cuenta/i });
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText('¿Estás absolutamente seguro?')).toBeInTheDocument();
      });
    });

    it('should show confirmation message in modal', async () => {
      const user = userEvent.setup();
      render(<SettingsTab />, { wrapper: createWrapper() });

      const deleteButton = screen.getByRole('button', { name: /eliminar cuenta/i });
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText(/esta acción no se puede deshacer/i)).toBeInTheDocument();
      });
    });

    it('should show input for confirmation text', async () => {
      const user = userEvent.setup();
      render(<SettingsTab />, { wrapper: createWrapper() });

      const deleteButton = screen.getByRole('button', { name: /eliminar cuenta/i });
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('ELIMINAR MI CUENTA')).toBeInTheDocument();
      });
    });

    it('should close modal when cancel is clicked', async () => {
      const user = userEvent.setup();
      render(<SettingsTab />, { wrapper: createWrapper() });

      const deleteButton = screen.getByRole('button', { name: /eliminar cuenta/i });
      await user.click(deleteButton);

      const cancelButton = await screen.findByRole('button', { name: /cancelar/i });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByText('¿Estás absolutamente seguro?')).not.toBeInTheDocument();
      });
    });
  });

  describe('Delete Account Form Validation', () => {
    it('should show validation error for empty confirmation text', async () => {
      const user = userEvent.setup();
      render(<SettingsTab />, { wrapper: createWrapper() });

      const deleteButton = screen.getByRole('button', { name: /eliminar cuenta/i });
      await user.click(deleteButton);

      const confirmButton = await screen.findByRole('button', {
        name: /sí, eliminar mi cuenta/i,
      });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText(/debes escribir el texto de confirmación/i)).toBeInTheDocument();
      });
    });

    it('should show validation error for incorrect confirmation text', async () => {
      const user = userEvent.setup();
      render(<SettingsTab />, { wrapper: createWrapper() });

      const deleteButton = screen.getByRole('button', { name: /eliminar cuenta/i });
      await user.click(deleteButton);

      const confirmationInput = await screen.findByPlaceholderText('ELIMINAR MI CUENTA');
      await user.type(confirmationInput, 'WRONG TEXT');

      const confirmButton = screen.getByRole('button', { name: /sí, eliminar mi cuenta/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(
          screen.getByText(/debes escribir exactamente: eliminar mi cuenta/i)
        ).toBeInTheDocument();
      });
    });

    it('should call deleteAccount with correct text', async () => {
      const user = userEvent.setup();
      render(<SettingsTab />, { wrapper: createWrapper() });

      const deleteButton = screen.getByRole('button', { name: /eliminar cuenta/i });
      await user.click(deleteButton);

      const confirmationInput = await screen.findByPlaceholderText('ELIMINAR MI CUENTA');
      await user.type(confirmationInput, 'ELIMINAR MI CUENTA');

      const confirmButton = screen.getByRole('button', { name: /sí, eliminar mi cuenta/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(mockDeleteAccount).toHaveBeenCalledWith(1, expect.any(Object));
      });
    });

    it('should be case-sensitive for confirmation text', async () => {
      const user = userEvent.setup();
      render(<SettingsTab />, { wrapper: createWrapper() });

      const deleteButton = screen.getByRole('button', { name: /eliminar cuenta/i });
      await user.click(deleteButton);

      const confirmationInput = await screen.findByPlaceholderText('ELIMINAR MI CUENTA');
      await user.type(confirmationInput, 'eliminar mi cuenta');

      const confirmButton = screen.getByRole('button', { name: /sí, eliminar mi cuenta/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(
          screen.getByText(/debes escribir exactamente: eliminar mi cuenta/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper label for confirmation input', async () => {
      const user = userEvent.setup();
      render(<SettingsTab />, { wrapper: createWrapper() });

      const deleteButton = screen.getByRole('button', { name: /eliminar cuenta/i });
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/para confirmar, escribe:/i)).toBeInTheDocument();
      });
    });

    it('should set aria-invalid on input with error', async () => {
      const user = userEvent.setup();
      render(<SettingsTab />, { wrapper: createWrapper() });

      const deleteButton = screen.getByRole('button', { name: /eliminar cuenta/i });
      await user.click(deleteButton);

      const confirmButton = await screen.findByRole('button', {
        name: /sí, eliminar mi cuenta/i,
      });
      await user.click(confirmButton);

      const confirmationInput = screen.getByPlaceholderText('ELIMINAR MI CUENTA');
      await waitFor(() => {
        expect(confirmationInput).toHaveAttribute('aria-invalid', 'true');
      });
    });
  });
});
