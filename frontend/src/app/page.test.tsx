import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Home from './page';

/**
 * Tests para la página Home
 * TAREA #A005: Agregar navegación para crear lectura
 */
describe('Home Page', () => {
  describe('Navigation CTA', () => {
    it('should display "Crear Nueva Lectura" button', () => {
      render(<Home />);

      const ctaButton = screen.getByRole('link', { name: /crear nueva lectura/i });
      expect(ctaButton).toBeInTheDocument();
    });

    it('should link to /ritual', () => {
      render(<Home />);

      const ctaButton = screen.getByRole('link', { name: /crear nueva lectura/i });
      expect(ctaButton).toHaveAttribute('href', '/ritual');
    });

    it('should have primary button styling', () => {
      render(<Home />);

      const ctaButton = screen.getByRole('link', { name: /crear nueva lectura/i });
      expect(ctaButton).toHaveClass('bg-primary');
    });
  });

  describe('Content', () => {
    it('should display welcome heading', () => {
      render(<Home />);

      expect(
        screen.getByRole('heading', { name: /bienvenido a tarotflavia/i })
      ).toBeInTheDocument();
    });

    it('should display description', () => {
      render(<Home />);

      expect(screen.getByText(/marketplace de tarotistas profesionales/i)).toBeInTheDocument();
    });
  });
});
