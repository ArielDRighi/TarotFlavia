import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '@/components/features/auth';

/**
 * SMOKE TESTS - Login Flow
 *
 * Pruebas básicas para verificar que el flujo de autenticación funciona.
 * Estos tests son rápidos y simples, enfocados en la funcionalidad crítica.
 */

// Mock useAuth hook
const mockLogin = vi.fn();
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    login: mockLogin,
    isLoading: false,
    register: vi.fn(),
    user: null,
    isAuthenticated: false,
    logout: vi.fn(),
    checkAuth: vi.fn(),
  })),
}));

// Mock useRouter
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: mockPush,
  })),
}));

// Mock toast
vi.mock('@/hooks/utils/useToast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('Login Flow - Smoke Tests', () => {
  describe('Formulario de Login', () => {
    it('should render email and password fields', () => {
      render(<LoginForm />);

      // Verificar que los campos email y password están presentes
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/contraseña/i);

      expect(emailInput).toBeInTheDocument();
      expect(passwordInput).toBeInTheDocument();
    });

    it('should render submit button', () => {
      render(<LoginForm />);

      // Verificar que el botón de submit está presente
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toHaveAttribute('type', 'submit');
    });
  });

  describe('Validación de Formulario', () => {
    it('should show error when email is invalid', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      // Intentar submit con email vacío
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
      await user.click(submitButton);

      // Esperar a que aparezca el error de validación
      await waitFor(() => {
        expect(screen.getByText(/email inválido/i)).toBeInTheDocument();
      });
    });

    it('should show error when password is too short', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      // Llenar email válido pero dejar password vacío
      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'test@test.com');

      // Intentar submit sin password
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
      await user.click(submitButton);

      // Esperar a que aparezca el error de validación
      await waitFor(() => {
        expect(screen.getByText(/la contraseña es requerida/i)).toBeInTheDocument();
      });
    });
  });
});
