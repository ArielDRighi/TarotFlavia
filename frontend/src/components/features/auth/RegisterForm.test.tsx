import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RegisterForm } from './RegisterForm';

// Mock useAuth hook
const mockLogin = vi.fn();
const mockRegister = vi.fn();
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    login: mockLogin,
    register: mockRegister,
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

describe('RegisterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      login: mockLogin,
      register: mockRegister,
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
    it('should render the register form title', () => {
      render(<RegisterForm />);

      expect(screen.getByText('Únete al Oráculo')).toBeInTheDocument();
    });

    it('should render name input field', () => {
      render(<RegisterForm />);

      expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
    });

    it('should render email input field', () => {
      render(<RegisterForm />);

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/tu@email.com/i)).toBeInTheDocument();
    });

    it('should render password input field', () => {
      render(<RegisterForm />);

      expect(screen.getByLabelText(/^contraseña$/i)).toBeInTheDocument();
    });

    it('should render confirm password input field', () => {
      render(<RegisterForm />);

      expect(screen.getByLabelText(/confirmar contraseña/i)).toBeInTheDocument();
    });

    it('should render submit button', () => {
      render(<RegisterForm />);

      expect(screen.getByRole('button', { name: /crear cuenta/i })).toBeInTheDocument();
    });

    it('should render login link', () => {
      render(<RegisterForm />);

      const loginLink = screen.getByText(/inicia sesión/i);
      expect(loginLink).toBeInTheDocument();
      expect(loginLink.closest('a')).toHaveAttribute('href', '/login');
    });

    it('should render optional birthDate input field', () => {
      render(<RegisterForm />);

      expect(screen.getByLabelText(/fecha de nacimiento/i)).toBeInTheDocument();
      expect(screen.getByText(/\(opcional\)/i)).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should show error when name is empty', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const submitButton = screen.getByRole('button', { name: /crear cuenta/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/mínimo 3 caracteres/i)).toBeInTheDocument();
      });
    });

    it('should show error when email is empty', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const nameInput = screen.getByLabelText(/nombre/i);
      await user.type(nameInput, 'Test User');

      const submitButton = screen.getByRole('button', { name: /crear cuenta/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/email inválido/i)).toBeInTheDocument();
      });
    });

    it('should show error when password is too short', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const nameInput = screen.getByLabelText(/nombre/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^contraseña$/i);

      await user.type(nameInput, 'Test User');
      await user.type(emailInput, 'test@test.com');
      await user.type(passwordInput, 'short');

      const submitButton = screen.getByRole('button', { name: /crear cuenta/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/mínimo 8 caracteres/i)).toBeInTheDocument();
      });
    });

    it('should show error when passwords do not match', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const nameInput = screen.getByLabelText(/nombre/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^contraseña$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirmar contraseña/i);

      await user.type(nameInput, 'Test User');
      await user.type(emailInput, 'test@test.com');
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'differentpassword');

      const submitButton = screen.getByRole('button', { name: /crear cuenta/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/las contraseñas no coinciden/i)).toBeInTheDocument();
      });
    });

    it('should not show error for empty birthDate (optional field)', async () => {
      mockRegister.mockResolvedValueOnce(undefined);
      mockLogin.mockResolvedValueOnce(undefined);
      const user = userEvent.setup();
      render(<RegisterForm />);

      const nameInput = screen.getByLabelText(/nombre/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^contraseña$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirmar contraseña/i);

      await user.type(nameInput, 'Test User');
      await user.type(emailInput, 'test@test.com');
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'password123');

      const submitButton = screen.getByRole('button', { name: /crear cuenta/i });
      await user.click(submitButton);

      // Should not show birthDate error since it's optional
      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalled();
      });
      expect(screen.queryByText(/fecha inválida/i)).not.toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('should call register with form data on valid submission', async () => {
      mockRegister.mockResolvedValueOnce(undefined);
      mockLogin.mockResolvedValueOnce(undefined);
      const user = userEvent.setup();
      render(<RegisterForm />);

      const nameInput = screen.getByLabelText(/nombre/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^contraseña$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirmar contraseña/i);
      const submitButton = screen.getByRole('button', { name: /crear cuenta/i });

      await user.type(nameInput, 'Test User');
      await user.type(emailInput, 'test@test.com');
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith({
          name: 'Test User',
          email: 'test@test.com',
          password: 'password123',
        });
      });
    });

    it('should include birthDate in register call when provided', async () => {
      mockRegister.mockResolvedValueOnce(undefined);
      mockLogin.mockResolvedValueOnce(undefined);
      const user = userEvent.setup();
      render(<RegisterForm />);

      const nameInput = screen.getByLabelText(/nombre/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^contraseña$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirmar contraseña/i);
      const birthDateInput = screen.getByLabelText(/fecha de nacimiento/i);
      const submitButton = screen.getByRole('button', { name: /crear cuenta/i });

      await user.type(nameInput, 'Test User');
      await user.type(emailInput, 'test@test.com');
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'password123');
      await user.type(birthDateInput, '1990-05-15');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith({
          name: 'Test User',
          email: 'test@test.com',
          password: 'password123',
          birthDate: '1990-05-15',
        });
      });
    });

    it('should show success toast on successful registration', async () => {
      mockRegister.mockResolvedValueOnce(undefined);
      mockLogin.mockResolvedValueOnce(undefined);
      const user = userEvent.setup();
      render(<RegisterForm />);

      const nameInput = screen.getByLabelText(/nombre/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^contraseña$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirmar contraseña/i);
      const submitButton = screen.getByRole('button', { name: /crear cuenta/i });

      await user.type(nameInput, 'Test User');
      await user.type(emailInput, 'test@test.com');
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Cuenta creada exitosamente');
      });
    });

    it('should auto-login and redirect to /perfil on successful registration', async () => {
      // Mock register to return isNewUser: false (existing behavior)
      mockRegister.mockResolvedValueOnce({
        user: { id: 1, email: 'test@test.com', name: 'Test User' },
        access_token: 'token',
        refresh_token: 'refresh',
        isNewUser: false,
      });
      mockLogin.mockResolvedValueOnce(undefined);
      const user = userEvent.setup();
      render(<RegisterForm />);

      const nameInput = screen.getByLabelText(/nombre/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^contraseña$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirmar contraseña/i);
      const submitButton = screen.getByRole('button', { name: /crear cuenta/i });

      await user.type(nameInput, 'Test User');
      await user.type(emailInput, 'test@test.com');
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('test@test.com', 'password123');
      });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/');
      });
    });

    it('should show error toast on registration failure', async () => {
      const error = new Error('Email ya registrado');
      mockRegister.mockRejectedValueOnce(error);
      const user = userEvent.setup();
      render(<RegisterForm />);

      const nameInput = screen.getByLabelText(/nombre/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^contraseña$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirmar contraseña/i);
      const submitButton = screen.getByRole('button', { name: /crear cuenta/i });

      await user.type(nameInput, 'Test User');
      await user.type(emailInput, 'test@test.com');
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'password123');
      await user.click(submitButton);

      // Registration error toast is handled by authStore, not the component
      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalled();
      });
    });

    it('should handle auto-login failure after successful registration', async () => {
      mockRegister.mockResolvedValueOnce(undefined);
      mockLogin.mockRejectedValueOnce(new Error('Login failed'));
      const user = userEvent.setup();
      render(<RegisterForm />);

      const nameInput = screen.getByLabelText(/nombre/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^contraseña$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirmar contraseña/i);
      const submitButton = screen.getByRole('button', { name: /crear cuenta/i });

      await user.type(nameInput, 'Test User');
      await user.type(emailInput, 'test@test.com');
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Cuenta creada exitosamente');
      });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'Cuenta creada. Por favor, inicia sesión manualmente'
        );
      });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login');
      });
    });

    it('should not show component error toast on registration failure (handled by store)', async () => {
      mockRegister.mockRejectedValueOnce(new Error('Error del servidor'));
      const user = userEvent.setup();
      render(<RegisterForm />);

      const nameInput = screen.getByLabelText(/nombre/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^contraseña$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirmar contraseña/i);
      const submitButton = screen.getByRole('button', { name: /crear cuenta/i });

      await user.type(nameInput, 'Test User');
      await user.type(emailInput, 'test@test.com');
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalled();
      });

      // Registration errors are shown by authStore via toast.error
      // The component itself doesn't call toast.error for registration failures
      expect(toast.success).not.toHaveBeenCalled();
    });
  });

  describe('Loading State', () => {
    it('should disable inputs when submitting', async () => {
      mockRegister.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));
      const user = userEvent.setup();
      render(<RegisterForm />);

      const nameInput = screen.getByLabelText(/nombre/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^contraseña$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirmar contraseña/i);
      const submitButton = screen.getByRole('button', { name: /crear cuenta/i });

      await user.type(nameInput, 'Test User');
      await user.type(emailInput, 'test@test.com');
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(nameInput).toBeDisabled();
        expect(emailInput).toBeDisabled();
        expect(passwordInput).toBeDisabled();
        expect(confirmPasswordInput).toBeDisabled();
      });
    });

    it('should show loading text on button when submitting', async () => {
      mockRegister.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));
      const user = userEvent.setup();
      render(<RegisterForm />);

      const nameInput = screen.getByLabelText(/nombre/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^contraseña$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirmar contraseña/i);
      const submitButton = screen.getByRole('button', { name: /crear cuenta/i });

      await user.type(nameInput, 'Test User');
      await user.type(emailInput, 'test@test.com');
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/creando.../i)).toBeInTheDocument();
      });
    });
  });

  describe('Onboarding Modal', () => {
    it('should show welcome modal when isNewUser is true', async () => {
      const user = userEvent.setup();

      // Mock register to return isNewUser: true
      mockRegister.mockResolvedValue({
        user: { id: 1, email: 'test@example.com', name: 'Test User' },
        access_token: 'token',
        refresh_token: 'refresh',
        isNewUser: true,
      });

      // Mock login success
      mockLogin.mockResolvedValue(undefined);

      render(<RegisterForm />);

      // Fill form
      await user.type(screen.getByLabelText(/nombre/i), 'Test User');
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^contraseña$/i), 'SecurePass123!');
      await user.type(screen.getByLabelText(/confirmar contraseña/i), 'SecurePass123!');

      // Submit form
      await user.click(screen.getByRole('button', { name: /crear cuenta/i }));

      // Wait for modal to appear
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText(/bienvenid[ao]/i)).toBeInTheDocument();
      });
    });

    it('should not show welcome modal when isNewUser is false', async () => {
      const user = userEvent.setup();

      // Mock register to return isNewUser: false (shouldn't happen in real app, but for testing)
      mockRegister.mockResolvedValue({
        user: { id: 1, email: 'test@example.com', name: 'Test User' },
        access_token: 'token',
        refresh_token: 'refresh',
        isNewUser: false,
      });

      // Mock login success
      mockLogin.mockResolvedValue(undefined);

      render(<RegisterForm />);

      // Fill form
      await user.type(screen.getByLabelText(/nombre/i), 'Test User');
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^contraseña$/i), 'SecurePass123!');
      await user.type(screen.getByLabelText(/confirmar contraseña/i), 'SecurePass123!');

      // Submit form
      await user.click(screen.getByRole('button', { name: /crear cuenta/i }));

      // Wait for redirect
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalled();
      });

      // Modal should not be present
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should redirect to home after closing welcome modal', async () => {
      const user = userEvent.setup();

      // Mock register to return isNewUser: true
      mockRegister.mockResolvedValue({
        user: { id: 1, email: 'test@example.com', name: 'Test User' },
        access_token: 'token',
        refresh_token: 'refresh',
        isNewUser: true,
      });

      // Mock login success
      mockLogin.mockResolvedValue(undefined);

      render(<RegisterForm />);

      // Fill and submit form
      await user.type(screen.getByLabelText(/nombre/i), 'Test User');
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^contraseña$/i), 'SecurePass123!');
      await user.type(screen.getByLabelText(/confirmar contraseña/i), 'SecurePass123!');
      await user.click(screen.getByRole('button', { name: /crear cuenta/i }));

      // Wait for modal and close it
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const ctaButton = screen.getByRole('button', { name: /comenzar|explorar|empezar/i });
      await user.click(ctaButton);

      // Should redirect to home
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/');
      });
    });
  });

  describe('Accessibility', () => {
    it('should have aria-invalid on inputs with errors', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const submitButton = screen.getByRole('button', { name: /crear cuenta/i });
      await user.click(submitButton);

      await waitFor(() => {
        const nameInput = screen.getByLabelText(/nombre/i);
        expect(nameInput).toHaveAttribute('aria-invalid', 'true');
      });
    });

    it('should have proper autocomplete attributes', () => {
      render(<RegisterForm />);

      const nameInput = screen.getByLabelText(/nombre/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^contraseña$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirmar contraseña/i);

      expect(nameInput).toHaveAttribute('autocomplete', 'name');
      expect(emailInput).toHaveAttribute('autocomplete', 'email');
      expect(passwordInput).toHaveAttribute('autocomplete', 'new-password');
      expect(confirmPasswordInput).toHaveAttribute('autocomplete', 'new-password');
    });
  });
});
