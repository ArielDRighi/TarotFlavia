import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { EditorialHero } from './EditorialHero';
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
  });
});
