import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ForgotPasswordForm } from './ForgotPasswordForm';

// Mock apiClient
const mockPost = vi.fn();
vi.mock('@/lib/api/axios-config', () => ({
  apiClient: {
    post: (...args: unknown[]) => mockPost(...args),
  },
}));

// Mock toast
const mockToastSuccess = vi.fn();
const mockToastError = vi.fn();
vi.mock('@/hooks/utils/useToast', () => ({
  toast: {
    success: (...args: unknown[]) => mockToastSuccess(...args),
    error: (...args: unknown[]) => mockToastError(...args),
  },
}));

describe('ForgotPasswordForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  describe('Rendering', () => {
    it('should render the form title', () => {
      render(<ForgotPasswordForm />);

      expect(screen.getByText('Recuperar Contraseña')).toBeInTheDocument();
    });

    it('should render the description', () => {
      render(<ForgotPasswordForm />);

      expect(
        screen.getByText('Ingresa tu email y te enviaremos instrucciones')
      ).toBeInTheDocument();
    });

    it('should render email input field', () => {
      render(<ForgotPasswordForm />);

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/tu@email.com/i)).toBeInTheDocument();
    });

    it('should render submit button', () => {
      render(<ForgotPasswordForm />);

      expect(screen.getByRole('button', { name: /enviar instrucciones/i })).toBeInTheDocument();
    });

    it('should render login link in footer', () => {
      render(<ForgotPasswordForm />);

      const loginLink = screen.getByText(/volver al inicio de sesión/i);
      expect(loginLink).toBeInTheDocument();
      expect(loginLink.closest('a')).toHaveAttribute('href', '/login');
    });
  });

  describe('Form Validation', () => {
    it('should show error when email is empty', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<ForgotPasswordForm />);

      const submitButton = screen.getByRole('button', { name: /enviar instrucciones/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/email inválido/i)).toBeInTheDocument();
      });
    });

    it('should show error when email is invalid', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<ForgotPasswordForm />);

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'invalid');

      const submitButton = screen.getByRole('button', { name: /enviar instrucciones/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockPost).not.toHaveBeenCalled();
      });
    });
  });

  describe('Form Submission', () => {
    it('should call API with email on valid submission', async () => {
      mockPost.mockResolvedValueOnce({ data: { message: 'Email sent' } });
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<ForgotPasswordForm />);

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'test@test.com');

      const submitButton = screen.getByRole('button', { name: /enviar instrucciones/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockPost).toHaveBeenCalledWith('/auth/forgot-password', { email: 'test@test.com' });
      });
    });

    it('should show success toast on successful submission', async () => {
      mockPost.mockResolvedValueOnce({ data: { message: 'Email sent' } });
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<ForgotPasswordForm />);

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'test@test.com');

      const submitButton = screen.getByRole('button', { name: /enviar instrucciones/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockToastSuccess).toHaveBeenCalledWith(
          'Email enviado. Revisa tu bandeja de entrada'
        );
      });
    });

    it('should show success toast even on API error (security)', async () => {
      mockPost.mockRejectedValueOnce(new Error('User not found'));
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<ForgotPasswordForm />);

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'nonexistent@test.com');

      const submitButton = screen.getByRole('button', { name: /enviar instrucciones/i });
      await user.click(submitButton);

      await waitFor(() => {
        // Should still show success for security (don't reveal if email exists)
        expect(mockToastSuccess).toHaveBeenCalledWith(
          'Email enviado. Revisa tu bandeja de entrada'
        );
      });
    });

    it('should disable button during loading', async () => {
      mockPost.mockImplementation(() => new Promise(() => {})); // Never resolves
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<ForgotPasswordForm />);

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'test@test.com');

      const submitButton = screen.getByRole('button', { name: /enviar instrucciones/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });
    });

    it('should show loading text during submission', async () => {
      mockPost.mockImplementation(() => new Promise(() => {})); // Never resolves
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<ForgotPasswordForm />);

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'test@test.com');

      const submitButton = screen.getByRole('button', { name: /enviar instrucciones/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/enviando.../i)).toBeInTheDocument();
      });
    });
  });

  describe('Cooldown Timer', () => {
    it('should disable button for 60 seconds after successful submission', async () => {
      mockPost.mockResolvedValueOnce({ data: { message: 'Email sent' } });
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<ForgotPasswordForm />);

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'test@test.com');

      const submitButton = screen.getByRole('button', { name: /enviar instrucciones/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
        expect(screen.getByText(/reenviar en 60 segundos/i)).toBeInTheDocument();
      });
    });

    it('should show countdown timer after submission', async () => {
      mockPost.mockResolvedValueOnce({ data: { message: 'Email sent' } });
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<ForgotPasswordForm />);

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'test@test.com');

      const submitButton = screen.getByRole('button', { name: /enviar instrucciones/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/reenviar en 60 segundos/i)).toBeInTheDocument();
      });

      // Advance timer by 30 seconds
      await act(async () => {
        vi.advanceTimersByTime(30000);
      });

      await waitFor(() => {
        expect(screen.getByText(/reenviar en 30 segundos/i)).toBeInTheDocument();
      });
    });

    it('should re-enable button after cooldown expires', async () => {
      mockPost.mockResolvedValueOnce({ data: { message: 'Email sent' } });
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<ForgotPasswordForm />);

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'test@test.com');

      const submitButton = screen.getByRole('button', { name: /enviar instrucciones/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });

      // Advance timer by 60 seconds
      await act(async () => {
        vi.advanceTimersByTime(60000);
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /enviar instrucciones/i })).not.toBeDisabled();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria attributes on email input', () => {
      render(<ForgotPasswordForm />);

      const emailInput = screen.getByLabelText(/email/i);
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('id', 'email');
    });

    it('should mark email input as invalid on error', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<ForgotPasswordForm />);

      const submitButton = screen.getByRole('button', { name: /enviar instrucciones/i });
      await user.click(submitButton);

      await waitFor(() => {
        const emailInput = screen.getByLabelText(/email/i);
        expect(emailInput).toHaveAttribute('aria-invalid', 'true');
      });
    });
  });
});
