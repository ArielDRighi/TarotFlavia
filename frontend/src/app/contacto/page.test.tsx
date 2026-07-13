import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { CONFIG } from '@/lib/constants';
import ContactoPage from './page';

// El formulario envía por TanStack Query (T-PROD-014): la página necesita el provider.
vi.mock('@/lib/api/contact-api');

const renderPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return render(<ContactoPage />, { wrapper: Wrapper });
};

describe('ContactoPage', () => {
  it('should render without errors', () => {
    renderPage();
    expect(screen.getByText('Contacto')).toBeInTheDocument();
  });

  it('should display the main heading', () => {
    renderPage();
    const heading = screen.getByRole('heading', { name: 'Contacto', level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveClass('font-serif');
  });

  it('should display the subtitle', () => {
    renderPage();
    expect(
      screen.getByText('¿Tienes preguntas o sugerencias? Nos encantaría escucharte')
    ).toBeInTheDocument();
  });

  it('should render the ContactForm component', () => {
    renderPage();
    // Verify form fields from ContactForm are present
    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/asunto/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mensaje/i)).toBeInTheDocument();
  });

  it('should display alternative contact information', () => {
    renderPage();
    expect(screen.getByText('Otras formas de contacto')).toBeInTheDocument();
    expect(screen.getByText(CONFIG.CONTACT_EMAIL)).toBeInTheDocument();
    expect(
      screen.getByText('Respondemos todos los mensajes en un plazo de 24-48 horas.')
    ).toBeInTheDocument();
  });

  it('should publish the real contact mailbox of the auguriatarot.com domain', () => {
    renderPage();
    expect(screen.getByText('consultas@auguriatarot.com')).toBeInTheDocument();
  });

  it('should NOT publish any address of the wrong auguria.com domain', () => {
    const { container } = renderPage();
    expect(container.textContent).not.toMatch(/@auguria\.com/);
  });

  it('should expose the contact email as a mailto link', () => {
    renderPage();
    const link = screen.getByRole('link', { name: CONFIG.CONTACT_EMAIL });
    expect(link).toHaveAttribute('href', `mailto:${CONFIG.CONTACT_EMAIL}`);
  });

  // T-PROD-014: el formulario ahora envía de verdad. El disclaimer decía que los
  // mensajes "se muestran en la consola del navegador": dejarlo sería mentirle al
  // visitante y desalentarlo de escribir.
  it('ya no muestra el disclaimer de "envío no implementado"', () => {
    renderPage();
    expect(
      screen.queryByText(/el envío de correos aún no está implementado/i)
    ).not.toBeInTheDocument();
  });

  it('ya no renderiza el banner de disclaimer', () => {
    renderPage();
    expect(screen.queryByTestId('disclaimer-banner')).not.toBeInTheDocument();
  });

  it('should style the alternative contact section as a gold canon callout', () => {
    renderPage();
    const callout = screen.getByTestId('contact-callout');
    expect(callout.className).toContain('bg-secondary/10');
    expect(callout.className).toContain('border-secondary');
  });

  it('should NOT use raw purple palette (off-canon)', () => {
    const { container } = renderPage();
    expect(container.querySelector('[class*="purple"]')).not.toBeInTheDocument();
  });

  it('should render submit button from ContactForm', () => {
    renderPage();
    expect(screen.getByRole('button', { name: /enviar mensaje/i })).toBeInTheDocument();
  });

  describe('Canon styling', () => {
    it('should render the title with the Cormorant serif and brand primary tokens', () => {
      renderPage();
      const title = screen.getByRole('heading', { name: 'Contacto', level: 1 });
      expect(title).toHaveClass('font-serif');
      expect(title.className).toContain('text-primary');
    });

    it('should render a gold accent icon in the header', () => {
      renderPage();
      expect(screen.getByTestId('contact-accent')).toBeInTheDocument();
    });
  });
});
