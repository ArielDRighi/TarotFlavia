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
    // T-PROD-008 dejó lista la infraestructura de ads (AdSense gateado por plan), pero
    // todavía no hay ningún AdSlot colocado: hasta T-PROD-009 un Free no ve anuncios,
    // así que "sin publicidad" seguiría siendo una promesa vacía (regla FBK-005).
    expect(text).not.toContain('publicidad');
    expect(text).not.toContain('prioritario'); // sin lógica de acceso prioritario
    expect(text).not.toContain('herradura'); // tirada inexistente
    expect(text).not.toContain('año completo'); // tirada inexistente
  });

  it('T-SEO-015: muestra el precio real que recibe por prop, formateado', () => {
    render(<PremiumBenefitsSection price={7000} />);

    expect(screen.getByText(/\$\s?7\.000/)).toBeInTheDocument();
  });

  it('T-SEO-015: sin precio no inventa uno (ningún "$" hardcodeado)', () => {
    const { container } = render(<PremiumBenefitsSection />);

    expect(container.textContent).not.toMatch(/\$/);
  });

  it('should render upgrade CTA button', () => {
    render(<PremiumBenefitsSection />);

    const ctaButton = screen.getByRole('link', { name: /comenzar premium/i });

    expect(ctaButton).toBeInTheDocument();
    expect(ctaButton).toHaveAttribute('href', '/registro');
  });

  it('T-SEO-015: acepta un CTA propio para /premium, donde el botón depende de la sesión', () => {
    render(<PremiumBenefitsSection cta={<button type="button">CTA propio</button>} />);

    expect(screen.getByRole('button', { name: 'CTA propio' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /comenzar premium/i })).not.toBeInTheDocument();
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
