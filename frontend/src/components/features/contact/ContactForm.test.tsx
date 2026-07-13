import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AxiosError, AxiosHeaders } from 'axios';
import { ReactElement, ReactNode } from 'react';
import { toast } from 'sonner';
import * as contactApi from '@/lib/api/contact-api';
import { ContactForm } from './ContactForm';

// ContactForm muestra el feedback usando `toast` de sonner (ver ContactForm.tsx),
// por lo que el mock debe apuntar a 'sonner' y no al wrapper interno useToast.
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    dismiss: vi.fn(),
  },
}));

vi.mock('@/lib/api/contact-api');

/** El formulario envía por TanStack Query: sin provider no monta. */
const renderForm = (ui: ReactElement = <ContactForm />) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return render(ui, { wrapper: Wrapper });
};

/** Error de axios con un status concreto (el 429 del rate limit del backend). */
const axiosErrorWithStatus = (status: number) =>
  new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    status,
    statusText: '',
    data: {},
    headers: {},
    config: { headers: new AxiosHeaders() },
  });

describe('ContactForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(contactApi.sendContactMessage).mockResolvedValue({
      message: 'Mensaje enviado exitosamente. Te responderemos a la brevedad.',
    });
  });

  describe('Rendering', () => {
    it('should render all form fields', () => {
      renderForm();

      expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/asunto/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/mensaje/i)).toBeInTheDocument();
    });

    it('should render submit button', () => {
      renderForm();
      expect(screen.getByRole('button', { name: /enviar mensaje/i })).toBeInTheDocument();
    });

    it('should have placeholder texts', () => {
      renderForm();

      expect(screen.getByPlaceholderText('Tu nombre completo')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('tu@email.com')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('¿Sobre qué quieres contactarnos?')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Escribe tu mensaje aquí...')).toBeInTheDocument();
    });

    it('should render icons for name, email, and subject fields', () => {
      const { container } = renderForm();
      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThanOrEqual(3);
    });

    it('should have required attributes on inputs', () => {
      renderForm();

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
      const { container } = renderForm();
      const form = container.querySelector('form');
      expect(form).toBeInTheDocument();
      expect(form).toHaveClass('space-y-6');
    });
  });

  describe('Canon styling', () => {
    it('should give the submit CTA a visible gold focus ring', () => {
      renderForm();
      const submitButton = screen.getByRole('button', { name: /enviar mensaje/i });
      expect(submitButton.className).toContain('focus-visible:ring-secondary');
    });
  });

  describe('Form Structure', () => {
    it('should use React Hook Form integration', () => {
      renderForm();
      const form = screen.getByRole('button', { name: /enviar mensaje/i }).closest('form');
      expect(form).toBeInTheDocument();
    });

    it('should have proper label associations', () => {
      renderForm();

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
      renderForm();
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
      renderForm();
      await fillAndSubmit();

      await waitFor(() => expect(toast.success).toHaveBeenCalled(), { timeout: SUBMIT_TIMEOUT });
      expect(screen.queryByText(/¡mensaje enviado exitosamente!/i)).not.toBeInTheDocument();
    });

    it('should reset the form after successful submission', async () => {
      renderForm();
      const nameInput = screen.getByLabelText(/nombre/i);
      await fillAndSubmit();

      await waitFor(() => expect(nameInput).toHaveValue(''), { timeout: SUBMIT_TIMEOUT });
    });

    it('should NOT show inline alert initially', () => {
      renderForm();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('should show loading state during submission', async () => {
      // El envío queda en vuelo para poder observar el estado de carga.
      let resolveSend: (value: { message: string }) => void = () => {};
      vi.mocked(contactApi.sendContactMessage).mockReturnValue(
        new Promise((resolve) => {
          resolveSend = resolve;
        })
      );

      renderForm();
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
      resolveSend({ message: 'Mensaje enviado' });
      await waitFor(() => expect(toast.success).toHaveBeenCalled(), { timeout: SUBMIT_TIMEOUT });
    });

    // El bug de T-PROD-014: el formulario simulaba el envío con un setTimeout y el
    // mensaje del cliente moría en la consola del navegador. Estos tests fijan que
    // ahora sale de verdad hacia el backend.
    it('envía el mensaje al backend con los datos del formulario', async () => {
      renderForm();
      await fillAndSubmit();

      await waitFor(() => expect(contactApi.sendContactMessage).toHaveBeenCalledTimes(1), {
        timeout: SUBMIT_TIMEOUT,
      });

      // Se compara el primer argumento: TanStack Query v5 le pasa además un segundo
      // parámetro de contexto al mutationFn.
      expect(vi.mocked(contactApi.sendContactMessage).mock.calls[0][0]).toEqual({
        name: 'Ana García',
        email: 'ana@example.com',
        subject: 'Consulta de prueba',
        message: 'Este es un mensaje de prueba.',
      });
    });

    it('no canta éxito si el envío falla: muestra el alert de error y NO limpia el formulario', async () => {
      vi.mocked(contactApi.sendContactMessage).mockRejectedValue(new Error('Network Error'));

      renderForm();
      const nameInput = screen.getByLabelText(/nombre/i);
      await fillAndSubmit();

      await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument(), {
        timeout: SUBMIT_TIMEOUT,
      });
      expect(screen.getByRole('alert')).toHaveTextContent(/hubo un error al enviar tu mensaje/i);
      expect(toast.success).not.toHaveBeenCalled();
      // El texto escrito no se pierde: el usuario puede reintentar sin volver a tipearlo.
      expect(nameInput).toHaveValue('Ana García');
    });

    it('ante un 429 avisa del límite de envíos en vez del error genérico', async () => {
      vi.mocked(contactApi.sendContactMessage).mockRejectedValue(axiosErrorWithStatus(429));

      renderForm();
      await fillAndSubmit();

      await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument(), {
        timeout: SUBMIT_TIMEOUT,
      });
      expect(screen.getByRole('alert')).toHaveTextContent(/demasiados mensajes/i);
    });

    it('vuelve a habilitar el botón tras un error, para poder reintentar', async () => {
      vi.mocked(contactApi.sendContactMessage).mockRejectedValue(new Error('Network Error'));

      renderForm();
      await fillAndSubmit();

      await waitFor(
        () => {
          expect(screen.getByRole('button', { name: /enviar mensaje/i })).toBeEnabled();
        },
        { timeout: SUBMIT_TIMEOUT }
      );
    });
  });
});
