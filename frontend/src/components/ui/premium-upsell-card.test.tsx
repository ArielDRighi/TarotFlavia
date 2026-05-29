import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PremiumUpsellCard } from './premium-upsell-card';

describe('PremiumUpsellCard', () => {
  it('should render title', () => {
    render(
      <PremiumUpsellCard
        title="Desbloquea el calendario completo"
        description="Accede a todos los eventos."
        href="/premium"
        ctaLabel="Mejorar a Premium"
      />
    );
    expect(screen.getByText('Desbloquea el calendario completo')).toBeInTheDocument();
  });

  it('should render description', () => {
    render(
      <PremiumUpsellCard
        title="Título"
        description="Descripción del upsell"
        href="/premium"
        ctaLabel="Obtener Premium"
      />
    );
    expect(screen.getByText('Descripción del upsell')).toBeInTheDocument();
  });

  it('should render CTA link with correct href', () => {
    render(
      <PremiumUpsellCard
        title="Título"
        description="Descripción"
        href="/premium"
        ctaLabel="Mejorar a Premium"
      />
    );
    const link = screen.getByRole('link', { name: /mejorar a premium/i });
    expect(link).toHaveAttribute('href', '/premium');
  });

  it('should render with data-testid', () => {
    render(
      <PremiumUpsellCard
        title="Título"
        description="Descripción"
        href="/premium"
        ctaLabel="CTA"
        data-testid="premium-upsell"
      />
    );
    expect(screen.getByTestId('premium-upsell')).toBeInTheDocument();
  });

  it('should render custom icon when provided', () => {
    render(
      <PremiumUpsellCard
        title="Título"
        description="Descripción"
        href="/premium"
        ctaLabel="CTA"
        icon={<span data-testid="custom-icon">★</span>}
      />
    );
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });
});
