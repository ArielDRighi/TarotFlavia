import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { BRAND_ICON_SIZES } from '@/components/ui/brand-icon';
import { CHINESE_ZODIAC_INFO } from '@/lib/utils/chinese-zodiac';
import { ChineseZodiacAnimal } from '@/types/chinese-horoscope.types';
import { ChineseAnimalSymbol } from './ChineseAnimalSymbol';

const src = (img: HTMLElement) => decodeURIComponent(img.getAttribute('src') ?? '');

describe('ChineseAnimalSymbol (T-UI-12: asset de marca en lugar del SVG a mano)', () => {
  it('renderiza el icono de marca del animal con role="img" y el nombre', () => {
    render(<ChineseAnimalSymbol animal={ChineseZodiacAnimal.RAT} label="Rata" />);

    const img = screen.getByRole('img', { name: 'Rata' });
    expect(img.tagName.toLowerCase()).toBe('img');
    expect(src(img)).toContain('/images/icons/chinese/rat.webp');
  });

  it('resuelve los 12 animales a su asset', () => {
    for (const info of Object.values(CHINESE_ZODIAC_INFO)) {
      const { unmount } = render(<ChineseAnimalSymbol animal={info.animal} label={info.nameEs} />);
      expect(src(screen.getByRole('img', { name: info.nameEs }))).toContain(
        `/images/icons/chinese/${info.animal}.webp`
      );
      unmount();
    }
  });

  it('acepta size y sin él es md', () => {
    const { rerender } = render(
      <ChineseAnimalSymbol animal={ChineseZodiacAnimal.OX} label="Buey" size="sm" />
    );
    expect(screen.getByRole('img')).toHaveAttribute('width', String(BRAND_ICON_SIZES.sm));

    rerender(<ChineseAnimalSymbol animal={ChineseZodiacAnimal.OX} label="Buey" />);
    expect(screen.getByRole('img')).toHaveAttribute('width', String(BRAND_ICON_SIZES.md));
  });

  it('con decorative se oculta a lectores de pantalla', () => {
    const { container } = render(
      <ChineseAnimalSymbol animal={ChineseZodiacAnimal.DRAGON} label="Dragón" decorative />
    );

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(container.querySelector('img')).toHaveAttribute('aria-hidden', 'true');
  });

  it('conserva las clases de layout del consumidor', () => {
    render(
      <ChineseAnimalSymbol
        animal={ChineseZodiacAnimal.PIG}
        label="Cerdo"
        className="mx-auto mr-1"
      />
    );

    expect(screen.getByRole('img')).toHaveClass('mx-auto', 'mr-1');
  });
});
