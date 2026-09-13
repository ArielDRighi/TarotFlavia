import { render, screen, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { EditorialHero } from './EditorialHero';
import { LOGO } from '@/lib/constants/branding';
import { HOME_EDITORIAL } from '@/lib/constants/home-editorial.data';

describe('EditorialHero (T-SEO-014)', () => {
  it('renderiza el h1 de publicación y la bajada', () => {
    render(<EditorialHero />);

    expect(screen.getByTestId('home-hero')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(HOME_EDITORIAL.hero.title);
    expect(screen.getByText(HOME_EDITORIAL.hero.lead)).toBeInTheDocument();
  });

  it('⚠️ no tiene CTA de registro ni promesa de producto', () => {
    render(<EditorialHero />);

    expect(screen.queryByRole('link', { name: /crear cuenta/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/sin tarjeta de crédito/i)).not.toBeInTheDocument();
    expect(
      screen.queryByText(/sin registro|1 vez al día|acceso inmediato/i)
    ).not.toBeInTheDocument();
  });
});

describe('EditorialHero — puesta en escena (T-SEO-022)', () => {
  it('muestra el logo de Auguria arriba, con prioridad de carga', () => {
    render(<EditorialHero />);

    const logo = screen.getByRole('img', { name: 'Auguria' });
    expect(logo).toHaveAttribute('src', expect.stringContaining(encodeURIComponent(LOGO.path)));
    expect(logo).not.toHaveAttribute('loading', 'lazy');
  });

  it('el fondo del hero va a opacidad plena, con el overlay original', () => {
    const { container } = render(<EditorialHero />);

    const background = container.querySelector('img[src*="hero-bg"]');
    expect(background).not.toBeNull();
    expect(background).not.toHaveClass('opacity-70');
    expect(screen.getByTestId('home-hero-overlay')).toBeInTheDocument();
  });

  it('trae las estrellas y la luna decorativas, ocultas a lectores de pantalla', () => {
    render(<EditorialHero />);

    const stars = screen.getAllByTestId('home-hero-star');
    expect(stars.length).toBeGreaterThanOrEqual(6);
    stars.forEach((star) => expect(star).toHaveAttribute('aria-hidden', 'true'));
    expect(screen.getByTestId('home-hero-moon')).toHaveAttribute('aria-hidden', 'true');
  });

  it('el h1 va a dos tonos: el remate en dorado con shimmer, sin cambiar el copy', () => {
    render(<EditorialHero />);

    const h1 = screen.getByRole('heading', { level: 1 });
    const accent = within(h1).getByText(HOME_EDITORIAL.hero.titleAccent);
    expect(accent).toHaveClass('animate-shimmer-gold');
    expect(h1).toHaveTextContent(HOME_EDITORIAL.hero.title);
  });

  it('la píldora del eyebrow y los chips llevan icono, no emoji', () => {
    render(<EditorialHero />);

    expect(screen.getByTestId('home-hero-eyebrow')).toHaveTextContent(HOME_EDITORIAL.hero.eyebrow);
    const chips = screen.getAllByTestId('home-hero-chip');
    expect(chips.map((chip) => chip.textContent?.trim())).toEqual(HOME_EDITORIAL.hero.highlights);
    chips.forEach((chip) => expect(chip.querySelector('svg')).not.toBeNull());
  });

  it('un único CTA, editorial, que ancla al horóscopo de hoy', () => {
    render(<EditorialHero />);

    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveTextContent(HOME_EDITORIAL.hero.ctaLabel);
    expect(links[0]).toHaveAttribute('href', `#${HOME_EDITORIAL.horoscope.anchorId}`);
  });
});
