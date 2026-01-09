import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AccountTab } from './AccountTab';
import type { UserProfile } from '@/types';

// Mock hooks
const mockUpdateProfile = vi.fn();
const mockUpdatePassword = vi.fn();

vi.mock('@/hooks/api/useUser', () => ({
  useUpdateProfile: vi.fn(() => ({
    mutate: mockUpdateProfile,
    isPending: false,
  })),
  useUpdatePassword: vi.fn(() => ({
    mutate: mockUpdatePassword,
    isPending: false,
  })),
}));

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Note: Backend still sends limit fields for backward compatibility,
// but components should use useUserCapabilities() hook instead of these fields
const mockProfile: UserProfile = {
  id: 1,
  email: 'test@example.com',
  name: 'Test User',
  roles: ['consumer'],
  plan: 'free',
  // Backend sends these but components should use useUserCapabilities()
  dailyCardCount: 0,
  dailyCardLimit: 1,
  tarotReadingsCount: 0,
  tarotReadingsLimit: 1,
  dailyReadingsCount: 0,
  dailyReadingsLimit: 1,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  profilePicture: undefined,
  lastLogin: null,
};

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

describe('AccountTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Profile Form', () => {
    it('should render profile form with user data', () => {
      render(<AccountTab profile={mockProfile} />, { wrapper: createWrapper() });

      expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
      expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
    });

    it('should disable email input', () => {
      render(<AccountTab profile={mockProfile} />, { wrapper: createWrapper() });

      const emailInput = screen.getByDisplayValue('test@example.com');
      expect(emailInput).toBeDisabled();
    });

    it('should show message that email cannot be modified', () => {
      render(<AccountTab profile={mockProfile} />, { wrapper: createWrapper() });

      expect(screen.getByText('El email no puede ser modificado')).toBeInTheDocument();
    });

    it('should submit profile form with valid data', async () => {
      const user = userEvent.setup();
      render(<AccountTab profile={mockProfile} />, { wrapper: createWrapper() });

      const nameInput = screen.getByLabelText(/^nombre$/i);
      await user.clear(nameInput);
      await user.type(nameInput, 'Updated Name');

      const submitButton = screen.getAllByRole('button', { name: /guardar cambios/i })[0];
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockUpdateProfile).toHaveBeenCalledWith(
          { name: 'Updated Name', email: 'test@example.com' },
          expect.any(Object)
        );
      });
    });

    it('should show validation error for empty name', async () => {
      const user = userEvent.setup();
      render(<AccountTab profile={mockProfile} />, { wrapper: createWrapper() });

      const nameInput = screen.getByLabelText(/^nombre$/i);
      await user.clear(nameInput);

      const submitButton = screen.getAllByRole('button', { name: /guardar cambios/i })[0];
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/mínimo 3 caracteres/i)).toBeInTheDocument();
      });
    });

    it('should show error message for invalid name', async () => {
      const user = userEvent.setup();
      render(<AccountTab profile={mockProfile} />, { wrapper: createWrapper() });

      const nameInput = screen.getByLabelText(/^nombre$/i);
      await user.clear(nameInput);
      await user.type(nameInput, 'ab');

      const submitButton = screen.getByRole('button', { name: /guardar cambios/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/mínimo 3 caracteres/i)).toBeInTheDocument();
      });
    });
  });

  describe('Password Form', () => {
    it('should render password form fields', () => {
      render(<AccountTab profile={mockProfile} />, { wrapper: createWrapper() });

      expect(screen.getByLabelText(/contraseña actual/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^nueva contraseña$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirmar nueva contraseña/i)).toBeInTheDocument();
    });

    it('should submit password form with valid data', async () => {
      const user = userEvent.setup();
      render(<AccountTab profile={mockProfile} />, { wrapper: createWrapper() });

      const currentPasswordInput = screen.getByLabelText(/contraseña actual/i);
      const newPasswordInput = screen.getByLabelText(/^nueva contraseña$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirmar nueva contraseña/i);

      await user.type(currentPasswordInput, 'OldPassword123!');
      await user.type(newPasswordInput, 'NewPassword123!');
      await user.type(confirmPasswordInput, 'NewPassword123!');

      const submitButton = screen.getByRole('button', { name: /actualizar contraseña/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockUpdatePassword).toHaveBeenCalledWith(
          {
            currentPassword: 'OldPassword123!',
            newPassword: 'NewPassword123!',
          },
          expect.any(Object)
        );
      });
    });

    it('should show validation error for empty current password', async () => {
      const user = userEvent.setup();
      render(<AccountTab profile={mockProfile} />, { wrapper: createWrapper() });

      const newPasswordInput = screen.getByLabelText(/^nueva contraseña$/i);
      await user.type(newPasswordInput, 'NewPassword123!');

      const submitButton = screen.getByRole('button', { name: /actualizar contraseña/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/la contraseña actual es requerida/i)).toBeInTheDocument();
      });
    });

    it('should show validation error for weak new password', async () => {
      const user = userEvent.setup();
      render(<AccountTab profile={mockProfile} />, { wrapper: createWrapper() });

      const currentPasswordInput = screen.getByLabelText(/contraseña actual/i);
      const newPasswordInput = screen.getByLabelText(/^nueva contraseña$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirmar nueva contraseña/i);

      await user.type(currentPasswordInput, 'OldPassword123!');
      await user.type(newPasswordInput, 'weak');
      await user.type(confirmPasswordInput, 'weak');

      const submitButton = screen.getByRole('button', { name: /actualizar contraseña/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/mínimo 8 caracteres/i)).toBeInTheDocument();
      });
    });

    it('should show validation error when passwords do not match', async () => {
      const user = userEvent.setup();
      render(<AccountTab profile={mockProfile} />, { wrapper: createWrapper() });

      const currentPasswordInput = screen.getByLabelText(/contraseña actual/i);
      const newPasswordInput = screen.getByLabelText(/^nueva contraseña$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirmar nueva contraseña/i);

      await user.type(currentPasswordInput, 'OldPassword123!');
      await user.type(newPasswordInput, 'NewPassword123!');
      await user.type(confirmPasswordInput, 'DifferentPassword123!');

      const submitButton = screen.getByRole('button', { name: /actualizar contraseña/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/las contraseñas no coinciden/i)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for all inputs', () => {
      render(<AccountTab profile={mockProfile} />, { wrapper: createWrapper() });

      expect(screen.getByLabelText(/^nombre$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/contraseña actual/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^nueva contraseña$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirmar nueva contraseña/i)).toBeInTheDocument();
    });

    it('should set aria-invalid on inputs with errors', async () => {
      const user = userEvent.setup();
      render(<AccountTab profile={mockProfile} />, { wrapper: createWrapper() });

      const nameInput = screen.getByLabelText(/^nombre$/i);
      await user.clear(nameInput);

      const submitButton = screen.getAllByRole('button', { name: /guardar cambios/i })[0];
      await user.click(submitButton);

      await waitFor(() => {
        expect(nameInput).toHaveAttribute('aria-invalid', 'true');
      });
    });
  });

  describe('Accessibility - Password Form', () => {
    it('should have proper autocomplete attributes on password fields', () => {
      render(<AccountTab profile={mockProfile} />, { wrapper: createWrapper() });

      const currentPasswordInput = screen.getByLabelText(/contraseña actual/i);
      const newPasswordInput = screen.getByLabelText(/^nueva contraseña$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirmar nueva contraseña/i);

      expect(currentPasswordInput).toHaveAttribute('autocomplete', 'current-password');
      expect(newPasswordInput).toHaveAttribute('autocomplete', 'new-password');
      expect(confirmPasswordInput).toHaveAttribute('autocomplete', 'new-password');
    });
  });
});
