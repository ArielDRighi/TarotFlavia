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

  it('should render AI interpretations benefit', () => {
    render(<PremiumBenefitsSection />);

    const aiBenefit = screen.getByText(/interpretaciones con ia personalizadas/i);

    expect(aiBenefit).toBeInTheDocument();
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

  it('should render statistics benefit', () => {
    render(<PremiumBenefitsSection />);

    const statsBenefit = screen.getByText(/estadísticas avanzadas/i);

    expect(statsBenefit).toBeInTheDocument();
  });

  it('should render no ads benefit', () => {
    render(<PremiumBenefitsSection />);

    const noAdsBenefit = screen.getByText(/sin publicidad/i);

    expect(noAdsBenefit).toBeInTheDocument();
  });

  it('should display pricing information', () => {
    render(<PremiumBenefitsSection />);

    const pricing = screen.getByText(/\$9\.99\/mes/i);

    expect(pricing).toBeInTheDocument();
  });

  it('should render upgrade CTA button', () => {
    render(<PremiumBenefitsSection />);

    const ctaButton = screen.getByRole('link', { name: /actualizar a premium/i });

    expect(ctaButton).toBeInTheDocument();
    expect(ctaButton).toHaveAttribute('href', '/registro');
  });

  it('should have proper semantic structure with section tag', () => {
    const { container } = render(<PremiumBenefitsSection />);

    const section = container.querySelector('section');

    expect(section).toBeInTheDocument();
  });

  it('should render exactly 5 benefit items', () => {
    const { container } = render(<PremiumBenefitsSection />);

    const benefitItems = container.querySelectorAll('[data-testid="benefit-item"]');

    expect(benefitItems).toHaveLength(5);
  });
});
