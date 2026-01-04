import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PlanComparison } from './PlanComparison';

describe('PlanComparison', () => {
  it('should render section title', () => {
    render(<PlanComparison />);

    expect(
      screen.getByRole('heading', { name: /¿qué plan se adapta a ti\?/i })
    ).toBeInTheDocument();
  });

  it('should render three plan cards (Visitante, Free, Premium)', () => {
    render(<PlanComparison />);

    const visitanteHeading = screen.getByRole('heading', { name: /^visitante$/i });
    const freeHeading = screen.getByRole('heading', { name: /^free$/i });
    const premiumHeading = screen.getByRole('heading', { name: /^premium$/i });

    expect(visitanteHeading).toBeInTheDocument();
    expect(freeHeading).toBeInTheDocument();
    expect(premiumHeading).toBeInTheDocument();
  });

  describe('Anonymous plan', () => {
    it('should show daily card feature', () => {
      render(<PlanComparison />);

      expect(screen.getByText(/carta del día \(1 vez al día\)/i)).toBeInTheDocument();
    });

    it('should show "Sin registro" price', () => {
      render(<PlanComparison />);

      // Look for price specifically in heading, not in subtitle
      const prices = screen.getAllByText(/sin registro/i);
      const priceElement = prices.find((el) => el.classList.contains('text-4xl'));
      expect(priceElement).toBeDefined();
    });

    it('should show CTA to try daily card', () => {
      render(<PlanComparison />);

      const link = screen.getByRole('link', { name: /probar carta del día/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/carta-del-dia');
    });
  });

  describe('Free plan', () => {
    it('should show daily card feature', () => {
      render(<PlanComparison />);

      // Should appear twice (Visitante + Free)
      const dailyCards = screen.getAllByText(/carta del día/i);
      expect(dailyCards.length).toBeGreaterThanOrEqual(2);
    });

    it('should show "1 lectura diaria" feature', () => {
      render(<PlanComparison />);

      expect(screen.getByText(/1 lectura diaria/i)).toBeInTheDocument();
    });

    it('should show "Tiradas de 1-3 cartas" feature', () => {
      render(<PlanComparison />);

      expect(screen.getByText(/tiradas de 1-3 cartas/i)).toBeInTheDocument();
    });

    it('should show "Sin interpretación IA" feature', () => {
      render(<PlanComparison />);

      expect(screen.getByText(/sin interpretación ia/i)).toBeInTheDocument();
    });

    it('should show "Gratis" price', () => {
      render(<PlanComparison />);

      // Get all elements with "Gratis", find the one that's a price (larger font)
      const prices = screen.getAllByText(/^gratis$/i);
      const priceElement = prices.find((el) => el.classList.contains('text-4xl'));
      expect(priceElement).toBeDefined();
    });

    it('should show CTA to register', () => {
      render(<PlanComparison />);

      const link = screen.getByRole('link', { name: /registrarse gratis/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/registro');
    });
  });

  describe('Premium plan', () => {
    it('should show "Lecturas ilimitadas" feature', () => {
      render(<PlanComparison />);

      expect(screen.getByText(/lecturas ilimitadas/i)).toBeInTheDocument();
    });

    it('should show "Todas las tiradas" feature in Premium plan', () => {
      render(<PlanComparison />);

      // Get all elements with this text, check for one WITHOUT line-through (Premium)
      const elements = screen.getAllByText(/todas las tiradas/i);
      const premiumElement = elements.find(
        (el) => !el.classList.contains('line-through') && el.classList.contains('text-gray-900')
      );
      expect(premiumElement).toBeDefined();
    });

    it('should show "Interpretación personalizada" feature in Premium plan', () => {
      render(<PlanComparison />);

      // Get all elements with this text, check for one WITHOUT line-through (Premium)
      const elements = screen.getAllByText(/interpretación personalizada/i);
      const premiumElement = elements.find(
        (el) => !el.classList.contains('line-through') && el.classList.contains('text-gray-900')
      );
      expect(premiumElement).toBeDefined();
    });

    it('should show "Preguntas personalizadas" feature', () => {
      render(<PlanComparison />);

      expect(screen.getByText(/preguntas personalizadas/i)).toBeInTheDocument();
    });

    it('should show price "$9.99/mes"', () => {
      render(<PlanComparison />);

      expect(screen.getByText(/\$9\.99\/mes/i)).toBeInTheDocument();
    });

    it('should show CTA to upgrade to premium', () => {
      render(<PlanComparison />);

      const link = screen.getByRole('link', { name: /comenzar premium/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/registro');
    });

    it('should highlight Premium plan as recommended', () => {
      render(<PlanComparison />);

      expect(screen.getByText(/recomendado/i)).toBeInTheDocument();
    });
  });
});
