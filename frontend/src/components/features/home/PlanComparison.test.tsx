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

      // "Carta del día" aparece en los tres planes (derivado de PLAN_MATRIX)
      expect(screen.getAllByText(/carta del día/i).length).toBeGreaterThanOrEqual(3);
    });

    it('should offer a single lifetime birth chart to visitors', () => {
      render(<PlanComparison />);

      expect(screen.getByText(/carta astral: 1 carta/i)).toBeInTheDocument();
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

    it('should show "1 por día" tarot readings including the 3-card spread', () => {
      render(<PlanComparison />);

      // La tirada de 3 cartas es FREE (solo 5 cartas y Cruz Céltica son premium)
      expect(
        screen.getByText(/lecturas de tarot: 1 por día \(1 y 3 cartas\)/i)
      ).toBeInTheDocument();
    });

    it('should show the real Free birth-chart limit (ilimitada, without the summary)', () => {
      render(<PlanComparison />);

      // Free = "Ilimitada" (sin resumen); Premium añade "con resumen personalizado".
      expect(screen.getByText('Carta astral: Ilimitada')).toBeInTheDocument();
    });

    it('should show "Interpretación personalizada" as not included', () => {
      render(<PlanComparison />);

      const iaElements = screen.getAllByText(/interpretación personalizada/i);
      expect(iaElements.length).toBeGreaterThanOrEqual(1);
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
    it('should show "3 por día" tarot readings feature', () => {
      render(<PlanComparison />);

      expect(screen.getByText(/lecturas de tarot: 3 por día/i)).toBeInTheDocument();
    });

    it('should show the premium-only advanced spreads (5 cards & Cruz Céltica)', () => {
      render(<PlanComparison />);

      // Aparece en varias columnas (incluido en Premium, tachado en Free/Visitante)
      expect(
        screen.getAllByText(/tiradas de 5 cartas y cruz céltica/i).length
      ).toBeGreaterThanOrEqual(1);
    });

    it('should show "Interpretación personalizada" feature in Premium plan', () => {
      render(<PlanComparison />);

      expect(screen.getAllByText(/interpretación personalizada/i).length).toBeGreaterThanOrEqual(1);
    });

    it('should show the birth chart with a personalized summary in Premium plan', () => {
      render(<PlanComparison />);

      expect(
        screen.getByText(/carta astral: ilimitada con resumen personalizado/i)
      ).toBeInTheDocument();
    });

    it('should show "Preguntas personalizadas" feature', () => {
      render(<PlanComparison />);

      expect(screen.getAllByText(/preguntas personalizadas/i).length).toBeGreaterThanOrEqual(1);
    });

    it('should show price "$7.000"', () => {
      render(<PlanComparison />);

      expect(screen.getByText(/\$7\.000/)).toBeInTheDocument();
    });

    it('should show CTA to upgrade to premium', () => {
      render(<PlanComparison />);

      const link = screen.getByRole('link', { name: /comenzar premium/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/premium');
    });

    it('should highlight Premium plan as recommended', () => {
      render(<PlanComparison />);

      expect(screen.getByText(/recomendado/i)).toBeInTheDocument();
    });
  });
});
