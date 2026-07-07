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

  it('should use brand tokens (gold/secondary) and no raw purple/pink colors', () => {
    const { container } = render(
      <PremiumUpsellCard
        title="Título"
        description="Descripción"
        href="/premium"
        ctaLabel="CTA"
        data-testid="premium-upsell"
      />
    );
    // El circuito premium quedó en dorado (secondary) tras T-PREM-007:
    // el upsell no debe usar clases crudas purple/pink en ningún elemento.
    expect(container.innerHTML).not.toMatch(/purple|pink|fuchsia|violet/);
    // El contenedor usa el token de marca dorado.
    expect(screen.getByTestId('premium-upsell').className).toMatch(/secondary/);
  });
});
