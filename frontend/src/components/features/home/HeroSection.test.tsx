import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { HeroSection } from './HeroSection';

describe('HeroSection', () => {
  it('should render main headline', () => {
    render(<HeroSection />);

    const headline = screen.getByRole('heading', {
      name: /descubre tu destino con tarot personalizado/i,
      level: 1,
    });

    expect(headline).toBeInTheDocument();
  });

  it('should render subheadline with value proposition', () => {
    render(<HeroSection />);

    const subheadline = screen.getByText(/interpretaciones con inteligencia artificial/i);

    expect(subheadline).toBeInTheDocument();
  });

  it('should render primary CTA button with correct link', () => {
    render(<HeroSection />);

    const primaryCTA = screen.getByRole('link', { name: /comenzar gratis/i });

    expect(primaryCTA).toBeInTheDocument();
    expect(primaryCTA).toHaveAttribute('href', '/registro');
  });

  it('should render secondary CTA button with correct link', () => {
    render(<HeroSection />);

    const secondaryCTA = screen.getByRole('link', { name: /probar sin registro/i });

    expect(secondaryCTA).toBeInTheDocument();
    expect(secondaryCTA).toHaveAttribute('href', '/carta-del-dia');
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
