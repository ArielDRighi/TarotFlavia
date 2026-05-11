import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { ContactForm } from './ContactForm';

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
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
      expect(icons.length).toBeGreaterThanOrEqual(3); // User, Mail, MessageSquare icons
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

      const nameLabel = screen.getByText('Nombre');
      const emailLabel = screen.getByText(/correo electrónico/i);
      const subjectLabel = screen.getByText('Asunto');
      const messageLabel = screen.getByText('Mensaje');

      expect(nameLabel).toBeInTheDocument();
      expect(emailLabel).toBeInTheDocument();
      expect(subjectLabel).toBeInTheDocument();
      expect(messageLabel).toBeInTheDocument();
    });
  });

  describe('Submission feedback', () => {
    const fillAndSubmit = async (user: ReturnType<typeof userEvent.setup>) => {
      await user.type(screen.getByLabelText(/nombre/i), 'Ana García');
      await user.type(screen.getByLabelText(/correo electrónico/i), 'ana@example.com');
      await user.type(screen.getByLabelText(/asunto/i), 'Consulta de prueba');
      await user.type(screen.getByLabelText(/mensaje/i), 'Este es un mensaje de prueba.');
      await user.click(screen.getByRole('button', { name: /enviar mensaje/i }));
    };

    it('should call toast.success after successful submission', async () => {
      const user = userEvent.setup();
      render(<ContactForm />);

      await fillAndSubmit(user);

      await waitFor(
        () => {
          expect(toast.success).toHaveBeenCalledWith(
            '¡Mensaje enviado exitosamente! Nos pondremos en contacto contigo pronto.'
          );
        },
        { timeout: 3000 }
      );
    }, 10000);

    it('should NOT render inline success banner after submission', async () => {
      const user = userEvent.setup();
      render(<ContactForm />);

      await fillAndSubmit(user);

      await waitFor(() => expect(toast.success).toHaveBeenCalled(), { timeout: 3000 });

      expect(screen.queryByText(/¡mensaje enviado exitosamente!/i)).not.toBeInTheDocument();
    }, 10000);

    it('should reset the form after successful submission', async () => {
      const user = userEvent.setup();
      render(<ContactForm />);

      const nameInput = screen.getByLabelText(/nombre/i);
      await fillAndSubmit(user);

      await waitFor(() => expect(toast.success).toHaveBeenCalled(), { timeout: 3000 });

      await waitFor(() => {
        expect(nameInput).toHaveValue('');
      });
    }, 10000);

    it('should NOT show inline alert initially', () => {
      render(<ContactForm />);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('should show loading state during submission', async () => {
      const user = userEvent.setup();
      render(<ContactForm />);

      await user.type(screen.getByLabelText(/nombre/i), 'Ana García');
      await user.type(screen.getByLabelText(/correo electrónico/i), 'ana@example.com');
      await user.type(screen.getByLabelText(/asunto/i), 'Consulta de prueba');
      await user.type(screen.getByLabelText(/mensaje/i), 'Este es un mensaje de prueba.');

      // Click but don't await — check loading state synchronously right after
      const clickPromise = user.click(screen.getByRole('button', { name: /enviar mensaje/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /enviando/i })).toBeDisabled();
      });

      await clickPromise;
      // Wait for submission to complete
      await waitFor(() => expect(toast.success).toHaveBeenCalled(), { timeout: 3000 });
    }, 10000);
  });
});
