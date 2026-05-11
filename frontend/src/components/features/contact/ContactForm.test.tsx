import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from '@/hooks/utils/useToast';
import { ContactForm } from './ContactForm';

vi.mock('@/hooks/utils/useToast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    dismiss: vi.fn(),
  },
  useToast: () => ({
    toast: {
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
      dismiss: vi.fn(),
    },
  }),
}));

describe('ContactForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render all form fields', () => {
      render(<ContactForm />);

      expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/asunto/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/mensaje/i)).toBeInTheDocument();
    });

    it('should render submit button', () => {
      render(<ContactForm />);
      expect(screen.getByRole('button', { name: /enviar mensaje/i })).toBeInTheDocument();
    });

    it('should have placeholder texts', () => {
      render(<ContactForm />);

      expect(screen.getByPlaceholderText('Tu nombre completo')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('tu@email.com')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('¿Sobre qué quieres contactarnos?')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Escribe tu mensaje aquí...')).toBeInTheDocument();
    });

    it('should render icons for name, email, and subject fields', () => {
      const { container } = render(<ContactForm />);
      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThanOrEqual(3);
    });

    it('should have required attributes on inputs', () => {
      render(<ContactForm />);

      const nameInput = screen.getByLabelText(/nombre/i);
      const emailInput = screen.getByLabelText(/correo electrónico/i);
      const subjectInput = screen.getByLabelText(/asunto/i);
      const messageInput = screen.getByLabelText(/mensaje/i);

      expect(nameInput).toHaveAttribute('id', 'name');
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('id', 'email');
      expect(subjectInput).toHaveAttribute('id', 'subject');
      expect(messageInput).toHaveAttribute('id', 'message');
    });

    it('should render form with proper HTML structure', () => {
      const { container } = render(<ContactForm />);
      const form = container.querySelector('form');
      expect(form).toBeInTheDocument();
      expect(form).toHaveClass('space-y-6');
    });
  });

  describe('Form Structure', () => {
    it('should use React Hook Form integration', () => {
      render(<ContactForm />);
      const form = screen.getByRole('button', { name: /enviar mensaje/i }).closest('form');
      expect(form).toBeInTheDocument();
    });

    it('should have proper label associations', () => {
      render(<ContactForm />);

      expect(screen.getByText('Nombre')).toBeInTheDocument();
      expect(screen.getByText(/correo electrónico/i)).toBeInTheDocument();
      expect(screen.getByText('Asunto')).toBeInTheDocument();
      expect(screen.getByText('Mensaje')).toBeInTheDocument();
    });
  });

  describe('Submission feedback', () => {
    const SUBMIT_TIMEOUT = 5000;

    const fillAndSubmit = async () => {
      const user = userEvent.setup();
      await user.type(screen.getByLabelText(/nombre/i), 'Ana García');
      await user.type(screen.getByLabelText(/correo electrónico/i), 'ana@example.com');
      await user.type(screen.getByLabelText(/asunto/i), 'Consulta de prueba');
      await user.type(screen.getByLabelText(/mensaje/i), 'Este es un mensaje de prueba.');
      await user.click(screen.getByRole('button', { name: /enviar mensaje/i }));
    };

    it('should call toast.success after successful submission', async () => {
      render(<ContactForm />);
      await fillAndSubmit();

      await waitFor(
        () => {
          expect(toast.success).toHaveBeenCalledWith(
            '¡Mensaje enviado exitosamente! Nos pondremos en contacto contigo pronto.'
          );
        },
        { timeout: SUBMIT_TIMEOUT }
      );
    });

    it('should NOT render inline success banner after submission', async () => {
      render(<ContactForm />);
      await fillAndSubmit();

      await waitFor(() => expect(toast.success).toHaveBeenCalled(), { timeout: SUBMIT_TIMEOUT });
      expect(screen.queryByText(/¡mensaje enviado exitosamente!/i)).not.toBeInTheDocument();
    });

    it('should reset the form after successful submission', async () => {
      render(<ContactForm />);
      const nameInput = screen.getByLabelText(/nombre/i);
      await fillAndSubmit();

      await waitFor(() => expect(nameInput).toHaveValue(''), { timeout: SUBMIT_TIMEOUT });
    });

    it('should NOT show inline alert initially', () => {
      render(<ContactForm />);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('should show loading state during submission', async () => {
      render(<ContactForm />);
      const user = userEvent.setup();
      await user.type(screen.getByLabelText(/nombre/i), 'Ana García');
      await user.type(screen.getByLabelText(/correo electrónico/i), 'ana@example.com');
      await user.type(screen.getByLabelText(/asunto/i), 'Consulta de prueba');
      await user.type(screen.getByLabelText(/mensaje/i), 'Este es un mensaje de prueba.');

      // Click without awaiting so we can observe the in-flight loading state
      void user.click(screen.getByRole('button', { name: /enviar mensaje/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /enviando/i })).toBeDisabled();
      });

      // Wait for submission to complete to avoid async leaks
      await waitFor(() => expect(toast.success).toHaveBeenCalled(), { timeout: SUBMIT_TIMEOUT });
    });
  });
});
