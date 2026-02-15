/**
 * Tests para BirthChartPromo
 *
 * Componente promocional para carta astral con 3 variantes:
 * - hero: Grande, para landing principal
 * - section: Estándar, para páginas internas
 * - card: Compacta, para grids de servicios
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BirthChartPromo } from './BirthChartPromo';

describe('BirthChartPromo', () => {
  describe('Variante hero', () => {
    it('should render hero variant with title and description', () => {
      render(<BirthChartPromo variant="hero" />);

      expect(screen.getByRole('heading', { name: /carta astral/i })).toBeInTheDocument();
      expect(screen.getByText(/descubre el mapa del cielo/i)).toBeInTheDocument();
    });

    it('should render "Nuevo" badge in hero variant', () => {
      render(<BirthChartPromo variant="hero" />);

      expect(screen.getByText(/nuevo/i)).toBeInTheDocument();
    });

    it('should render CTA button with correct link', () => {
      render(<BirthChartPromo variant="hero" />);

      const button = screen.getByRole('link', { name: /generar mi carta astral/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('href', '/carta-astral');
    });

    it('should render multiple feature items in hero variant', () => {
      render(<BirthChartPromo variant="hero" />);

      expect(screen.getByText(/posiciones planetarias exactas/i)).toBeInTheDocument();
      expect(screen.getByText(/interpretación de aspectos/i)).toBeInTheDocument();
      expect(screen.getByText(/síntesis personalizada con ia/i)).toBeInTheDocument();
    });

    it('should have data-testid="birth-chart-promo-hero"', () => {
      render(<BirthChartPromo variant="hero" />);

      expect(screen.getByTestId('birth-chart-promo-hero')).toBeInTheDocument();
    });

    it('should render decorative icons', () => {
      const { container } = render(<BirthChartPromo variant="hero" />);

      // Verificar que hay iconos (lucide-react renderiza SVGs)
      const svgs = container.querySelectorAll('svg');
      expect(svgs.length).toBeGreaterThan(0);
    });
  });

  describe('Variante section', () => {
    it('should render section variant with title and description', () => {
      render(<BirthChartPromo variant="section" />);

      expect(screen.getByText('Carta Astral')).toBeInTheDocument();
      expect(screen.getByText(/descubre/i)).toBeInTheDocument();
    });

    it('should render "Nuevo" badge in section variant', () => {
      render(<BirthChartPromo variant="section" />);

      expect(screen.getByText(/nuevo/i)).toBeInTheDocument();
    });

    it('should render CTA button with correct link', () => {
      render(<BirthChartPromo variant="section" />);

      const button = screen.getByRole('link', { name: /generar carta astral/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('href', '/carta-astral');
    });

    it('should have data-testid="birth-chart-promo-section"', () => {
      render(<BirthChartPromo variant="section" />);

      expect(screen.getByTestId('birth-chart-promo-section')).toBeInTheDocument();
    });
  });

  describe('Variante card', () => {
    it('should render card variant with title', () => {
      render(<BirthChartPromo variant="card" />);

      expect(screen.getByText('Carta Astral')).toBeInTheDocument();
    });

    it('should render "Nuevo" badge in card variant', () => {
      render(<BirthChartPromo variant="card" />);

      expect(screen.getByText(/nuevo/i)).toBeInTheDocument();
    });

    it('should render short description in card variant', () => {
      render(<BirthChartPromo variant="card" />);

      expect(screen.getByText(/mapa del cielo/i)).toBeInTheDocument();
    });

    it('should render CTA button with correct link', () => {
      render(<BirthChartPromo variant="card" />);

      const button = screen.getByRole('link', { name: /generar/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('href', '/carta-astral');
    });

    it('should have data-testid="birth-chart-promo-card"', () => {
      render(<BirthChartPromo variant="card" />);

      expect(screen.getByTestId('birth-chart-promo-card')).toBeInTheDocument();
    });

    it('should render icon', () => {
      const { container } = render(<BirthChartPromo variant="card" />);

      const svgs = container.querySelectorAll('svg');
      expect(svgs.length).toBeGreaterThan(0);
    });
  });

  describe('Default behavior', () => {
    it('should default to section variant when no variant provided', () => {
      render(<BirthChartPromo />);

      expect(screen.getByTestId('birth-chart-promo-section')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy in hero variant', () => {
      render(<BirthChartPromo variant="hero" />);

      const heading = screen.getByRole('heading', { name: /carta astral/i });
      expect(heading.tagName).toBe('H2');
    });

    it('should have accessible link text', () => {
      render(<BirthChartPromo variant="hero" />);

      const link = screen.getByRole('link', { name: /generar mi carta astral/i });
      expect(link).toHaveAccessibleName();
    });
  });

  describe('Responsive design', () => {
    it('should render without errors on all variants', () => {
      const variants = ['hero', 'section', 'card'] as const;

      variants.forEach((variant) => {
        const { container } = render(<BirthChartPromo variant={variant} />);
        expect(container.firstChild).toBeInTheDocument();
      });
    });
  });
});
