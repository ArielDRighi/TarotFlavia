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
        expect(mockLogin).toHaveBeenCalledWith('test@test.com', 'password123');
      });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/perfil');
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

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Email ya registrado');
      });
    });

    it('should show generic error toast when error has no message', async () => {
      mockRegister.mockRejectedValueOnce(new Error());
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
        expect(toast.error).toHaveBeenCalledWith('Error al crear la cuenta');
      });
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
  });
});
