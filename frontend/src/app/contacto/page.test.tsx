import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ContactoPage from './page';

describe('ContactoPage', () => {
  it('should render without errors', () => {
    render(<ContactoPage />);
    expect(screen.getByText('Contacto')).toBeInTheDocument();
  });

  it('should display the main heading', () => {
    render(<ContactoPage />);
    const heading = screen.getByRole('heading', { name: 'Contacto', level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveClass('font-serif');
  });

  it('should display the subtitle', () => {
    render(<ContactoPage />);
    expect(
      screen.getByText('¿Tienes preguntas o sugerencias? Nos encantaría escucharte')
    ).toBeInTheDocument();
  });

  it('should render the ContactForm component', () => {
    render(<ContactoPage />);
    // Verify form fields from ContactForm are present
    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/asunto/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mensaje/i)).toBeInTheDocument();
  });

  it('should display alternative contact information', () => {
    render(<ContactoPage />);
    expect(screen.getByText('Otras formas de contacto')).toBeInTheDocument();
    expect(screen.getByText('contacto@auguria.com')).toBeInTheDocument();
    expect(
      screen.getByText('Respondemos todos los mensajes en un plazo de 24-48 horas.')
    ).toBeInTheDocument();
  });

  it('should display the disclaimer about form functionality', () => {
    render(<ContactoPage />);
    expect(
      screen.getByText(
        /Este formulario es funcional pero el envío de correos aún no está implementado/i
      )
    ).toBeInTheDocument();
  });

  it('should style the alternative contact section as a gold canon callout', () => {
    render(<ContactoPage />);
    const altContactSection = screen.getByText('Otras formas de contacto').closest('div');
    expect(altContactSection?.className).toContain('bg-secondary/10');
    expect(altContactSection?.className).toContain('border-secondary');
  });

  it('should NOT use raw purple palette (off-canon)', () => {
    const { container } = render(<ContactoPage />);
    expect(container.querySelector('.bg-purple-50')).not.toBeInTheDocument();
  });

  it('should render the disclaimer banner', () => {
    render(<ContactoPage />);
    expect(screen.getByTestId('disclaimer-banner')).toBeInTheDocument();
  });

  it('should render submit button from ContactForm', () => {
    render(<ContactoPage />);
    expect(screen.getByRole('button', { name: /enviar mensaje/i })).toBeInTheDocument();
  });

  describe('Canon styling', () => {
    it('should render the title with the Cormorant serif and brand primary tokens', () => {
      render(<ContactoPage />);
      const title = screen.getByRole('heading', { name: 'Contacto', level: 1 });
      expect(title).toHaveClass('font-serif');
      expect(title.className).toContain('text-primary');
    });

    it('should render a gold accent icon in the header', () => {
      render(<ContactoPage />);
      expect(screen.getByTestId('contact-accent')).toBeInTheDocument();
    });
  });
});
