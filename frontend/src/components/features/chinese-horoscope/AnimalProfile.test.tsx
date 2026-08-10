/**
 * AnimalProfile - Tests (T-SEO-002)
 *
 * La ficha estática del animal es el contenido indexable de
 * `/horoscopo-chino/[animal]`: se renderiza en el servidor, sin API ni query
 * string. Los tests miden el texto que llega al HTML, que es exactamente lo que
 * mide `npm run check:indexable`.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { AnimalProfile } from './AnimalProfile';
import { CHINESE_ZODIAC_PROFILES } from '@/lib/constants/chinese-zodiac-profiles.data';
import { CHINESE_ZODIAC_INFO, getAnimalBirthYears } from '@/lib/utils/chinese-zodiac';
import { ChineseZodiacAnimal } from '@/types/chinese-horoscope.types';

const ANIMALS = Object.values(ChineseZodiacAnimal);

/** Palabras del texto renderizado, con el mismo criterio del script de SEO. */
function renderedWordCount(container: HTMLElement): number {
  const text = container.textContent ?? '';
  return text.replace(/\s+/g, ' ').trim().split(' ').filter(Boolean).length;
}

describe('AnimalProfile', () => {
  it('renderiza el contenedor con su data-testid', () => {
    render(<AnimalProfile animal={ChineseZodiacAnimal.DRAGON} />);

    expect(screen.getByTestId('animal-profile')).toBeInTheDocument();
  });

  it('usa el nombre del animal como único h1 de la ficha', () => {
    render(<AnimalProfile animal={ChineseZodiacAnimal.DRAGON} />);

    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent('Dragón');
  });

  it.each(ANIMALS)('%s: renderiza más de 150 palabras propias', (animal) => {
    const { container } = render(<AnimalProfile animal={animal} />);

    expect(renderedWordCount(container)).toBeGreaterThan(150);
  });

  it('renderiza los párrafos de introducción y el titular', () => {
    const profile = CHINESE_ZODIAC_PROFILES[ChineseZodiacAnimal.TIGER];
    render(<AnimalProfile animal={ChineseZodiacAnimal.TIGER} />);

    expect(screen.getByText(profile.tagline)).toBeInTheDocument();
    profile.intro.forEach((paragraph) => {
      expect(screen.getByText(paragraph)).toBeInTheDocument();
    });
  });

  it('renderiza los rasgos de personalidad, fortalezas y desafíos', () => {
    const profile = CHINESE_ZODIAC_PROFILES[ChineseZodiacAnimal.RAT];
    render(<AnimalProfile animal={ChineseZodiacAnimal.RAT} />);

    profile.personality.forEach((trait) => {
      expect(screen.getByText(new RegExp(trait.term))).toBeInTheDocument();
    });
    profile.strengths.forEach((strength) => {
      expect(screen.getByText(strength)).toBeInTheDocument();
    });
    profile.challenges.forEach((challenge) => {
      expect(screen.getByText(challenge)).toBeInTheDocument();
    });
  });

  it('renderiza los textos de amor y de trabajo', () => {
    const profile = CHINESE_ZODIAC_PROFILES[ChineseZodiacAnimal.GOAT];
    render(<AnimalProfile animal={ChineseZodiacAnimal.GOAT} />);

    expect(screen.getByText(profile.love)).toBeInTheDocument();
    expect(screen.getByText(profile.career)).toBeInTheDocument();
  });

  it('enlaza a la ficha de cada animal compatible (enlazado interno)', () => {
    const { compatibility } = CHINESE_ZODIAC_PROFILES[ChineseZodiacAnimal.SNAKE];
    render(<AnimalProfile animal={ChineseZodiacAnimal.SNAKE} />);

    [...compatibility.best, ...compatibility.challenging].forEach((partner) => {
      const link = screen.getByRole('link', {
        name: new RegExp(CHINESE_ZODIAC_INFO[partner].nameEs, 'i'),
      });
      expect(link).toHaveAttribute('href', `/horoscopo-chino/${partner}`);
    });
  });

  it('renderiza los años de nacimiento del animal', () => {
    render(<AnimalProfile animal={ChineseZodiacAnimal.HORSE} />);
    const years = getAnimalBirthYears(ChineseZodiacAnimal.HORSE);

    years.forEach((year) => {
      expect(screen.getByText(String(year))).toBeInTheDocument();
    });
  });

  it('renderiza el elemento fijo y los datos de la suerte', () => {
    const profile = CHINESE_ZODIAC_PROFILES[ChineseZodiacAnimal.MONKEY];
    render(<AnimalProfile animal={ChineseZodiacAnimal.MONKEY} />);

    expect(
      screen.getByText(new RegExp(CHINESE_ZODIAC_INFO[ChineseZodiacAnimal.MONKEY].element))
    ).toBeInTheDocument();
    expect(screen.getByText(new RegExp(profile.luck.direction, 'i'))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(profile.luck.numbers.join(', ')))).toBeInTheDocument();
  });

  it('advierte que el año chino empieza con el Año Nuevo Chino', () => {
    render(<AnimalProfile animal={ChineseZodiacAnimal.PIG} />);

    expect(screen.getByText(/Año Nuevo Chino/i)).toBeInTheDocument();
  });

  it('no renderiza el mismo texto para dos animales distintos', () => {
    const { container: rat } = render(<AnimalProfile animal={ChineseZodiacAnimal.RAT} />);
    const ratText = rat.textContent;
    const { container: ox } = render(<AnimalProfile animal={ChineseZodiacAnimal.OX} />);

    expect(ox.textContent).not.toBe(ratText);
  });
});
