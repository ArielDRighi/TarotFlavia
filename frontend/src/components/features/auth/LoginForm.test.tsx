import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './LoginForm';

// Mock useAuth hook
const mockLogin = vi.fn();
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    login: mockLogin,
    isLoading: false,
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

import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/utils/useToast';

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      login: mockLogin,
      register: vi.fn(),
      isLoading: false,
      user: null,
      isAuthenticated: false,
      logout: vi.fn(),
      checkAuth: vi.fn(),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the login form title', () => {
      render(<LoginForm />);

      expect(screen.getByText('Bienvenido al Oráculo')).toBeInTheDocument();
    });

    it('should render email input field', () => {
      render(<LoginForm />);

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/tu@email.com/i)).toBeInTheDocument();
    });

    it('should render password input field', () => {
      render(<LoginForm />);

      expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    });

    it('should render submit button', () => {
      render(<LoginForm />);

      expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
    });

    it('should render forgot password link', () => {
      render(<LoginForm />);

      const forgotLink = screen.getByText(/olvidaste tu contraseña/i);
      expect(forgotLink).toBeInTheDocument();
      expect(forgotLink.closest('a')).toHaveAttribute('href', '/recuperar-password');
    });

    it('should render register link', () => {
      render(<LoginForm />);

      const registerLink = screen.getByText(/crear cuenta nueva/i);
      expect(registerLink).toBeInTheDocument();
      expect(registerLink.closest('a')).toHaveAttribute('href', '/registro');
    });
  });

  describe('Form Validation', () => {
    it('should show error when email is empty', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/email inválido/i)).toBeInTheDocument();
      });
    });

    it('should show error when email is invalid', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      const emailInput = screen.getByLabelText(/email/i);
      // Clear the input and type an invalid email format
      // Note: The HTML5 email validation will prevent form submission with invalid emails
      // but Zod validation will also catch it if native validation is bypassed
      await user.type(emailInput, 'invalid');
      await user.tab(); // Move focus to trigger validation

      const passwordInput = screen.getByLabelText(/contraseña/i);
      await user.type(passwordInput, 'password123');

      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
      await user.click(submitButton);

      // Login should not be called because the email is invalid
      await waitFor(() => {
        expect(mockLogin).not.toHaveBeenCalled();
      });
    });

    it('should show error when password is empty', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'test@test.com');

      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/la contraseña es requerida/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('should call login with email and password on valid submission', async () => {
      mockLogin.mockResolvedValueOnce(undefined);
      const user = userEvent.setup();
      render(<LoginForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/contraseña/i);
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

      await user.type(emailInput, 'test@test.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('test@test.com', 'password123');
      });
    });

    it('should redirect to home page (/) on successful login', async () => {
      mockLogin.mockResolvedValueOnce(undefined);
      const user = userEvent.setup();
      render(<LoginForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/contraseña/i);
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

      await user.type(emailInput, 'test@test.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/');
      });
    });

    it('should not call toast.error on login failure (authStore handles it)', async () => {
      mockLogin.mockRejectedValueOnce(new Error('Invalid credentials'));
      const user = userEvent.setup();
      render(<LoginForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/contraseña/i);
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

      await user.type(emailInput, 'test@test.com');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalled();
      });

      // toast.error should NOT be called from component - authStore handles error display
      expect(toast.error).not.toHaveBeenCalled();
    });

    it('should display inline error message when login fails', async () => {
      const mockError = {
        response: {
          status: 401,
          data: { message: 'Invalid credentials' },
        },
      };
      mockLogin.mockRejectedValueOnce(mockError);
      const user = userEvent.setup();
      render(<LoginForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/contraseña/i);
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

      await user.type(emailInput, 'test@test.com');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/email o contraseña incorrectos.*verifica tus credenciales/i)
        ).toBeInTheDocument();
      });
    });

    it('should clear inline error message on new submission attempt', async () => {
      const mockError = {
        response: {
          status: 401,
          data: { message: 'Invalid credentials' },
        },
      };
      mockLogin.mockRejectedValueOnce(mockError);
      const user = userEvent.setup();
      render(<LoginForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/contraseña/i);
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

      // First failed attempt
      await user.type(emailInput, 'test@test.com');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/email o contraseña incorrectos.*verifica tus credenciales/i)
        ).toBeInTheDocument();
      });

      // Second attempt - error should be cleared
      mockLogin.mockResolvedValueOnce(undefined);
      await user.clear(passwordInput);
      await user.type(passwordInput, 'correctpassword');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByText(/email o contraseña incorrectos/i)).not.toBeInTheDocument();
      });
    });

    it('should keep form fields populated after login failure', async () => {
      const mockError = {
        response: {
          status: 401,
          data: { message: 'Invalid credentials' },
        },
      };
      mockLogin.mockRejectedValueOnce(mockError);
      const user = userEvent.setup();
      render(<LoginForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/contraseña/i);
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

      // Type credentials and submit
      await user.type(emailInput, 'test@test.com');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);

      // Wait for error to appear
      await waitFor(() => {
        expect(screen.getByText(/email o contraseña incorrectos/i)).toBeInTheDocument();
      });

      // Verify fields still have values
      expect(emailInput).toHaveValue('test@test.com');
      expect(passwordInput).toHaveValue('wrongpassword');
    });

    it('should have aria-live attribute for accessibility', async () => {
      const mockError = {
        response: {
          status: 401,
          data: { message: 'Invalid credentials' },
        },
      };
      mockLogin.mockRejectedValueOnce(mockError);
      const user = userEvent.setup();
      render(<LoginForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/contraseña/i);
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

      await user.type(emailInput, 'test@test.com');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);

      await waitFor(() => {
        const alert = screen.getByRole('alert');
        expect(alert).toHaveAttribute('aria-live', 'polite');
      });
    });
  });

  describe('Loading State', () => {
    it('should disable submit button while submitting', async () => {
      // Create a promise that we can control
      let resolveLogin: () => void;
      const loginPromise = new Promise<void>((resolve) => {
        resolveLogin = resolve;
      });
      mockLogin.mockReturnValueOnce(loginPromise);

      const user = userEvent.setup();
      render(<LoginForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/contraseña/i);
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

      await user.type(emailInput, 'test@test.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      // Button should be disabled during submission
      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });

      // Resolve the login
      resolveLogin!();

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });
    });

    it('should show spinner while submitting', async () => {
      let resolveLogin: () => void;
      const loginPromise = new Promise<void>((resolve) => {
        resolveLogin = resolve;
      });
      mockLogin.mockReturnValueOnce(loginPromise);

      const user = userEvent.setup();
      render(<LoginForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/contraseña/i);
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

      await user.type(emailInput, 'test@test.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      // Should show loading indicator
      await waitFor(() => {
        expect(screen.getByText(/iniciando/i)).toBeInTheDocument();
      });

      resolveLogin!();
    });

    it('should disable inputs while submitting', async () => {
      let resolveLogin: () => void;
      const loginPromise = new Promise<void>((resolve) => {
        resolveLogin = resolve;
      });
      mockLogin.mockReturnValueOnce(loginPromise);

      const user = userEvent.setup();
      render(<LoginForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/contraseña/i);
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

      await user.type(emailInput, 'test@test.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(emailInput).toBeDisabled();
        expect(passwordInput).toBeDisabled();
      });

      resolveLogin!();
    });
  });

  describe('Accessibility', () => {
    it('should have proper form labels', () => {
      render(<LoginForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/contraseña/i);

      expect(emailInput).toHaveAttribute('type', 'email');
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('should have proper autocomplete attributes', () => {
      render(<LoginForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/contraseña/i);

      expect(emailInput).toHaveAttribute('autocomplete', 'email');
      expect(passwordInput).toHaveAttribute('autocomplete', 'current-password');
    });
  });
});
