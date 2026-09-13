import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { BrandIcon, BRAND_ICON_SIZES } from './brand-icon';

describe('BrandIcon', () => {
  it('renderiza la imagen del registro con role="img" y el alt en español', () => {
    render(<BrandIcon family="zodiac" name="aries" />);

    const img = screen.getByRole('img', { name: 'Aries' });
    expect(img).toBeInTheDocument();
    // next/image codifica el src en /_next/image?url=…
    expect(decodeURIComponent(img.getAttribute('src') ?? '')).toContain(
      '/images/icons/zodiac/aries.webp'
    );
  });

  it('permite sobreescribir la etiqueta accesible', () => {
    render(<BrandIcon family="zodiac" name="aries" label="Tu signo: Aries" />);

    expect(screen.getByRole('img', { name: 'Tu signo: Aries' })).toBeInTheDocument();
  });

  it('con decorative se oculta a lectores de pantalla', () => {
    const { container } = render(<BrandIcon family="chinese" name="dragon" decorative />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    const img = container.querySelector('img');
    expect(img).toHaveAttribute('aria-hidden', 'true');
    expect(img).toHaveAttribute('alt', '');
  });

  it('usa el tamaño md por defecto y respeta size', () => {
    const { rerender } = render(<BrandIcon family="suits" name="cups" />);
    let img = screen.getByRole('img');
    expect(img).toHaveAttribute('width', String(BRAND_ICON_SIZES.md));
    expect(img).toHaveAttribute('height', String(BRAND_ICON_SIZES.md));

    rerender(<BrandIcon family="suits" name="cups" size="lg" />);
    img = screen.getByRole('img');
    expect(img).toHaveAttribute('width', String(BRAND_ICON_SIZES.lg));
    expect(img).toHaveAttribute('height', String(BRAND_ICON_SIZES.lg));
  });

  it('los tamaños crecen de sm a xl (equivalentes a text-xl → hero)', () => {
    expect(BRAND_ICON_SIZES.sm).toBeLessThan(BRAND_ICON_SIZES.md);
    expect(BRAND_ICON_SIZES.md).toBeLessThan(BRAND_ICON_SIZES.lg);
    expect(BRAND_ICON_SIZES.lg).toBeLessThan(BRAND_ICON_SIZES.xl);
    expect(BRAND_ICON_SIZES.xl).toBeLessThan(BRAND_ICON_SIZES['2xl']);
  });

  it('es lazy por defecto y acepta priority para above-the-fold', () => {
    const { rerender } = render(<BrandIcon family="hubs" name="tarot" />);
    expect(screen.getByRole('img')).toHaveAttribute('loading', 'lazy');

    rerender(<BrandIcon family="hubs" name="tarot" priority />);
    expect(screen.getByRole('img')).not.toHaveAttribute('loading', 'lazy');
  });

  it('acepta className y data-testid', () => {
    render(<BrandIcon family="areas" name="love" className="mx-auto" data-testid="icono-amor" />);

    const img = screen.getByTestId('icono-amor');
    expect(img).toHaveClass('mx-auto');
  });
});
