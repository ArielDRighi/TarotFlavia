import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { HeroSection } from './HeroSection';

describe('HeroSection', () => {
  it('should render main headline with Auguria branding', () => {
    render(<HeroSection />);

    const headline = screen.getByRole('heading', {
      name: /auguria.*descubre tu destino a través del tarot/i,
      level: 1,
    });

    expect(headline).toBeInTheDocument();
  });

  it('should render subheadline with value proposition', () => {
    render(<HeroSection />);

    const subheadline = screen.getByText(/lecturas de tarot personalizadas/i);

    expect(subheadline).toBeInTheDocument();
  });

  it('should render primary CTA button "Ver mi carta del día gratis"', () => {
    render(<HeroSection />);

    const primaryCTA = screen.getByRole('link', { name: /ver mi carta del día gratis/i });

    expect(primaryCTA).toBeInTheDocument();
    expect(primaryCTA).toHaveAttribute('href', '/carta-del-dia');
  });

  it('should render secondary CTA button "Crear cuenta gratis"', () => {
    render(<HeroSection />);

    const secondaryCTA = screen.getByRole('link', { name: /crear cuenta gratis/i });

    expect(secondaryCTA).toBeInTheDocument();
    expect(secondaryCTA).toHaveAttribute('href', '/registro');
  });

  it('should render hero image with alt text', () => {
    render(<HeroSection />);

    const heroImage = screen.getByRole('img', { name: /cartas de tarot/i });

    expect(heroImage).toBeInTheDocument();
  });

  it('should have proper semantic structure with section tag', () => {
    const { container } = render(<HeroSection />);

    const section = container.querySelector('section');

    expect(section).toBeInTheDocument();
  });
});
