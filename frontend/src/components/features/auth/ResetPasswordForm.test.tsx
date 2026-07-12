import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ResetPasswordForm } from './ResetPasswordForm';

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

// Mock router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

const VALID_TOKEN = 'a1b2c3d4e5f6';
const VALID_PASSWORD = 'NuevaPass123';

/** Rellena el formulario y lo envía */
async function fillAndSubmit(
  user: ReturnType<typeof userEvent.setup>,
  password: string = VALID_PASSWORD,
  confirmation: string = password
) {
  await user.type(screen.getByLabelText('Nueva contraseña'), password);
  await user.type(screen.getByLabelText('Repetir contraseña'), confirmation);
  await user.click(screen.getByRole('button', { name: /restablecer contraseña/i }));
}

describe('ResetPasswordForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPost.mockResolvedValue({ data: { message: 'Password reset successful' } });
  });

  describe('Enlace sin token', () => {
    it('should show an invalid link message when there is no token', () => {
      render(<ResetPasswordForm token={null} />);

      expect(screen.getByTestId('reset-password-invalid-link')).toBeInTheDocument();
      expect(screen.getByText(/enlace no es válido/i)).toBeInTheDocument();
    });

    it('should not render the form when there is no token', () => {
      render(<ResetPasswordForm token={null} />);

      expect(screen.queryByLabelText('Nueva contraseña')).not.toBeInTheDocument();
    });

    it('should offer a link to request a new email when there is no token', () => {
      render(<ResetPasswordForm token={null} />);

      expect(screen.getByRole('link', { name: /solicitar un enlace nuevo/i })).toHaveAttribute(
        'href',
        '/recuperar-password'
      );
    });
  });

  describe('Rendering', () => {
    it('should render the form with both password fields', () => {
      render(<ResetPasswordForm token={VALID_TOKEN} />);

      expect(screen.getByTestId('reset-password-form')).toBeInTheDocument();
      expect(screen.getByLabelText('Nueva contraseña')).toBeInTheDocument();
      expect(screen.getByLabelText('Repetir contraseña')).toBeInTheDocument();
    });
  });

  describe('Validación', () => {
    it('should reject a password shorter than 8 characters', async () => {
      const user = userEvent.setup();
      render(<ResetPasswordForm token={VALID_TOKEN} />);

      await fillAndSubmit(user, 'Corta1');

      // Texto exacto: el copy de ayuda del formulario también menciona los 8 caracteres
      expect(await screen.findByText('Mínimo 8 caracteres')).toBeInTheDocument();
      expect(mockPost).not.toHaveBeenCalled();
    });

    it('should reject a password without an uppercase letter or a number', async () => {
      const user = userEvent.setup();
      render(<ResetPasswordForm token={VALID_TOKEN} />);

      await fillAndSubmit(user, 'sinmayusculas');

      expect(
        await screen.findByText(/debe incluir al menos una mayúscula y un número/i)
      ).toBeInTheDocument();
      expect(mockPost).not.toHaveBeenCalled();
    });

    it('should reject when the confirmation does not match', async () => {
      const user = userEvent.setup();
      render(<ResetPasswordForm token={VALID_TOKEN} />);

      await fillAndSubmit(user, VALID_PASSWORD, 'OtraPass123');

      expect(await screen.findByText(/las contraseñas no coinciden/i)).toBeInTheDocument();
      expect(mockPost).not.toHaveBeenCalled();
    });
  });

  describe('Envío', () => {
    it('should send the token and the new password to the API', async () => {
      const user = userEvent.setup();
      render(<ResetPasswordForm token={VALID_TOKEN} />);

      await fillAndSubmit(user);

      await waitFor(() => {
        expect(mockPost).toHaveBeenCalledWith('/auth/reset-password', {
          token: VALID_TOKEN,
          newPassword: VALID_PASSWORD,
        });
      });
    });

    it('should redirect to login with a success toast', async () => {
      const user = userEvent.setup();
      render(<ResetPasswordForm token={VALID_TOKEN} />);

      await fillAndSubmit(user);

      await waitFor(() => {
        expect(mockToastSuccess).toHaveBeenCalled();
        expect(mockPush).toHaveBeenCalledWith('/login');
      });
    });

    it('should show an expired-link error when the API answers 400', async () => {
      const user = userEvent.setup();
      mockPost.mockRejectedValue({ response: { status: 400 } });
      render(<ResetPasswordForm token={VALID_TOKEN} />);

      await fillAndSubmit(user);

      expect(await screen.findByRole('alert')).toHaveTextContent(/expiró|ya fue usado/i);
      expect(mockPush).not.toHaveBeenCalled();
    });

    it('should offer a link to request a new email when the token is rejected', async () => {
      const user = userEvent.setup();
      mockPost.mockRejectedValue({ response: { status: 400 } });
      render(<ResetPasswordForm token={VALID_TOKEN} />);

      await fillAndSubmit(user);

      await waitFor(() => {
        expect(screen.getByRole('link', { name: /solicitar un enlace nuevo/i })).toHaveAttribute(
          'href',
          '/recuperar-password'
        );
      });
    });

    it('should show a generic error on server failure', async () => {
      const user = userEvent.setup();
      mockPost.mockRejectedValue({ response: { status: 500 } });
      render(<ResetPasswordForm token={VALID_TOKEN} />);

      await fillAndSubmit(user);

      expect(await screen.findByRole('alert')).toHaveTextContent(/intentá de nuevo más tarde/i);
      expect(mockPush).not.toHaveBeenCalled();
    });

    it('should disable the submit button while submitting', async () => {
      const user = userEvent.setup();
      let resolvePost: (value: unknown) => void = () => {};
      mockPost.mockImplementation(
        () =>
          new Promise((resolve) => {
            resolvePost = resolve;
          })
      );
      render(<ResetPasswordForm token={VALID_TOKEN} />);

      await fillAndSubmit(user);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /restableciendo/i })).toBeDisabled();
      });

      resolvePost({ data: {} });
    });
  });
});
