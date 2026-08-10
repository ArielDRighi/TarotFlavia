/**
 * Tests de los perfiles estáticos del zodiaco chino (T-SEO-002).
 *
 * Estos tests son el guardarraíl de contenido: si alguien recorta un perfil por
 * debajo del mínimo indexable, o duplica texto entre animales, falla acá y no en
 * el próximo rechazo de AdSense.
 */

import { describe, it, expect } from 'vitest';

import {
  CHINESE_ZODIAC_PROFILES,
  MIN_PROFILE_WORDS,
  getChineseZodiacProfile,
  getProfileWordCount,
} from '@/lib/constants/chinese-zodiac-profiles.data';
import { getAnimalBirthYears } from '@/lib/utils/chinese-zodiac';
import { ChineseZodiacAnimal } from '@/types/chinese-horoscope.types';

const ANIMALS = Object.values(ChineseZodiacAnimal);
const CYCLE_LENGTH = 12;

/** El animal opuesto en la rueda de 12: el choque tradicional (6 posiciones). */
function oppositeAnimal(animal: ChineseZodiacAnimal): ChineseZodiacAnimal {
  const index = ANIMALS.indexOf(animal);
  return ANIMALS[(index + CYCLE_LENGTH / 2) % CYCLE_LENGTH];
}

describe('CHINESE_ZODIAC_PROFILES', () => {
  it('tiene un perfil por cada uno de los 12 animales', () => {
    expect(Object.keys(CHINESE_ZODIAC_PROFILES)).toHaveLength(CYCLE_LENGTH);
    ANIMALS.forEach((animal) => {
      expect(CHINESE_ZODIAC_PROFILES[animal]).toBeDefined();
    });
  });

  it.each(ANIMALS)('el perfil de %s tiene todas las secciones pobladas', (animal) => {
    const profile = CHINESE_ZODIAC_PROFILES[animal];

    expect(profile.tagline.length).toBeGreaterThan(10);
    expect(profile.intro).toHaveLength(2);
    profile.intro.forEach((paragraph) => expect(paragraph.length).toBeGreaterThan(80));
    expect(profile.personality.length).toBeGreaterThanOrEqual(3);
    profile.personality.forEach((trait) => {
      expect(trait.term).toBeTruthy();
      expect(trait.description.length).toBeGreaterThan(40);
    });
    expect(profile.strengths.length).toBeGreaterThanOrEqual(3);
    expect(profile.challenges.length).toBeGreaterThanOrEqual(3);
    expect(profile.love.length).toBeGreaterThan(80);
    expect(profile.career.length).toBeGreaterThan(80);
    expect(profile.luck.numbers.length).toBeGreaterThanOrEqual(2);
    expect(profile.luck.colors.length).toBeGreaterThanOrEqual(2);
    expect(profile.luck.direction).toBeTruthy();
  });

  it.each(ANIMALS)(
    `el perfil de %s aporta al menos ${MIN_PROFILE_WORDS} palabras propias`,
    (animal) => {
      expect(getProfileWordCount(animal)).toBeGreaterThanOrEqual(MIN_PROFILE_WORDS);
    }
  );

  it('no repite ningún párrafo entre animales (contenido único por URL)', () => {
    const seen = new Map<string, ChineseZodiacAnimal>();

    ANIMALS.forEach((animal) => {
      const profile = CHINESE_ZODIAC_PROFILES[animal];
      const paragraphs = [
        profile.tagline,
        ...profile.intro,
        profile.love,
        profile.career,
        ...profile.personality.map((trait) => trait.description),
      ];

      paragraphs.forEach((paragraph) => {
        const normalized = paragraph.trim().toLowerCase();
        expect(seen.get(normalized)).toBeUndefined();
        seen.set(normalized, animal);
      });
    });
  });

  describe('compatibilidad', () => {
    it.each(ANIMALS)('%s no se lista como compatible consigo mismo', (animal) => {
      const { best, challenging } = CHINESE_ZODIAC_PROFILES[animal].compatibility;

      expect(best).not.toContain(animal);
      expect(challenging).not.toContain(animal);
    });

    it.each(ANIMALS)('%s no lista un animal como afín y en choque a la vez', (animal) => {
      const { best, challenging } = CHINESE_ZODIAC_PROFILES[animal].compatibility;

      expect(best.filter((candidate) => challenging.includes(candidate))).toEqual([]);
    });

    it.each(ANIMALS)('el choque de %s es su opuesto en la rueda de 12', (animal) => {
      expect(CHINESE_ZODIAC_PROFILES[animal].compatibility.challenging).toContain(
        oppositeAnimal(animal)
      );
    });

    it.each(ANIMALS)('la afinidad de %s es recíproca', (animal) => {
      CHINESE_ZODIAC_PROFILES[animal].compatibility.best.forEach((partner) => {
        expect(CHINESE_ZODIAC_PROFILES[partner].compatibility.best).toContain(animal);
      });
    });
  });
});

describe('getChineseZodiacProfile', () => {
  it('devuelve el perfil del animal pedido', () => {
    const profile = getChineseZodiacProfile(ChineseZodiacAnimal.DRAGON);

    expect(profile).toBe(CHINESE_ZODIAC_PROFILES[ChineseZodiacAnimal.DRAGON]);
  });
});

describe('getProfileWordCount', () => {
  it('cuenta las palabras de todas las secciones de texto', () => {
    const count = getProfileWordCount(ChineseZodiacAnimal.RAT);
    const profile = CHINESE_ZODIAC_PROFILES[ChineseZodiacAnimal.RAT];
    const introWords = profile.intro.join(' ').trim().split(/\s+/).length;

    expect(count).toBeGreaterThan(introWords);
  });
});

describe('coherencia con los años del calendario chino', () => {
  it.each(ANIMALS)('los años de %s salen del helper compartido', (animal) => {
    // El perfil no duplica la lista de años: la ficha la pide al helper, que ya
    // está testeado. Este test documenta el contrato para que no se hardcodee.
    expect(getAnimalBirthYears(animal).length).toBeGreaterThanOrEqual(7);
  });
});
