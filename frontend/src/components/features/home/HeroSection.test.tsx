import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { HeroSection } from './HeroSection';

describe('HeroSection', () => {
  it('should render main headline with Auguria branding', () => {
    render(<HeroSection />);

    const headline = screen.getByRole('heading', {
      level: 1,
    });

    expect(headline).toBeInTheDocument();
    expect(headline).toHaveTextContent(/descubre tu destino/i);
    expect(headline).toHaveTextContent(/a través del tarot/i);
  });

  it('should render subheadline with value proposition', () => {
    render(<HeroSection />);

    const subheadline = screen.getByText(/lecturas personalizadas que iluminan tu camino/i);

    expect(subheadline).toBeInTheDocument();
  });

  it('should render primary CTA button "Carta del día gratis"', () => {
    render(<HeroSection />);

    const primaryCTA = screen.getByRole('link', { name: /carta del día gratis/i });

    expect(primaryCTA).toBeInTheDocument();
    expect(primaryCTA).toHaveAttribute('href', '/carta-del-dia');
  });

  it('should render secondary CTA button "Crear cuenta gratis"', () => {
    render(<HeroSection />);

    const secondaryCTA = screen.getByRole('link', { name: /crear cuenta gratis/i });

    expect(secondaryCTA).toBeInTheDocument();
    expect(secondaryCTA).toHaveAttribute('href', '/registro');
  });

  it('should render eyebrow text with spiritual guide message', () => {
    render(<HeroSection />);

    expect(screen.getByText(/tu guía espiritual/i)).toBeInTheDocument();
  });

  it('should have proper semantic structure with section tag', () => {
    const { container } = render(<HeroSection />);

    const section = container.querySelector('section');

    expect(section).toBeInTheDocument();
  });
});
