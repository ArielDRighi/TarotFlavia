import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { BRAND_ICON_SIZES } from '@/components/ui/brand-icon';
import { ZODIAC_SIGNS_INFO } from '@/lib/utils/zodiac';
import { ZodiacSign } from '@/types/horoscope.types';
import { ZodiacSymbol } from './ZodiacSymbol';

const src = (img: HTMLElement) => decodeURIComponent(img.getAttribute('src') ?? '');

describe('ZodiacSymbol (T-UI-12: asset de marca en lugar del glifo Unicode)', () => {
  it('renderiza el icono de marca del signo a partir del glifo, con role="img" y el nombre', () => {
    render(<ZodiacSymbol symbol="♈" label="Aries" />);

    const img = screen.getByRole('img', { name: 'Aries' });
    expect(src(img)).toContain('/images/icons/zodiac/aries.webp');
    expect(img).not.toHaveTextContent('♈');
  });

  it('acepta el signo directamente (preferido a resolver por glifo)', () => {
    render(<ZodiacSymbol sign={ZodiacSign.SCORPIO} label="Escorpio" />);

    expect(src(screen.getByRole('img', { name: 'Escorpio' }))).toContain(
      '/images/icons/zodiac/scorpio.webp'
    );
  });

  it('resuelve los 12 glifos de ZODIAC_SIGNS_INFO a su asset', () => {
    for (const info of Object.values(ZODIAC_SIGNS_INFO)) {
      const { unmount } = render(<ZodiacSymbol symbol={info.symbol} label={info.nameEs} />);
      expect(src(screen.getByRole('img', { name: info.nameEs }))).toContain(
        `/images/icons/zodiac/${info.sign}.webp`
      );
      unmount();
    }
  });

  it('deriva el tamaño de la clase de texto que usaban los consumidores', () => {
    const cases: Array<[string, keyof typeof BRAND_ICON_SIZES]> = [
      ['text-base', 'sm'],
      ['text-3xl', 'md'],
      ['text-3xl md:text-4xl', 'lg'],
      ['text-6xl', 'xl'],
    ];
    for (const [className, size] of cases) {
      const { unmount } = render(<ZodiacSymbol symbol="♌" label="Leo" className={className} />);
      expect(screen.getByRole('img')).toHaveAttribute('width', String(BRAND_ICON_SIZES[size]));
      unmount();
    }
  });

  it('size explícito gana sobre la clase de texto, y sin ninguna es md', () => {
    const { rerender } = render(
      <ZodiacSymbol symbol="♍" label="Virgo" className="text-6xl" size="sm" />
    );
    expect(screen.getByRole('img')).toHaveAttribute('width', String(BRAND_ICON_SIZES.sm));

    rerender(<ZodiacSymbol symbol="♍" label="Virgo" />);
    expect(screen.getByRole('img')).toHaveAttribute('width', String(BRAND_ICON_SIZES.md));
  });

  it('conserva las clases de layout del consumidor', () => {
    render(<ZodiacSymbol symbol="♎" label="Libra" className="mx-auto text-6xl" />);

    expect(screen.getByRole('img')).toHaveClass('mx-auto');
  });

  it('con decorative se oculta a lectores de pantalla', () => {
    const { container } = render(<ZodiacSymbol sign={ZodiacSign.LEO} label="Leo" decorative />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(container.querySelector('img')).toHaveAttribute('aria-hidden', 'true');
  });

  it('no renderiza nada con un glifo que no es un signo', () => {
    const { container } = render(<ZodiacSymbol symbol="★" label="Desconocido" />);

    expect(container).toBeEmptyDOMElement();
  });
});
