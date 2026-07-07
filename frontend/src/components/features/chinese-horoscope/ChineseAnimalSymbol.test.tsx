import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { ChineseZodiacAnimal } from '@/types/chinese-horoscope.types';

import { ChineseAnimalSymbol } from './ChineseAnimalSymbol';

describe('ChineseAnimalSymbol', () => {
  it('should render an accessible image with role="img" and the label', () => {
    render(<ChineseAnimalSymbol animal={ChineseZodiacAnimal.RAT} label="Rata" />);

    expect(screen.getByRole('img', { name: 'Rata' })).toBeInTheDocument();
  });

  it('should render an inline svg', () => {
    render(<ChineseAnimalSymbol animal={ChineseZodiacAnimal.DRAGON} label="Dragón" />);

    const el = screen.getByRole('img', { name: 'Dragón' });
    expect(el.tagName.toLowerCase()).toBe('svg');
  });

  it('should inherit color via currentColor (monochrome, colorable with text-primary)', () => {
    render(<ChineseAnimalSymbol animal={ChineseZodiacAnimal.TIGER} label="Tigre" />);

    const el = screen.getByRole('img', { name: 'Tigre' });
    expect(el.getAttribute('stroke')).toBe('currentColor');
    expect(el.getAttribute('fill')).toBe('none');
  });

  it('should apply the lila/primary color class', () => {
    render(<ChineseAnimalSymbol animal={ChineseZodiacAnimal.OX} label="Buey" />);

    expect(screen.getByRole('img', { name: 'Buey' })).toHaveClass('text-primary');
  });

  it('should merge additional className', () => {
    render(
      <ChineseAnimalSymbol
        animal={ChineseZodiacAnimal.HORSE}
        label="Caballo"
        className="text-6xl"
      />
    );

    const el = screen.getByRole('img', { name: 'Caballo' });
    expect(el).toHaveClass('text-6xl');
    expect(el).toHaveClass('text-primary');
  });

  it('should keep text-primary even when className passes a conflicting text color', () => {
    render(
      <ChineseAnimalSymbol
        animal={ChineseZodiacAnimal.PIG}
        label="Cerdo"
        className="text-red-500"
      />
    );

    const el = screen.getByRole('img', { name: 'Cerdo' });
    expect(el).toHaveClass('text-primary');
    expect(el).not.toHaveClass('text-red-500');
  });

  it('should scale with the font-size (1em) so text-size utilities control its size', () => {
    render(<ChineseAnimalSymbol animal={ChineseZodiacAnimal.MONKEY} label="Mono" />);

    const el = screen.getByRole('img', { name: 'Mono' });
    expect(el.getAttribute('width')).toBe('1em');
    expect(el.getAttribute('height')).toBe('1em');
  });

  it('should render a distinct glyph for every one of the 12 animals', () => {
    const animals = Object.values(ChineseZodiacAnimal);
    expect(animals).toHaveLength(12);

    const markups = new Set<string>();
    for (const animal of animals) {
      const { unmount } = render(<ChineseAnimalSymbol animal={animal} label={animal} />);
      const el = screen.getByRole('img', { name: animal });
      // Each animal must contribute at least one drawn shape...
      expect(
        el.querySelectorAll('path, circle, ellipse, line, polyline, polygon').length
      ).toBeGreaterThan(0);
      // ...and its glyph must differ from every other animal's.
      markups.add(el.innerHTML);
      unmount();
    }
    expect(markups.size).toBe(animals.length);
  });
});
