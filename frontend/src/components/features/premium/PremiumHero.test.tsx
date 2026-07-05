import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import { PremiumHero } from './PremiumHero';

// Mock next/image (render a plain img so we can assert src/alt)
vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} data-testid="next-image" />
  ),
}));

describe('PremiumHero', () => {
  it('should render with data-testid', () => {
    render(<PremiumHero title="Desbloquea el Tarot" />);

    expect(screen.getByTestId('premium-hero')).toBeInTheDocument();
  });

  it('should render the title as the page h1', () => {
    render(<PremiumHero title="Desbloquea el Tarot" />);

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1).toHaveTextContent('Desbloquea el Tarot');
    // Cormorant (serif) cream título del canon
    expect(h1).toHaveClass('font-serif');
  });

  it('should render the badge chip when provided', () => {
    render(<PremiumHero title="Tarot" badge="Plan Premium" />);

    expect(screen.getByTestId('premium-hero-badge')).toHaveTextContent('Plan Premium');
  });

  it('should not render the badge chip when no badge is provided', () => {
    render(<PremiumHero title="Tarot" />);

    expect(screen.queryByTestId('premium-hero-badge')).not.toBeInTheDocument();
  });

  it('should render the subtitle when provided', () => {
    render(<PremiumHero title="Tarot" subtitle={<span>Todo por $7.000/mes</span>} />);

    expect(screen.getByText('Todo por $7.000/mes')).toBeInTheDocument();
  });

  it('should not render the subtitle paragraph when no subtitle is provided', () => {
    render(<PremiumHero title="Tarot" />);

    expect(screen.queryByTestId('premium-hero-subtitle')).not.toBeInTheDocument();
  });

  it('should render the CTA slot (children)', () => {
    render(
      <PremiumHero title="Tarot">
        <button data-testid="cta-hero">Comenzar Premium</button>
      </PremiumHero>
    );

    expect(screen.getByTestId('cta-hero')).toBeInTheDocument();
  });

  it('should render the hero image with its alt when an image is provided', () => {
    render(
      <PremiumHero
        title="Tarot"
        image={{ src: '/images/premium/premium-hero.webp', alt: 'Llave dorada abriendo una carta' }}
      />
    );

    const img = screen.getByTestId('next-image');
    expect(img).toHaveAttribute('src', '/images/premium/premium-hero.webp');
    expect(img).toHaveAttribute('alt', 'Llave dorada abriendo una carta');
  });

  it('should fall back to the gradient band (no image) when no image is provided', () => {
    render(<PremiumHero title="Tarot" />);

    expect(screen.queryByTestId('next-image')).not.toBeInTheDocument();
    // The hero still renders (fallback band)
    expect(screen.getByTestId('premium-hero')).toBeInTheDocument();
  });

  it('should apply additional className', () => {
    render(<PremiumHero title="Tarot" className="extra-test-class" />);

    expect(screen.getByTestId('premium-hero')).toHaveClass('extra-test-class');
  });

  // Accesibilidad (canon T-PREM-002 / PREM-002 · cierre T-PREM-008)
  describe('Accesibilidad', () => {
    it('should use dark night text on the gold badge chip for AA contrast', () => {
      render(<PremiumHero title="Tarot" badge="Plan Premium" />);

      const chip = screen.getByTestId('premium-hero-badge');
      // Texto noche (#1a0a2e) sobre dorado (#d69e2e) ≈ 7:1 (AA); blanco falla.
      expect(chip).toHaveClass('text-bg-hero');
      expect(chip).not.toHaveClass('text-white');
    });

    it('should hide the decorative image overlay from assistive tech (T-PREM-008)', () => {
      const { container } = render(
        <PremiumHero
          title="Tarot"
          image={{ src: '/images/premium/premium-hero.webp', alt: 'Llave dorada' }}
        />
      );

      // El overlay de legibilidad es puramente decorativo → aria-hidden.
      const decorative = container.querySelectorAll('[aria-hidden="true"]');
      expect(decorative.length).toBeGreaterThan(0);
    });

    it('should mark twinkling stars and crescent moon as aria-hidden (decorativos)', () => {
      const { container } = render(<PremiumHero title="Tarot" />);

      // Las estrellas animadas no aportan información: no deben leerse.
      const stars = container.querySelectorAll('.animate-twinkle');
      expect(stars.length).toBeGreaterThan(0);
      stars.forEach((star) => expect(star).toHaveAttribute('aria-hidden', 'true'));
    });
  });
});
