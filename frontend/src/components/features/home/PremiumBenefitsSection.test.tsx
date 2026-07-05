import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PremiumBenefitsSection } from './PremiumBenefitsSection';

describe('PremiumBenefitsSection', () => {
  it('should render section title', () => {
    render(<PremiumBenefitsSection />);

    const title = screen.getByRole('heading', {
      name: /¿por qué elegir premium\?/i,
      level: 2,
    });

    expect(title).toBeInTheDocument();
  });

  it('should render premium interpretations benefit', () => {
    render(<PremiumBenefitsSection />);

    const interpretationsBenefit = screen.getByText(/interpretaciones profundas y personalizadas/i);

    expect(interpretationsBenefit).toBeInTheDocument();
  });

  it('should render all spreads benefit', () => {
    render(<PremiumBenefitsSection />);

    const spreadsBenefit = screen.getByText(/todas las tiradas disponibles/i);

    expect(spreadsBenefit).toBeInTheDocument();
  });

  it('should render custom questions benefit', () => {
    render(<PremiumBenefitsSection />);

    const questionsBenefit = screen.getByText(/preguntas personalizadas/i);

    expect(questionsBenefit).toBeInTheDocument();
  });

  it('should render the real 365-day history benefit', () => {
    render(<PremiumBenefitsSection />);

    const historyBenefit = screen.getByText(/historial de 365 días/i);

    expect(historyBenefit).toBeInTheDocument();
  });

  it('should render the premium birth-chart summary benefit', () => {
    render(<PremiumBenefitsSection />);

    const chartBenefit = screen.getByText(/carta astral con resumen personalizado/i);

    expect(chartBenefit).toBeInTheDocument();
  });

  it('should NOT promise unsubstantiated or nonexistent benefits', () => {
    const { container } = render(<PremiumBenefitsSection />);
    const text = (container.textContent ?? '').toLowerCase();

    expect(text).not.toContain('estadística'); // no hay módulo de estadísticas
    expect(text).not.toContain('publicidad'); // no hay sistema de ads
    expect(text).not.toContain('prioritario'); // sin lógica de acceso prioritario
    expect(text).not.toContain('herradura'); // tirada inexistente
    expect(text).not.toContain('año completo'); // tirada inexistente
  });

  it('should display pricing information', () => {
    render(<PremiumBenefitsSection />);

    const pricing = screen.getByText(/\$7\.000/);

    expect(pricing).toBeInTheDocument();
  });

  it('should render upgrade CTA button', () => {
    render(<PremiumBenefitsSection />);

    const ctaButton = screen.getByRole('link', { name: /comenzar premium/i });

    expect(ctaButton).toBeInTheDocument();
    expect(ctaButton).toHaveAttribute('href', '/registro');
  });

  it('should have proper semantic structure with section tag', () => {
    const { container } = render(<PremiumBenefitsSection />);

    const section = container.querySelector('section');

    expect(section).toBeInTheDocument();
  });

  it('should render exactly 6 benefit items', () => {
    const { container } = render(<PremiumBenefitsSection />);

    const benefitItems = container.querySelectorAll('[data-testid="benefit-item"]');

    expect(benefitItems).toHaveLength(6);
  });
});
