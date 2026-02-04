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

  it('should have proper styling for alternative contact section', () => {
    const { container } = render(<ContactoPage />);
    const altContactSection = container.querySelector('.bg-purple-50');
    expect(altContactSection).toBeInTheDocument();
  });

  it('should have yellow disclaimer section', () => {
    const { container } = render(<ContactoPage />);
    const disclaimer = container.querySelector('.bg-yellow-50');
    expect(disclaimer).toBeInTheDocument();
  });

  it('should render submit button from ContactForm', () => {
    render(<ContactoPage />);
    expect(screen.getByRole('button', { name: /enviar mensaje/i })).toBeInTheDocument();
  });
});
