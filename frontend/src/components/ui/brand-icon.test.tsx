import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { BrandIcon, BRAND_ICON_SIZES, BRAND_ICON_MEDALLION_SIZES } from './brand-icon';

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

  it('con frame="medallion" envuelve el icono en un disco cósmico y aviva el dorado', () => {
    render(<BrandIcon family="zodiac" name="aries" size="lg" frame="medallion" />);

    const img = screen.getByRole('img', { name: 'Aries' });
    const medallion = img.parentElement;
    expect(medallion).toHaveClass('brand-icon-medallion');
    expect(medallion).toHaveStyle({
      width: `${BRAND_ICON_MEDALLION_SIZES.lg}px`,
      height: `${BRAND_ICON_MEDALLION_SIZES.lg}px`,
    });
    expect(img).toHaveClass('brightness-[1.35]');
    // el icono ocupa ~78 % del disco
    expect(Number(img.getAttribute('width'))).toBeLessThan(BRAND_ICON_MEDALLION_SIZES.lg);
    expect(Number(img.getAttribute('width'))).toBeGreaterThan(BRAND_ICON_MEDALLION_SIZES.lg * 0.7);
  });

  it('en sm y md el medallón es claro y el dorado no se aviva', () => {
    render(<BrandIcon family="areas" name="love" size="md" frame="medallion" />);

    const img = screen.getByRole('img', { name: 'Amor' });
    expect(img.parentElement).toHaveClass('brand-icon-medallion-light');
    expect(img.parentElement).not.toHaveClass('brand-icon-medallion');
    expect(img).not.toHaveClass('brightness-[1.35]');
  });

  it('el medallón es decorativo cuando el icono lo es', () => {
    const { container } = render(
      <BrandIcon
        family="zodiac"
        name="aries"
        size="lg"
        frame="medallion"
        decorative
        data-testid="x"
      />
    );

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(container.querySelector('.brand-icon-medallion')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByTestId('x')).toHaveClass('brand-icon-medallion');
  });

  it('con un slug que el registro no conoce no renderiza nada (ni rompe)', () => {
    const { container } = render(
      <BrandIcon family="zodiac" name={'ofiuco' as unknown as 'aries'} />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('acepta className y data-testid', () => {
    render(<BrandIcon family="areas" name="love" className="mx-auto" data-testid="icono-amor" />);

    const img = screen.getByTestId('icono-amor');
    expect(img).toHaveClass('mx-auto');
  });
});
