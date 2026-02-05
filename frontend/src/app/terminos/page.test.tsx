import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TerminosPage from './page';

describe('TerminosPage', () => {
  it('should render without errors', () => {
    render(<TerminosPage />);
    expect(screen.getByText('Términos y Condiciones')).toBeInTheDocument();
  });

  it('should display the main heading', () => {
    render(<TerminosPage />);
    const heading = screen.getByRole('heading', { name: 'Términos y Condiciones', level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveClass('font-serif');
  });

  it('should display last updated date', () => {
    render(<TerminosPage />);
    expect(screen.getByText(/Última actualización:/i)).toBeInTheDocument();
    expect(screen.getByText(/2026/i)).toBeInTheDocument();
  });

  it('should render all 10 sections with their headings', () => {
    render(<TerminosPage />);

    expect(
      screen.getByRole('heading', { name: '1. Aceptación de Términos', level: 2 })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: '2. Descripción del Servicio', level: 2 })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: '3. Cuenta de Usuario', level: 2 })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: '4. Planes y Suscripciones', level: 2 })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: '5. Propiedad Intelectual', level: 2 })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: '6. Limitación de Responsabilidad', level: 2 })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: '7. Modificaciones del Servicio', level: 2 })
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '8. Terminación', level: 2 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '9. Ley Aplicable', level: 2 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '10. Contacto', level: 2 })).toBeInTheDocument();
  });

  it('should display the placeholder disclaimer', () => {
    render(<TerminosPage />);
    expect(screen.getByText(/Este es un contenido placeholder/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /El contenido legal real debe ser revisado y aprobado por profesionales legales/i
      )
    ).toBeInTheDocument();
  });

  it('should have proper styling classes', () => {
    const { container } = render(<TerminosPage />);
    const containerDiv = container.querySelector('.container');
    expect(containerDiv).toBeInTheDocument();
  });

  it('should display service description', () => {
    render(<TerminosPage />);
    expect(
      screen.getByText(/Auguria proporciona servicios de lectura de tarot/i)
    ).toBeInTheDocument();
  });

  it('should have disclaimer in yellow background', () => {
    const { container } = render(<TerminosPage />);
    const disclaimer = container.querySelector('.bg-yellow-50');
    expect(disclaimer).toBeInTheDocument();
  });
});
