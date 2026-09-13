import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { BRAND_ICON_SIZES } from '@/components/ui/brand-icon';
import { ZODIAC_SIGNS_INFO } from '@/lib/utils/zodiac';
import { ZodiacSign } from '@/types/horoscope.types';
import { ZodiacSymbol } from './ZodiacSymbol';

const src = (img: HTMLElement) => decodeURIComponent(img.getAttribute('src') ?? '');

describe('ZodiacSymbol (T-UI-12: asset de marca en lugar del glifo Unicode)', () => {
  it('renderiza el icono de marca del signo con role="img" y el nombre', () => {
    render(<ZodiacSymbol sign={ZodiacSign.ARIES} label="Aries" />);

    const img = screen.getByRole('img', { name: 'Aries' });
    expect(src(img)).toContain('/images/icons/zodiac/aries.webp');
    expect(img).not.toHaveTextContent('♈');
  });

  it('resuelve los 12 signos de ZODIAC_SIGNS_INFO a su asset', () => {
    for (const info of Object.values(ZODIAC_SIGNS_INFO)) {
      const { unmount } = render(<ZodiacSymbol sign={info.sign} label={info.nameEs} />);
      expect(src(screen.getByRole('img', { name: info.nameEs }))).toContain(
        `/images/icons/zodiac/${info.sign}.webp`
      );
      unmount();
    }
  });

  it('acepta size y sin él es md', () => {
    const { rerender } = render(<ZodiacSymbol sign={ZodiacSign.VIRGO} label="Virgo" size="sm" />);
    expect(screen.getByRole('img')).toHaveAttribute('width', String(BRAND_ICON_SIZES.sm));

    rerender(<ZodiacSymbol sign={ZodiacSign.VIRGO} label="Virgo" />);
    expect(screen.getByRole('img')).toHaveAttribute('width', String(BRAND_ICON_SIZES.md));
  });

  it('acepta el signo de la carta natal (mismos valores que el enum del horóscopo)', () => {
    render(<ZodiacSymbol sign="scorpio" label="Escorpio" />);

    expect(src(screen.getByRole('img', { name: 'Escorpio' }))).toContain(
      '/images/icons/zodiac/scorpio.webp'
    );
  });

  it('conserva las clases de layout del consumidor', () => {
    render(<ZodiacSymbol sign={ZodiacSign.LIBRA} label="Libra" className="mx-auto" />);

    expect(screen.getByRole('img')).toHaveClass('mx-auto');
  });

  it('con decorative se oculta a lectores de pantalla', () => {
    const { container } = render(<ZodiacSymbol sign={ZodiacSign.LEO} label="Leo" decorative />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(container.querySelector('img')).toHaveAttribute('aria-hidden', 'true');
  });
});
