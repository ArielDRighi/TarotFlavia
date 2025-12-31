import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { LandingPage } from './LandingPage';

describe('LandingPage', () => {
  it('should render all main sections', () => {
    render(<LandingPage />);

    // Verificar que todas las secciones están presentes
    expect(screen.getByRole('heading', { name: /descubre tu destino/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /prueba sin compromiso/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /¿por qué elegir premium\?/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /¿qué es el tarot\?/i })).toBeInTheDocument();
  });

  it('should have proper semantic structure with main tag', () => {
    const { container } = render(<LandingPage />);

    const main = container.querySelector('main');

    expect(main).toBeInTheDocument();
  });

  it('should render HeroSection first', () => {
    const { container } = render(<LandingPage />);

    const firstSection = container.querySelector('main > section:first-child');
    const heroHeading = firstSection?.querySelector('h1');

    expect(heroHeading).toHaveTextContent(/descubre tu destino/i);
  });

  it('should be accessible with proper heading hierarchy', () => {
    render(<LandingPage />);

    // H1 principal
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1).toBeInTheDocument();

    // Múltiples H2
    const h2s = screen.getAllByRole('heading', { level: 2 });
    expect(h2s.length).toBeGreaterThanOrEqual(3);
  });

  it('should render all CTAs (register and try without)', () => {
    render(<LandingPage />);

    // Hero CTAs
    expect(screen.getByRole('link', { name: /comenzar gratis/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /probar sin registro/i })).toBeInTheDocument();

    // Try without register CTA
    expect(screen.getByRole('link', { name: /carta del día gratis/i })).toBeInTheDocument();

    // Premium CTA
    expect(screen.getByRole('link', { name: /actualizar a premium/i })).toBeInTheDocument();
  });
});
